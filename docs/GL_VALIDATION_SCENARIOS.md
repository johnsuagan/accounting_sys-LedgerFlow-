# General Ledger — Validation Scenarios

Manual verification for Phase 2A. Post journal entries via the Journal Entry UI before checking the General Ledger.

---

## Setup

1. Ensure postable accounts exist:
   - `1110` Cash (asset, debit normal)
   - `3100` Owner Capital (equity, credit normal)
   - `5100` Rent Expense (expense, debit normal)
2. Open fiscal year and period covering test dates.
3. Open **General Ledger** (`/accounting/general-ledger`).

---

## Scenario 1 — Owner Investment

**Journal entry (post):**

| Account | Debit | Credit |
|---------|-------|--------|
| Cash | 100,000 | |
| Owner Capital | | 100,000 |

**GL filter:** Account = Cash, date range covering the entry.

**Expected**

- Cash ledger shows debit line 100,000
- Running balance: **100,000 DR**
- Opening balance (if no prior activity): **0.00 DR**

---

## Scenario 2 — Rent Expense

**Journal entry (post):**

| Account | Debit | Credit |
|---------|-------|--------|
| Rent Expense | 5,000 | |
| Cash | | 5,000 |

**GL filter:** Account = Cash, same date range (includes both entries).

**Expected**

- Second cash line: credit 5,000
- Closing balance: **95,000 DR**

---

## Scenario 3 — Reverse Rent

**Action:** Reverse the rent journal entry from Scenario 2.

**GL filter:** Account = Cash, date range including reversal.

**Expected**

- Reversal cash line restores the credit offset
- Closing balance returns to **100,000 DR**

---

## Exclusion Checks

| Entry status | Visible in GL? |
|--------------|----------------|
| Draft | No |
| Cancelled | No |
| Posted | Yes |
| Reversed (original) | Yes |
| Reversal entry (posted) | Yes |

---

## Balance Side Rules

| Account type | Normal balance | Positive movement |
|--------------|----------------|-------------------|
| Asset / Expense | Debit | DR |
| Liability / Equity / Revenue | Credit | CR |

Each line returns `balance_amount` (absolute) and `balance_side` (`DR` / `CR`).

---

## Future roll-up (not in UI yet)

`GeneralLedgerService::ledgerForAccount(..., $includeDescendants = true)` aggregates descendant account lines. The API and `GeneralLedgerQuery` support this; UI toggle deferred to a later phase.
