<?php

namespace App\Http\Requests\JournalEntryAttachment;

use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use App\Models\JournalEntry;
use Illuminate\Foundation\Http\FormRequest;

class StoreJournalEntryAttachmentRequest extends FormRequest
{
    use AuthorizesCompanyAccess;

    public function authorize(): bool
    {
        /** @var JournalEntry|null $journalEntry */
        $journalEntry = $this->route('journal_entry');

        return $journalEntry !== null && $this->user()?->can('update', $journalEntry);
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:10240'],
        ];
    }
}
