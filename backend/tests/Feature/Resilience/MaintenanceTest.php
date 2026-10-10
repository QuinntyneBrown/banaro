<?php

// Acceptance Test
// Traces to: L2-043
// Description: In maintenance mode the API answers 503 with Retry-After and the expected time back,
// health and the translation catalogue still answer, and the worker runs no queued jobs.

namespace Tests\Feature\Resilience;

use App\Actions\PublicSite\ContactMessageData;
use App\Enums\ContactTopic;
use App\Jobs\PublicSite\DeliverContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MaintenanceTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        $this->artisan('up');
        parent::tearDown();
    }

    public function test_requests_answer_503_with_retry_after_and_the_expected_time_back(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-10 14:00:00', 'UTC'));
        $this->artisan('down', ['--retry' => 1800])->assertSuccessful();

        $response = $this->postJson('/api/v1/contact-messages', ['name' => 'Amara']);

        $response->assertStatus(503)
            ->assertHeader('Retry-After', '1800')
            ->assertHeader('X-Request-Id')
            ->assertExactJson(['code' => 'maintenance', 'expectedBackAt' => '2026-10-10T14:30:00Z']);
    }

    public function test_health_and_the_translation_catalogue_still_answer(): void
    {
        $this->artisan('down', ['--retry' => 600]);

        $this->getJson('/health/live')->assertOk();
        $this->getJson('/health/ready')->assertOk();
        $this->getJson('/api/v1/i18n/en-CA')->assertOk();
    }

    public function test_the_worker_runs_no_jobs_until_maintenance_ends(): void
    {
        config(['queue.default' => 'database']);
        Mail::fake();
        $this->artisan('down', ['--retry' => 600]);

        DeliverContactMessage::dispatch(new ContactMessageData('Amara Osei', 'amara@harvest.example', ContactTopic::General, 'Hello from the tests.', false));
        $this->artisan('queue:work', ['connection' => 'database', '--queue' => 'mail', '--once' => true]);

        $this->assertSame(1, DB::table('jobs')->count());
        Mail::assertNothingSent();

        $this->artisan('up');
        $this->artisan('queue:work', ['connection' => 'database', '--queue' => 'mail', '--once' => true]);

        $this->assertSame(0, DB::table('jobs')->count());
    }
}
