<?php

namespace App\Http\Requests\JournalEntry;

use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use App\Models\JournalEntry;
use Illuminate\Foundation\Http\FormRequest;

class CancelJournalEntryRequest extends FormRequest
{
    use AuthorizesCompanyAccess;

    public function authorize(): bool
    {
        /** @var JournalEntry|null $journalEntry */
        $journalEntry = $this->route('journal_entry');

        return $journalEntry !== null && $this->user()?->can('cancel', $journalEntry);
    }

    public function rules(): array
    {
        return [];
    }
}
