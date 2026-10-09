<?php

// Acceptance Test
// Traces to: L2-053
// Description: Each request writes one JSON log line with its request ID, route, status, duration
// and member ID; unhandled exceptions return a generic 500 carrying only the request ID.

namespace Tests\Feature\Operations;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Monolog\Handler\TestHandler;
use Monolog\LogRecord;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Tests\TestCase;

class RequestLoggingTest extends TestCase
{
    private TestHandler $requests;

    private TestHandler $appLog;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'app.debug' => false,
            'logging.channels.requests' => ['driver' => 'monolog', 'handler' => TestHandler::class],
            'logging.channels.testing' => ['driver' => 'monolog', 'handler' => TestHandler::class],
            'logging.default' => 'testing',
        ]);
        Log::forgetChannel('requests');
        Log::forgetChannel('testing');
        $this->requests = Log::channel('requests')->getLogger()->getHandlers()[0];
        $this->appLog = Log::channel('testing')->getLogger()->getHandlers()[0];

        Route::middleware('api')->prefix('api/v1')->group(function () {
            Route::get('test/things/{thing}', fn () => ['ok' => true])->name('test.things.show');
            Route::get('test/boom', fn () => throw new RuntimeException('database password is hunter2'));
            Route::get('test/missing', fn () => throw new NotFoundHttpException);
        });
    }

    public function test_a_request_writes_one_log_line_and_returns_the_request_id_header(): void
    {
        $response = $this->getJson('/api/v1/test/things/42?email=amara@example.com');

        $response->assertOk();
        $requestId = $response->headers->get('X-Request-Id');
        $this->assertMatchesRegularExpression('/^[A-Za-z0-9-]{8,64}$/', (string) $requestId);

        $this->assertCount(1, $this->requests->getRecords());
        $line = $this->requests->getRecords()[0]->context;
        $this->assertSame($requestId, $line['request_id']);
        $this->assertSame('GET', $line['method']);
        $this->assertSame('test.things.show', $line['route']);
        $this->assertSame(200, $line['status']);
        $this->assertIsNumeric($line['duration_ms']);
        $this->assertArrayHasKey('member_id', $line);
        $this->assertNull($line['member_id']);
        $this->assertStringNotContainsString('amara@example.com', json_encode($this->requests->getRecords()[0]->toArray()));
    }

    public function test_a_valid_incoming_request_id_is_kept(): void
    {
        $response = $this->getJson('/api/v1/test/things/42', ['X-Request-Id' => 'ssr-0123456789abcdef']);

        $response->assertHeader('X-Request-Id', 'ssr-0123456789abcdef');
        $this->assertSame('ssr-0123456789abcdef', $this->requests->getRecords()[0]->context['request_id']);
    }

    public function test_an_invalid_incoming_request_id_is_replaced(): void
    {
        $response = $this->getJson('/api/v1/test/things/42', ['X-Request-Id' => "bad id\r\nInjected: yes"]);

        $this->assertNotSame("bad id\r\nInjected: yes", $response->headers->get('X-Request-Id'));
        $this->assertMatchesRegularExpression('/^[A-Za-z0-9-]{8,64}$/', (string) $response->headers->get('X-Request-Id'));
    }

    public function test_an_unhandled_exception_returns_a_generic_500_with_only_the_request_id(): void
    {
        $response = $this->getJson('/api/v1/test/boom');

        $requestId = $response->headers->get('X-Request-Id');
        $response->assertStatus(500)->assertExactJson(['message' => 'Server Error', 'requestId' => $requestId]);

        $errors = array_values(array_filter(
            $this->appLog->getRecords(),
            fn (LogRecord $r) => $r->level->getName() === 'ERROR',
        ));
        $this->assertCount(1, $errors);
        $this->assertSame($requestId, $this->requestIdOf($errors[0]));
        $this->assertInstanceOf(RuntimeException::class, $errors[0]->context['exception']);
    }

    public function test_the_logged_status_is_the_final_status_after_exception_handling(): void
    {
        $this->getJson('/api/v1/test/boom')->assertStatus(500);
        $this->getJson('/api/v1/test/missing')->assertStatus(404);

        $statuses = array_map(fn (LogRecord $r) => $r->context['status'], $this->requests->getRecords());
        $this->assertSame([500, 404], $statuses);
    }

    private function requestIdOf(LogRecord $record): ?string
    {
        return $record->context['request_id'] ?? $record->extra['request_id'] ?? null;
    }
}
