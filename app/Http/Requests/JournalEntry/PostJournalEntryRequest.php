<?php

namespace App\Http\Requests\JournalEntry;

use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use App\Models\JournalEntry;
use App\Rules\BalancedJournalLines;
use Illuminate\Foundation\Http\FormRequest;

class PostJournalEntryRequest extends FormRequest
{
    use AuthorizesCompanyAccess;

    public function authorize(): bool
    {
        /** @var JournalEntry|null $journalEntry */
        $journalEntry = $this->route('journal_entry');

        return $journalEntry !== null && $this->user()?->can('post', $journalEntry);
    }

    public function rules(): array
    {
        return [
            'lines' => ['sometimes', 'array', new BalancedJournalLines],
        ];
    }
}
