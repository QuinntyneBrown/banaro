<?php

// Acceptance Test
// Traces to: L2-008, L2-044, L2-045, L2-046
// Description:
// Given a JPEG, PNG or WebP of at most 5 MB and at least 480 × 480 px, when a member uploads it with a
// square crop, then a 480 × 480 px WebP without metadata is stored in quarantine, scanned by the
// worker, and only then shown as their photo, replacing and deleting any previous one.
// Given a file of another type, over 5 MB, under 480 px, whose content does not match its name, or a
// crop outside the image, when uploaded, then it is rejected with 422 naming the problem and nothing
// is stored. Given a file the scanner rejects or cannot scan, then it is deleted and the previous
// photo stays. Given a member with a photo, when they remove it, then the file is deleted and the
// profile has no photo. No member reaches another's upload, uploads are throttled, and readiness
// fails in production while the development scanner is bound.

namespace Tests\Feature\Profiles;

use App\Contracts\MediaScanner;
use App\Enums\ScanVerdict;
use App\Jobs\Profiles\ScanProfilePhoto;
use App\Models\Builder;
use App\Models\Neighbourhood;
use App\Models\ProfilePhoto;
use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class ProfilePhotoTest extends TestCase
{
    use RefreshDatabase;

    private User $member;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
        Storage::fake('media');
        $this->member = $this->builderMember('Amara Osei');
    }

    private function builderMember(string $name): User
    {
        $user = User::factory()->create(['name' => $name]);
        Builder::create([
            'user_id' => $user->id,
            'name' => $name,
            'role' => 'founder',
            'neighbourhood_id' => Neighbourhood::where('slug', 'leslieville')->value('id'),
            'onboarding_saved_steps' => ['about', 'skills', 'goals'],
            'onboarding_completed_at' => now(),
        ]);

        return $user;
    }

    /** Encodes a solid image with GD in the given format. */
    private function image(string $format, int $width, int $height): string
    {
        $canvas = imagecreatetruecolor($width, $height);
        imagefill($canvas, 0, 0, imagecolorallocate($canvas, 200, 120, 40));
        ob_start();
        match ($format) {
            'jpeg' => imagejpeg($canvas),
            'png' => imagepng($canvas),
            'webp' => imagewebp($canvas),
            'gif' => imagegif($canvas),
        };

        return (string) ob_get_clean();
    }

    /** A JPEG carrying an APP1 Exif segment with GPS coordinates, as phone cameras write them. */
    private function jpegWithGps(int $size): string
    {
        $jpeg = $this->image('jpeg', $size, $size);
        $payload = "Exif\0\0GPSLatitude 43.6629 GPSLongitude -79.3957";
        $segment = "\xFF\xE1".pack('n', strlen($payload) + 2).$payload;

        return substr($jpeg, 0, 2).$segment.substr($jpeg, 2);
    }

    private function file(string $name, string $contents): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, $contents);
    }

    /** @param  array<string, int>  $crop */
    private function upload(UploadedFile $photo, array $crop = ['x' => 0, 'y' => 0, 'size' => 480], ?User $as = null)
    {
        return $this->actingAs($as ?? $this->member)
            ->post('/api/v1/me/photo', ['photo' => $photo, 'crop' => $crop], ['Accept' => 'application/json']);
    }

    private function scanAll(): void
    {
        foreach (ProfilePhoto::where('status', 'pending')->get() as $photo) {
            app()->call([new ScanProfilePhoto($photo->id), 'handle']);
        }
    }

    private function builder(?User $user = null): Builder
    {
        return ($user ?? $this->member)->builder()->firstOrFail();
    }

    public function test_a_valid_upload_is_quarantined_scanned_and_then_becomes_the_photo(): void
    {
        Queue::fake();

        $response = $this->upload($this->file('amara.jpg', $this->image('jpeg', 800, 600)), ['x' => 100, 'y' => 50, 'size' => 500]);

        $response->assertStatus(202)->assertJson(['status' => 'pending', 'url' => null]);
        $id = $response->json('id');
        Queue::assertPushed(ScanProfilePhoto::class, fn (ScanProfilePhoto $job) => $job->photoId === $id);
        $photo = ProfilePhoto::findOrFail($id);
        $this->assertStringStartsWith('quarantine/', $photo->path);
        Storage::disk('media')->assertExists($photo->path);
        $this->assertNull($this->builder()->photo_id);
        $this->get("/api/v1/photos/{$id}")->assertNotFound();

        $this->scanAll();

        $photo->refresh();
        $this->assertSame('ready', $photo->status->value);
        $this->assertStringStartsWith('photos/', $photo->path);
        Storage::disk('media')->assertMissing("quarantine/{$id}.webp");
        $this->assertSame($id, $this->builder()->photo_id);
        $this->actingAs($this->member)->getJson("/api/v1/me/photo/{$id}")
            ->assertOk()->assertJson(['id' => $id, 'status' => 'ready', 'url' => "/api/v1/photos/{$id}"]);
        $this->actingAs($this->member)->getJson('/api/v1/me/profile')->assertJson(['photo_url' => "/api/v1/photos/{$id}"]);

        $served = $this->get("/api/v1/photos/{$id}");
        $served->assertOk()->assertHeader('Content-Type', 'image/webp');
        $size = getimagesizefromstring($served->streamedContent());
        $this->assertSame([480, 480, IMAGETYPE_WEBP], [$size[0], $size[1], $size[2]]);
    }

    public function test_the_session_names_the_photo_so_the_header_can_show_it(): void
    {
        Queue::fake();
        $this->actingAs($this->member)->getJson('/api/v1/session')->assertJsonPath('member.photo_url', null);

        $id = $this->upload($this->file('a.jpg', $this->image('jpeg', 480, 480)))->json('id');
        $this->scanAll();

        $this->actingAs($this->member)->getJson('/api/v1/session')->assertJsonPath('member.photo_url', "/api/v1/photos/{$id}");
    }

    public function test_png_and_webp_are_accepted(): void
    {
        Queue::fake();

        $this->upload($this->file('a.png', $this->image('png', 480, 480)))->assertStatus(202);
        $this->upload($this->file('b.webp', $this->image('webp', 640, 480)))->assertStatus(202);
    }

    public function test_metadata_including_gps_is_stripped(): void
    {
        Queue::fake();

        $id = $this->upload($this->file('phone.jpg', $this->jpegWithGps(600)))->assertStatus(202)->json('id');

        $stored = Storage::disk('media')->get(ProfilePhoto::findOrFail($id)->path);
        $this->assertStringNotContainsString('Exif', $stored);
        $this->assertStringNotContainsString('GPS', $stored);
    }

    public function test_invalid_files_are_rejected_with_the_problem_named_and_nothing_stored(): void
    {
        Queue::fake();
        $heicAsJpeg = "\x00\x00\x00\x18ftypheic\x00\x00\x00\x00mif1heic".str_repeat("\x00", 2048);
        $cases = [
            'another type' => [$this->file('cat.gif', $this->image('gif', 600, 600)), 'Choose a JPEG, PNG or WebP image.'],
            'content does not match its name' => [$this->file('holiday.jpg', $heicAsJpeg), 'Choose a JPEG, PNG or WebP image.'],
            'name does not match its content' => [$this->file('photo.png', $this->image('jpeg', 600, 600)), "That file's name doesn't match what's inside it. Choose a JPEG, PNG or WebP image."],
            'too small' => [$this->file('small.jpg', $this->image('jpeg', 479, 900)), 'Choose an image at least 480 × 480 pixels.'],
            'too large' => [UploadedFile::fake()->create('huge.jpg', 5 * 1024 + 1, 'image/jpeg'), 'Choose an image of 5 MB or less.'],
        ];

        foreach ($cases as $case => [$file, $message]) {
            $this->upload($file)->assertStatus(422)->assertJsonPath('errors.photo.0', $message, $case);
        }

        $this->upload($this->file('a.jpg', $this->image('jpeg', 600, 600)), ['x' => 200, 'y' => 0, 'size' => 480])
            ->assertStatus(422)->assertJsonPath('errors.crop.0', 'Choose a square inside the image, at least 480 pixels wide.');
        $this->upload($this->file('a.jpg', $this->image('jpeg', 600, 600)), ['x' => 0, 'y' => 0, 'size' => 400])
            ->assertStatus(422)->assertJsonValidationErrors('crop');

        $this->assertSame(0, ProfilePhoto::count());
        $this->assertSame([], Storage::disk('media')->allFiles());
        Queue::assertNothingPushed();
    }

    public function test_a_rejected_scan_deletes_the_file_and_keeps_the_previous_photo(): void
    {
        Queue::fake();
        $first = $this->upload($this->file('a.jpg', $this->image('jpeg', 480, 480)))->json('id');
        $this->scanAll();
        $this->app->instance(MediaScanner::class, new class implements MediaScanner
        {
            public function scan(string $contents): ScanVerdict
            {
                return ScanVerdict::Infected;
            }
        });

        $second = $this->upload($this->file('b.jpg', $this->image('jpeg', 480, 480)))->json('id');
        $path = ProfilePhoto::findOrFail($second)->path;
        $this->scanAll();

        $this->assertSame('rejected', ProfilePhoto::findOrFail($second)->status->value);
        Storage::disk('media')->assertMissing($path);
        $this->assertSame($first, $this->builder()->photo_id);
        $this->get("/api/v1/photos/{$second}")->assertNotFound();
        $this->actingAs($this->member)->getJson("/api/v1/me/photo/{$second}")->assertJson(['status' => 'rejected', 'url' => null]);
    }

    public function test_a_photo_still_unscanned_after_the_last_attempt_is_rejected(): void
    {
        Queue::fake();
        $id = $this->upload($this->file('a.jpg', $this->image('jpeg', 480, 480)))->json('id');
        $path = ProfilePhoto::findOrFail($id)->path;

        $job = new ScanProfilePhoto($id);
        $this->assertSame(3, $job->tries);
        $job->failed(new RuntimeException('Scanner unreachable'));

        $this->assertSame('rejected', ProfilePhoto::findOrFail($id)->status->value);
        Storage::disk('media')->assertMissing($path);
        $this->assertNull($this->builder()->photo_id);
    }

    public function test_a_new_photo_replaces_and_deletes_the_previous_one(): void
    {
        Queue::fake();
        $first = $this->upload($this->file('a.jpg', $this->image('jpeg', 480, 480)))->json('id');
        $this->scanAll();
        $firstPath = ProfilePhoto::findOrFail($first)->path;

        $second = $this->upload($this->file('b.png', $this->image('png', 480, 480)))->json('id');
        $this->scanAll();

        $this->assertSame($second, $this->builder()->photo_id);
        $this->assertNull(ProfilePhoto::find($first));
        Storage::disk('media')->assertMissing($firstPath);
        $this->get("/api/v1/photos/{$first}")->assertNotFound();
    }

    public function test_removing_the_photo_deletes_the_file_and_shows_initials_again(): void
    {
        Queue::fake();
        $id = $this->upload($this->file('a.jpg', $this->image('jpeg', 480, 480)))->json('id');
        $this->scanAll();
        $path = ProfilePhoto::findOrFail($id)->path;

        $this->actingAs($this->member)->deleteJson('/api/v1/me/photo')->assertNoContent();

        $this->assertNull($this->builder()->photo_id);
        $this->assertNull(ProfilePhoto::find($id));
        Storage::disk('media')->assertMissing($path);
        $this->actingAs($this->member)->getJson('/api/v1/me/profile')->assertJson(['photo_url' => null]);
        $this->get("/api/v1/photos/{$id}")->assertNotFound();
    }

    public function test_no_member_reaches_another_members_upload(): void
    {
        Queue::fake();
        $other = $this->builderMember('Daniel Reyes');
        $id = $this->upload($this->file('a.jpg', $this->image('jpeg', 480, 480)), as: $other)->json('id');

        $this->actingAs($this->member)->getJson("/api/v1/me/photo/{$id}")->assertNotFound();
        $this->actingAs($this->member)->deleteJson('/api/v1/me/photo')->assertNoContent();
        $this->assertNotNull(ProfilePhoto::find($id));
    }

    public function test_photo_routes_need_a_signed_in_member(): void
    {
        $this->postJson('/api/v1/me/photo')->assertUnauthorized();
        $this->deleteJson('/api/v1/me/photo')->assertUnauthorized();
    }

    public function test_uploads_are_throttled_per_member(): void
    {
        Queue::fake();
        $jpeg = $this->image('jpeg', 480, 480);
        for ($i = 0; $i < 10; $i++) {
            $this->upload($this->file("p{$i}.jpg", $jpeg))->assertStatus(202);
        }

        $this->upload($this->file('one-more.jpg', $jpeg))->assertStatus(429)->assertHeader('Retry-After');
    }

    public function test_readiness_fails_in_production_while_the_development_scanner_is_bound(): void
    {
        $this->get('/health/ready')->assertOk();

        $this->app['env'] = 'production';

        $this->get('/health/ready')->assertStatus(503);
    }
}
