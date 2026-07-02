# LedgerFlow Opening Balance Strategy

## Purpose

Define how opening balances are introduced when a company onboards to LedgerFlow or when a new fiscal year begins, without violating double-entry bookkeeping or period-lock rules.

## Principle

Opening balances are **journal entries**, not separate balance tables. The General Ledger, Trial Balance, and Financial Statements remain dynamic projections of posted `journal_entry_lines`.

## Strategy A — Initial Company Onboarding

Use when a company is created mid-cycle or at fiscal year start with existing balances.

1. Create the company, fiscal year, and chart of accounts.
2. Create a **draft** journal entry with:
   - `source = opening_balance`
   - `entry_date = fiscal_year.start_date`
   - `accounting_period_id` = period 1 (or period covering start date)
3. Add one line per account with a non-zero opening balance:
   - Debit-normal accounts (assets, expenses): debit line if balance is positive.
   - Credit-normal accounts (liabilities, equity, revenue): credit line if balance is positive.
4. Add a balancing line to **`Opening Balance Equity`** (system equity account, e.g. `3900`) for the offset.
5. Validate `total_debit = total_credit`.
6. Post the entry while the target period is **open**.

### Example

| Account | Debit | Credit |
|---|---:|---:|
| 1110 Cash | 10,000.00 | |
| 2110 Accounts Payable | | 3,000.00 |
| 3100 Owner's Capital | | 7,000.00 |
| **Totals** | **10,000.00** | **10,000.00** |

If only asset/liability lines are entered, the equity offset account absorbs the difference.

## Strategy B — New Fiscal Year (No Mid-Year Migration)

When prior-year activity already exists in LedgerFlow:

1. Close all periods in the prior fiscal year.
2. Generate a **system closing entry** (future `YearEndClosingService`) that:
   - Zeros revenue and expense accounts into retained earnings.
3. Opening balances for the new year are **implicit** — they are the closing balances carried forward through posted history.
4. Do **not** re-enter opening balances manually unless importing external history.

## Strategy C — Adjustment Period (Period 13)

Use `accounting_periods.period_number = 13` with `is_adjustment_period = true` for:

- Audit adjustments after year-end close but before lock.
- Corrections discovered during review.
- External advisor adjustments.

Rules:

- Period 13 must remain **open** while adjustments are recorded.
- All adjustment entries use `source = system` or `manual` with reference `ADJ-YYYY`.
- Once period 13 is closed and the fiscal year is locked, no further posts are allowed.

## Database Fields Used

| Field | Value |
|---|---|
| `journal_entries.source` | `opening_balance` |
| `journal_entries.status` | `draft` → `posted` |
| `journal_entries.entry_date` | Fiscal year start date (Strategy A) |
| `journal_entries.accounting_period_id` | Period 1 or 13 as applicable |
| `accounts.is_system` | `true` for Opening Balance Equity account |

## Validation Rules (Application Layer at Post)

- Minimum 2 lines.
- No posting to header accounts (`is_header = false` required).
- All accounts must belong to the same `company_id`.
- Target fiscal year and accounting period must be **open**.
- Entry must balance before post (enforced by CHECK constraint when status is `posted` or `reversed`).

## Audit Requirements

Log the following via `audit_logs`:

- `module = journal_entries`
- `action = posted`
- `request_id` correlates header post and line validation steps
- `new_values` includes `source`, totals, and fiscal period reference

## What We Do Not Do

- No `opening_balances` table.
- No manual GL table.
- No storing Trial Balance or Financial Statement totals in the database.
- No posting opening balances into closed or locked periods.

## Seeded System Account

Each company receives a seeded account on creation:

| Code | Name | Type | Subtype |
|---|---|---|---|
| `3900` | Opening Balance Equity | equity | equity |

This account is `is_system = true` and cannot be deleted.
