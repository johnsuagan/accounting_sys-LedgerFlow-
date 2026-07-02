# Chart of Accounts — Test Scenarios (Phase 1B)

Manual test scenarios for the COA UI and backend safeguards. Run as an **Accountant** unless noted. Use a company with an empty or sandbox chart where safe.

---

## 1. Asset hierarchy

**Goal:** Verify asset parent/child structure, tree visualization, and filtering.

### Setup

| Code | Name | Type | Subtype | Parent | Header |
|------|------|------|---------|--------|--------|
| 1000 | Assets | asset | current_asset | — | Yes |
| 1100 | Current Assets | asset | current_asset | 1000 | Yes |
| 1110 | Cash and Cash Equivalents | asset | current_asset | 1100 | No |
| 1200 | Non-Current Assets | asset | non_current_asset | 1000 | Yes |
| 1210 | Property, Plant & Equipment | asset | non_current_asset | 1200 | No |

### Steps

1. Open **Chart of Accounts** (`/accounting/accounts`).
2. Confirm the left tree shows nested assets: `1000` → `1100` → `1110` and `1000` → `1200` → `1210`.
3. Click `1110` in the tree; confirm the table row highlights.
4. Filter by **Account type = Asset**; confirm only asset accounts appear in the table.
5. Search `Cash`; confirm `1110` is returned.

### Expected

- Tree indent reflects `level` / hierarchy.
- Header accounts show folder icon and **Header** badge.
- Postable leaf accounts (`1110`, `1210`) show `is_postable: true` on edit (no children, not header, active).

---

## 2. Liability hierarchy

**Goal:** Mirror asset behavior for liabilities with correct subtype rules.

### Setup

| Code | Name | Type | Subtype | Parent | Header |
|------|------|------|---------|--------|--------|
| 2000 | Liabilities | liability | current_liability | — | Yes |
| 2100 | Current Liabilities | liability | current_liability | 2000 | Yes |
| 2110 | Accounts Payable | liability | current_liability | 2100 | No |
| 2200 | Long-Term Liabilities | liability | non_current_liability | 2000 | Yes |
| 2210 | Notes Payable | liability | non_current_liability | 2200 | No |

### Steps

1. Create accounts in order (parents before children).
2. Confirm tree groups under `2000`.
3. On create form for `2110`, set **Account type = Liability**; confirm subtype dropdown only offers **Current liability** and **Non-current liability**.
4. Set parent to `2100`; save successfully.

### Expected

- Liability subtree renders separately from assets.
- Subtype options change when type changes (client Zod + server validation).

---

## 3. Header account restrictions

**Goal:** Headers cannot receive postings; children require header parents.

### Prerequisites

- Asset hierarchy from scenario 1 exists.
- At least one **posted** journal line on a postable account (e.g. `1110`) if testing deactivate-with-activity; optional for header-only checks.

### Steps

1. Edit `1110` (Cash); confirm **Header account** is unchecked and account is postable.
2. Attempt to create child under `1110` (non-header leaf):
   - **Expected:** Backend rejects — parent must be a header account.
3. Create child `1120` **Petty Cash** under `1100` (header):
   - **Expected:** Success.
4. Attempt to mark `1100` as non-header while `1120` exists:
   - **Expected:** Backend rejects — cannot remove header flag while children exist.
5. Attempt to deactivate `1000` while active children exist (if policy blocks) or verify header with children still appears in tree when inactive children filtered.

### Expected

- UI shows **Header** badge on header rows.
- Form helper text explains headers cannot receive journal postings.
- Server returns clear error on invalid header/parent combinations.

---

## 4. Duplicate account code validation

**Goal:** Account codes are unique per company.

### Steps

1. Note an existing code (e.g. `1110`).
2. **Create account** with the same code `1110`, different name.
3. Submit form.

### Expected

- **Client:** Zod passes (format only); duplicate is server-side.
- **Server:** Validation error on `account_code` or generic `account` flash error: code already exists.
- Error displays on create form (`account_code` field or banner).
4. Change code to `1111`; save succeeds.

### Auditor (read-only)

1. Log in as **Auditor**.
2. Open Chart of Accounts.
3. **Expected:** No **New account** button; amber read-only banner; no row actions; edit form fields disabled if navigated directly.

---

## 5. Parent-child validation

**Goal:** Parent type must match child; no circular parents.

### Steps — type mismatch

1. Create account `3000` **Equity** (type `equity`, header).
2. Attempt to create `1115` under `3000` with type **asset**.
   - **Expected:** Server error — parent and child `account_type` must match.
3. On create form, parent dropdown on edit should only list compatible parents (controller filters `parentOptions` by type).

### Steps — circular parent (edit)

1. Using hierarchy from scenario 1, edit `1000` and try to set parent to `1110` (descendant).
   - **Expected:** Server rejects — cannot assign descendant as parent.

### Steps — subtype coherence

1. Create liability account with subtype **current_liability**.
2. Change type to **asset** in UI without changing subtype; blur/submit.
   - **Expected:** Client Zod error on subtype; if bypassed, server rejects invalid subtype for type.

### Deactivate flow

1. Edit `2110` Accounts Payable; click **Deactivate account**.
2. Confirm dialog; submit.
3. **Expected:** Success flash; status **Inactive**; account hidden when filter **Status = Active** only.
4. Click **Activate account** on edit page.
5. **Expected:** Account active again.

---

## Regression checklist

- [ ] Tree + table hybrid layout on desktop; mobile sheet for tree
- [ ] Search and filters persist in URL query string
- [ ] System accounts: code/type locked; no delete/deactivate
- [ ] Accounts with posted activity: delete blocked; deactivate allowed
- [ ] Breadcrumbs and sidebar **Chart of Accounts** link work
