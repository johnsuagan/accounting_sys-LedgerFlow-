<?php

namespace App\Services\FinancialAnalysis\Support;

final class FinancialRatioResult
{
    public function __construct(
        public readonly string $key,
        public readonly string $name,
        public readonly string $formula,
        public readonly string $computation,
        public readonly ?string $value,
        public readonly ?string $displayValue,
        public readonly string $interpretation,
        public readonly string $status,
        public readonly string $statusColor,
        public readonly bool $isFuture = false,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'name' => $this->name,
            'formula' => $this->formula,
            'computation' => $this->computation,
            'value' => $this->value,
            'display_value' => $this->displayValue,
            'interpretation' => $this->interpretation,
            'status' => $this->status,
            'status_color' => $this->statusColor,
            'is_future' => $this->isFuture,
        ];
    }
}
