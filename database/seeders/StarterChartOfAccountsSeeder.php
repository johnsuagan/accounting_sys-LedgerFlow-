<?php

namespace Database\Seeders;

use App\Enums\AccountSubtype;
use App\Enums\AccountType;
use App\Services\Accounting\ChartOfAccountService;
use App\Support\CompanyContext;

/**
 * Starter chart of accounts for student practice sets.
 */
class StarterChartOfAccountsSeeder
{
    /**
     * @return list<array{account_code: string, account_name: string, account_type: AccountType, account_subtype: AccountSubtype}>
     */
    public static function definitions(): array
    {
        return [
            ['account_code' => '1110', 'account_name' => 'Cash', 'account_type' => AccountType::Asset, 'account_subtype' => AccountSubtype::CurrentAsset],
            ['account_code' => '1120', 'account_name' => 'Accounts Receivable', 'account_type' => AccountType::Asset, 'account_subtype' => AccountSubtype::CurrentAsset],
            ['account_code' => '1130', 'account_name' => 'Supplies', 'account_type' => AccountType::Asset, 'account_subtype' => AccountSubtype::CurrentAsset],
            ['account_code' => '1210', 'account_name' => 'Equipment', 'account_type' => AccountType::Asset, 'account_subtype' => AccountSubtype::NonCurrentAsset],
            ['account_code' => '2110', 'account_name' => 'Accounts Payable', 'account_type' => AccountType::Liability, 'account_subtype' => AccountSubtype::CurrentLiability],
            ['account_code' => '3100', 'account_name' => "Owner's Capital", 'account_type' => AccountType::Equity, 'account_subtype' => AccountSubtype::Equity],
            ['account_code' => '3200', 'account_name' => "Owner's Drawings", 'account_type' => AccountType::Equity, 'account_subtype' => AccountSubtype::Equity],
            ['account_code' => '4100', 'account_name' => 'Service Revenue', 'account_type' => AccountType::Revenue, 'account_subtype' => AccountSubtype::Revenue],
            ['account_code' => '5100', 'account_name' => 'Rent Expense', 'account_type' => AccountType::Expense, 'account_subtype' => AccountSubtype::Expense],
            ['account_code' => '5200', 'account_name' => 'Utilities Expense', 'account_type' => AccountType::Expense, 'account_subtype' => AccountSubtype::Expense],
            ['account_code' => '5300', 'account_name' => 'Salaries Expense', 'account_type' => AccountType::Expense, 'account_subtype' => AccountSubtype::Expense],
        ];
    }

    public function seedForCompany(int $companyId, ChartOfAccountService $chartOfAccountService): void
    {
        CompanyContext::set($companyId);

        foreach (self::definitions() as $definition) {
            $chartOfAccountService->create([
                'company_id' => $companyId,
                'account_code' => $definition['account_code'],
                'account_name' => $definition['account_name'],
                'account_type' => $definition['account_type']->value,
                'account_subtype' => $definition['account_subtype']->value,
                'is_header' => false,
                'is_active' => true,
            ]);
        }
    }
}
