<?php

namespace App\Http\Requests\JournalEntry;

use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use App\Models\JournalEntry;
use Illuminate\Foundation\Http\FormRequest;

class UpdateJournalEntryRequest extends FormRequest
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
            'entry_date' => ['sometimes', 'required', 'date'],
            'description' => ['sometimes', 'required', 'string', 'max:255'],
            'reference' => ['nullable', 'string', 'max:100'],
            'memo' => ['nullable', 'string'],
            'lines' => ['sometimes', 'required', 'array', 'min:1'],
            'lines.*.account_id' => ['required_with:lines', 'integer', 'exists:accounts,id'],
            'lines.*.line_number' => ['required_with:lines', 'integer', 'min:1'],
            'lines.*.description' => ['nullable', 'string', 'max:255'],
            'lines.*.debit' => ['required_with:lines', 'numeric', 'min:0'],
            'lines.*.credit' => ['required_with:lines', 'numeric', 'min:0'],
        ];
    }
}
