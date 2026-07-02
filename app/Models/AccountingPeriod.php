<?php

namespace App\Models;

use App\Enums\AccountingPeriodStatus;
use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountingPeriod extends Model
{
    use BelongsToCompany, HasFactory;

    protected $fillable = [
        'company_id',
        'fiscal_year_id',
        'period_number',
        'is_adjustment_period',
        'name',
        'start_date',
        'end_date',
        'status',
        'closed_at',
        'closed_by',
        'locked_at',
        'locked_by',
    ];

    protected function casts(): array
    {
        return [
            'period_number' => 'integer',
            'is_adjustment_period' => 'boolean',
            'start_date' => 'date',
            'end_date' => 'date',
            'status' => AccountingPeriodStatus::class,
            'closed_at' => 'datetime',
            'locked_at' => 'datetime',
        ];
    }

    public function fiscalYear(): BelongsTo
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function lockedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'locked_by');
    }

    public function journalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class);
    }

    public function isPostable(): bool
    {
        return $this->status === AccountingPeriodStatus::Open;
    }
}
