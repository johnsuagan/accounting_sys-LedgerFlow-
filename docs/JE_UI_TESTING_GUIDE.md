# Journal Entry UI — Manual Testing Guide (Phase 1D)

Manual test scenarios for the Journal Entry React UI. Run as an **Accountant** unless noted. Requires an open fiscal year and accounting period for the entry dates used.

---

## Prerequisites

- Company selected in session
- Chart of Accounts with postable accounts (e.g. `1110` Cash, `2110` Accounts Payable)
- Fiscal year and period covering test dates are **Open**
- `npm run dev` or production build deployed

---

## 1. Create Draft

**Steps**

1. Open **Journal Entries** from the sidebar (`/accounting/journal-entries`).
2. Click **New journal entry**.
3. Set **Entry date**, **Description**, optional **Reference** and **Memo**.
4. Add one line: select an account, enter a debit or credit.
5. Click **Create draft**.

**Expected**

- Redirect to edit page with success flash.
- Entry number displays as **Draft**.
- Status badge: **Draft**.
- Balance indicator shows amber (unbalanced) if only one line or debits ≠ credits.

**Validation**

- Submit without account on a line → client error: *Account is required.*
- Submit with zero lines → prevented (minimum one line required).

---

## 2. Save Draft

**Steps**

1. On edit page, change description or add a second line.
2. Click **Save draft**.

**Expected**

- Success flash; changes persist on reload.
- Header-only save (no line changes) preserves existing lines.

---

## 3. Edit Draft

**Steps**

1. From index, open a draft entry (click **Edit**).
2. Use **Add line** to add rows.
3. Use account picker search (type `cash`) — list filters to matching accounts.
4. Enter debit on one line, credit on another for equal amounts.
5. Observe balance indicator turn **green** when balanced with 2+ lines.

**Expected**

- Account picker shows `CODE - Name` format (e.g. `1110 - Cash`).
- Only postable, active, non-header accounts appear (from backend `postableAccounts`).
- Removing lines disabled when only one line remains.

---

## 4. Post Entry

**Steps**

1. On a balanced draft (2+ lines, valid accounts, debits = credits, total > 0):
   - **Post entry** button enabled.
2. Click **Post entry** (saves draft first, then posts).

**Expected**

- Redirect to show page.
- Entry number assigned (e.g. `JE-2026-00001`).
- Status: **Posted**; posted date and posted by populated.
- Edit/Post/Cancel/Delete hidden for posted entries.

**Post button disabled when**

- Fewer than 2 lines
- Unbalanced totals
- Line with both debit and credit
- Missing account on any line

---

## 5. Reverse Entry

**Steps**

1. Open a **Posted** entry (View from index).
2. Click **Reverse entry**.
3. Enter **Reversal reason** (required); optionally change **Reversal date**.
4. Submit.

**Expected**

- Redirect to new **reversal** entry show page (posted).
- Original entry status → **Reversed**.
- Reversal lines have swapped debits/credits.
- Reversal details link back to original entry.

**Validation**

- Submit without reason → client error on reversal reason field.

---

## 6. Upload Attachment

**Steps**

1. Open a **Draft** entry edit page.
2. Under **Attachments**, choose a file (≤ 10 MB).
3. Confirm upload success flash.
4. Delete attachment via **Delete** link.

**Expected**

- Attachment listed with filename, size, mime type, uploader.
- File stored at: `journal-entries/{company_id}/fy-{fiscal_year_id}/{journal_entry_id}/`
- Posted entries: no upload control on edit (not accessible); show page is read-only attachments.

---

## 7. Auditor View

**Steps**

1. Log in as **Auditor**.
2. Open Journal Entries index.

**Expected**

- Amber read-only banner.
- No **New journal entry** button.
- Draft rows link to **View** (show), not Edit.
- Show page: no Reverse, Post, or edit controls.
- **Print** button available (placeholder — triggers `window.print()`).

---

## 8. Validation Errors

| Scenario | Expected behavior |
|----------|-------------------|
| Unbalanced post | Server flash/error on `journal_entry`; remains on edit |
| Period locked | Error message from backend; no stack trace |
| Post to header account | Server error on post |
| Duplicate save with invalid line (debit + credit) | Client Zod error before submit |
| Cancel draft | Confirm dialog; status → Cancelled on show page |
| Delete draft | Confirm dialog; redirect to index |

---

## Index Page Features

| Feature | Notes |
|---------|-------|
| Search | Filters current page client-side by number, description, status label |
| Status filter | Draft / Posted / Reversed / Cancelled |
| Date range | Filters `entry_date` on current page |
| Pagination | Server-side Laravel pagination links |
| Draft entry # | Displays **Draft** instead of null entry number |
| Desktop | TanStack Table |
| Mobile | Card list layout |

> **Note:** Search and filters apply to the **current paginated page** client-side until backend index filters are added in a future phase.

---

## Regression Checklist

- [ ] Sidebar **Journal Entries** link works
- [ ] Breadcrumbs on all four pages
- [ ] Flash success/error messages display
- [ ] Balance indicator: green / amber / red states
- [ ] Responsive line editor (table desktop, cards mobile)
- [ ] Save-then-post chain on edit page
