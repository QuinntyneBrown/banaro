<?php

namespace App\Http\Controllers\Api\V1\Notifications;

use App\Actions\Notifications\CountUnreadNotifications;
use App\Actions\Notifications\ListNotifications;
use App\Actions\Notifications\MarkAllNotificationsRead;
use App\Actions\Notifications\MarkNotificationRead;
use App\Http\Controllers\Controller;
use App\Http\Requests\Notifications\ListNotificationsRequest;
use App\Http\Resources\Notifications\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** The signed-in member's own notifications; no route names another account (L2-027, L2-044). */
class NotificationController extends Controller
{
    public function index(ListNotificationsRequest $request, ListNotifications $list): JsonResponse
    {
        $page = $list->handle($request->user(), $request->page(), $request->perPage());

        return response()->json([
            'items' => NotificationResource::collection($page->items())->resolve($request),
            'total' => $page->total(),
            'page' => $page->currentPage(),
            'per_page' => $page->perPage(),
            'last_page' => $page->lastPage(),
        ]);
    }

    public function unreadCount(Request $request, CountUnreadNotifications $count): JsonResponse
    {
        return response()->json(['count' => $count->handle($request->user())]);
    }

    public function read(Request $request, string $notification, MarkNotificationRead $mark): NotificationResource
    {
        return new NotificationResource($mark->handle($request->user(), $notification));
    }

    public function readAll(Request $request, MarkAllNotificationsRead $markAll): Response
    {
        $markAll->handle($request->user());

        return response()->noContent();
    }
}
