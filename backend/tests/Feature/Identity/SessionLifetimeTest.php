<?php

// Acceptance Test
// Traces to: L2-005
// Description: A session expires after 30 days without activity and, however active, 90 days after
// sign-in; a request without a session answers 401 with code `unauthenticated`, which the app turns
// into the session-expired dialog.

namespace Tests\Feature\Identity;

use App\Models\User;
use App\Services\Identity\PasswordPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class SessionLifetimeTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    /** The session cookie as a browser would hold it between requests. */
    private ?string $sessionCookie = null;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        // A store that keeps sessions between requests and times them by the test clock.
        config(['session.driver' => 'database']);
        $this->user = User::factory()->create([
            'email' => 'amara@harvest.example',
            'password' => PasswordPolicy::hash('harvest-volunteers-2026'),
        ]);
        $this->browser('post', '/api/v1/session', ['email' => 'amara@harvest.example', 'password' => 'harvest-volunteers-2026'])
            ->assertOk();
    }

    /** One request from the same browser: the session comes only from the cookie, never from memory. */
    private function browser(string $method, string $uri, array $data = []): TestResponse
    {
        $this->app['auth']->forgetGuards();
        $this->app['session']->forgetDrivers();
        $this->app->forgetInstance('session.store');
        if ($this->sessionCookie !== null) {
            $this->withCredentials()->withCookie(config('session.cookie'), $this->sessionCookie);
        }

        $response = $this->json($method, $uri, $data);
        $cookie = $response->getCookie(config('session.cookie'));
        if ($cookie !== null) {
            $this->sessionCookie = $cookie->getValue();
        }

        return $response;
    }

    private function signedIn(): bool
    {
        return $this->browser('get', '/api/v1/session')->json('member.id') === $this->user->id;
    }

    public function test_activity_within_30_days_keeps_the_session(): void
    {
        Carbon::setTestNow(now()->addDays(29));

        $this->assertTrue($this->signedIn());
    }

    public function test_30_days_without_activity_end_the_session(): void
    {
        Carbon::setTestNow(now()->addDays(30)->addMinute());

        $this->assertFalse($this->signedIn());
    }

    public function test_an_active_session_ends_90_days_after_sign_in(): void
    {
        $signedInAt = now();
        foreach ([25, 50, 75] as $day) {
            Carbon::setTestNow($signedInAt->copy()->addDays($day));
            $this->assertTrue($this->signedIn(), "still signed in on day {$day}");
        }

        // Only 16 days idle, but 91 days since sign-in.
        Carbon::setTestNow($signedInAt->copy()->addDays(91));

        $this->assertFalse($this->signedIn());
    }

    public function test_a_member_route_without_a_session_answers_401_with_a_code(): void
    {
        $this->browser('delete', '/api/v1/session')->assertNoContent();

        $this->browser('delete', '/api/v1/session')
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'unauthenticated', 'message' => 'Your session has expired.']);
    }
}
