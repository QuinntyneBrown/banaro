<?php

namespace App\Http\Requests\Notifications;

use App\Http\Requests\Concerns\PaginatesResults;
use Illuminate\Foundation\Http\FormRequest;

/** A page of the member's own notifications (L2-027 criterion 1). */
class ListNotificationsRequest extends FormRequest
{
    use PaginatesResults;

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return $this->paginationRules();
    }
}
