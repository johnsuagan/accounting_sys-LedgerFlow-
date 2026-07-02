<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalEntryLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_entry_id',
        'account_id',
        'line_number',
        'description',
        'debit',
        'credit',
    ];

    protected function casts(): array
    {
        return [
            'line_number' => 'integer',
            'debit' => 'decimal:4',
            'credit' => 'decimal:4',
        ];
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function hasDebit(): bool
    {
        return bccomp((string) $this->debit, '0', 4) === 1;
    }

    public function hasCredit(): bool
    {
        return bccomp((string) $this->credit, '0', 4) === 1;
    }
}
