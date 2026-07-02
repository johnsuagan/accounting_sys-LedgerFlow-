<?php

namespace App\Models;

use App\Enums\AccountSubtype;
use App\Enums\AccountType;
use App\Enums\NormalBalance;
use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use BelongsToCompany, HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'account_code',
        'account_name',
        'account_type',
        'account_subtype',
        'normal_balance',
        'parent_id',
        'level',
        'path',
        'is_header',
        'is_system',
        'is_active',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'account_type' => AccountType::class,
            'account_subtype' => AccountSubtype::class,
            'normal_balance' => NormalBalance::class,
            'level' => 'integer',
            'is_header' => 'boolean',
            'is_system' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function journalEntryLines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class, 'account_id');
    }

    public function isPostable(): bool
    {
        return $this->is_active
            && ! $this->is_header
            && ! $this->children()->exists();
    }

    public function scopePostable(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->where('is_header', false)
            ->whereDoesntHave('children');
    }
}
