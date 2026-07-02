# LedgerFlow — Functional Requirements Specification (FRS)

**Document Version:** 1.0  
**Status:** Project Freeze — Master Blueprint  
**Project Name:** LedgerFlow  
**Full Title:** LedgerFlow: Business Process Mapping and Analysis of Financial Statement Preparation and Reporting  
**Technology Stack:** Laravel 12 · React (TypeScript) · Inertia.js · MySQL  
**Primary Users:** Accounting Students · Accounting Instructors · Educational Institutions  

---

> **Governance:** After approval, all future development must strictly follow this specification. Features not listed in the approved scope belong in Section 18 (Future Enhancements) unless this document is formally revised.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [System Modules](#2-system-modules)
3. [Navigation Structure](#3-navigation-structure)
4. [User Roles](#4-user-roles)
5. [Functional Requirements](#5-functional-requirements)
6. [Accounting Workflow](#6-accounting-workflow)
7. [Database Relationships](#7-database-relationships)
8. [Report Flow](#8-report-flow)
9. [Dashboard Specification](#9-dashboard-specification)
10. [Financial Analysis Module](#10-financial-analysis-module)
11. [T-Account Module](#11-t-account-module)
12. [General Ledger Module](#12-general-ledger-module)
13. [Trial Balance Module](#13-trial-balance-module)
14. [Financial Statements Module](#14-financial-statements-module)
15. [Practice Sets](#15-practice-sets)
16. [Laboratory Activities](#16-laboratory-activities)
17. [Reports](#17-reports)
18. [Future Enhancements](#18-future-enhancements)
19. [Architectural Review — Gaps & Recommendations](#19-architectural-review--gaps--recommendations)

---

## 1. System Overview

### 1.1 Purpose

LedgerFlow is a **professional accounting information system for accounting education**. It enables students to experience the complete accounting cycle — from chart of accounts and journal entries through financial statements and financial analysis — using workflows comparable to professional accounting software, without the complexity of an ERP.

### 1.2 Objectives

| # | Objective |
|---|-----------|
| O1 | Teach the accounting cycle through hands-on journal entry recording |
| O2 | Automatically generate all derived reports from posted journal entries |
| O3 | Provide account traceability from any report figure back to journal entries |
| O4 | Enable financial statement analysis through computed ratios and insights |
| O5 | Support educational practice sets and laboratory exercises |
| O6 | Maintain a professional, non-gamified interface suitable for classroom use |
| O7 | Enforce accounting integrity (balanced entries, immutability after posting) |

### 1.3 Target Users

| User | Description |
|------|-------------|
| **Accounting Student** | Primary user; records transactions, generates reports, analyzes results |
| **Accounting Instructor** | Monitors student progress, assigns exercises, reviews submissions (planned) |
| **Administrator** | Manages institutions, users, practice sets, fiscal years (partially implemented) |
| **Auditor** | Read-only access to company accounting data for review |

### 1.4 Scope

**In Scope**

- Multi-tenant company (practice set) context per user session
- Chart of Accounts management
- Journal entry lifecycle (draft → post → cancel/reverse)
- Auto-generated T-Accounts, General Ledger, Trial Balance
- Financial Statements (SOFP, Income Statement, SOCE)
- Financial Analysis (ratios, trends, insights, health score)
- Practice set auto-provisioning for students
- Audit trail for journal entries
- User authentication and profile settings

**Out of Scope (see Section 18)**

- ERP modules (inventory, payroll, AR/AP subledgers)
- AI-generated insights
- Cash flow statement
- Budgeting and forecasting

### 1.5 Expected Learning Outcomes

After using LedgerFlow, students should be able to:

1. Design and maintain a chart of accounts
2. Record double-entry journal entries with proper DR/CR
3. Explain how T-Accounts and the General Ledger are derived from journal entries
4. Prepare a Trial Balance and verify it balances
5. Generate Statement of Financial Position, Income Statement, and Statement of Changes in Equity
6. Compute and interpret financial ratios
7. Assess business financial health using ratio benchmarks
8. Trace any financial statement amount to its originating journal entries
9. Understand period-over-period performance through trend analysis

---

## 2. System Modules

### 2.1 Module Hierarchy

```
LedgerFlow
├── Platform
│   ├── Welcome (public)
│   ├── Authentication (register, login, password reset, email verification)
│   ├── Onboarding (auto-provision — no UI)
│   └── Dashboard (practice home)
│
├── Accounting
│   ├── Chart of Accounts
│   ├── Journal Entries
│   ├── T-Accounts
│   ├── General Ledger
│   ├── Trial Balance
│   ├── Financial Statements
│   │   ├── Statement of Financial Position (Balance Sheet)
│   │   ├── Income Statement
│   │   └── Statement of Changes in Equity
│   └── Audit Trail
│
├── Financial Analysis
│   ├── Analysis Dashboard
│   ├── Profitability Ratios
│   ├── Liquidity Ratios
│   ├── Solvency Ratios
│   ├── Efficiency Ratios
│   ├── Trend Analysis
│   └── Financial Insights
│
├── Laboratory Activities          [PLANNED — Section 16]
│
├── Administration                 [PARTIAL — backend only]
│   ├── Companies / Practice Sets
│   ├── Users & Roles
│   ├── Fiscal Years
│   └── Accounting Periods
│
└── Settings (user profile)
    ├── Profile
    ├── Password
    └── Appearance
```

### 2.2 Implementation Status Summary

| Module | Status |
|--------|--------|
| Platform Dashboard | ✅ Implemented |
| Chart of Accounts | ✅ Implemented |
| Journal Entries | ✅ Implemented |
| T-Accounts | ✅ Implemented |
| General Ledger | ✅ Implemented |
| Trial Balance | ✅ Implemented |
| Financial Statements | ✅ Implemented |
| Financial Analysis | ✅ Implemented |
| Audit Trail (JE only) | ✅ Implemented |
| Practice Sets (auto single) | ✅ Implemented |
| Practice Sets (catalog/multi) | 🔶 Planned |
| Laboratory Activities | 🔶 Planned |
| Administration UI | 🔶 Planned |
| Settings | ✅ Implemented |

---

## 3. Navigation Structure

### 3.1 Main Sidebar (Authenticated + Company Selected)

| Group | Menu Item | Route | Icon Purpose |
|-------|-----------|-------|--------------|
| **Platform** | Dashboard | `/dashboard` | Practice home, workflow, summary |
| **Accounting** | Chart of Accounts | `/accounting/accounts` | COA tree/table |
| | Journal Entries | `/accounting/journal-entries` | Transaction recording |
| | T-Accounts | `/accounting/t-accounts` | Visual DR/CR accounts |
| | General Ledger | `/accounting/general-ledger` | Account ledger detail |
| | Trial Balance | `/accounting/trial-balance` | Debit/credit listing |
| | Financial Statements | `/accounting/financial-statements` | SOFP, IS, SOCE |
| | Audit Trail | `/accounting/audit-trail` | JE change history |
| **Financial Analysis** | Dashboard | `/financial-analysis/dashboard` | Executive KPIs & charts |
| | Profitability Ratios | `/financial-analysis/profitability` | Margin & return ratios |
| | Liquidity Ratios | `/financial-analysis/liquidity` | Short-term solvency |
| | Solvency Ratios | `/financial-analysis/solvency` | Long-term leverage |
| | Efficiency Ratios | `/financial-analysis/efficiency` | Asset utilization |
| | Trend Analysis | `/financial-analysis/trends` | Period comparisons |
| | Financial Insights | `/financial-analysis/insights` | Rule-based insights |

### 3.2 Secondary Navigation

| Location | Items |
|----------|-------|
| **User menu** | Settings (Profile, Password, Appearance), Logout |
| **Financial Analysis sub-nav** | Horizontal tab bar on all FA pages linking the 7 analysis pages |
| **Accounting Workflow bar** | COA → JE → T-Accounts → GL → TB → FS → FA (shown on dashboard and accounting pages) |
| **Company switch** | `/company/select` (Blade page — super admin / multi-company only) |

### 3.3 Public / Pre-Auth Pages

| Page | Route |
|------|-------|
| Welcome | `/` |
| Register | `/register` |
| Login | `/login` |
| Forgot / Reset Password | `/forgot-password`, `/reset-password/{token}` |
| Email Verification | `/verify-email` |

### 3.4 Orphan Page Policy

**Rule:** Every routable page must appear in sidebar, workflow bar, user menu, or FA sub-nav.  
**Current exceptions to resolve:** Company select (Blade), Settings (user menu only — acceptable).

---

## 4. User Roles

### 4.1 Role Definitions

| Role | Slug | Description |
|------|------|-------------|
| **Super Administrator** | `super_admin` | Platform-wide access; all abilities via `Gate::before` |
| **Accountant** | `accountant` | Full read/write accounting within assigned company |
| **Auditor** | `auditor` | Read-only access within assigned company |

> **FRS Role Mapping:** For educational context, **Student** maps to **Accountant** on their practice set. **Instructor** and **Administrator** map to **Super Administrator** (or a future **Instructor** role — see recommendations).

### 4.2 Permissions Matrix

| Capability | Student (Accountant) | Auditor | Instructor / Admin (Super Admin) |
|------------|---------------------|---------|-----------------------------------|
| View COA | ✅ | ✅ | ✅ |
| Create/Edit COA | ✅ | ❌ | ✅ |
| Deactivate accounts | ✅ | ❌ | ✅ |
| Create draft JE | ✅ | ❌ | ✅ |
| Edit/Delete draft JE | ✅ | ❌ | ✅ |
| Post / Cancel / Reverse JE | ✅ | ❌ | ✅ |
| Attachments on drafts | ✅ | ❌ | ✅ |
| View T-Accounts, GL, TB, FS | ✅ | ✅ | ✅ |
| View Financial Analysis | ✅ | ✅ | ✅ |
| View Audit Trail | ✅ | ✅ | ✅ |
| Export / Print reports | ✅ | ✅ | ✅ |
| Manage companies | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Close/Lock fiscal years | ❌ | ❌ | ✅ (super admin) |
| Switch company context | ❌ | ❌ | ✅ (multi-company) |
| Profile settings | ✅ | ✅ | ✅ |

### 4.3 Restrictions

- All accounting data is **company-scoped** via session (`ledgerflow.company_id`)
- Students receive **one auto-provisioned practice set** per account
- Posted journal entries are **immutable** (DB triggers + application guards)
- System accounts cannot be deleted
- Accounts with posted activity or child accounts cannot be deleted
- Auditor role: UI disables write actions; policies enforce `canWriteAccounting()`

---

## 5. Functional Requirements

### 5.1 Platform — Welcome Page

| Attribute | Specification |
|-----------|---------------|
| **Purpose** | Public landing page introducing LedgerFlow |
| **Functions** | Navigate to Register / Login |
| **Permissions** | Public |

---

### 5.2 Platform — Dashboard (Practice Home)

| Attribute | Specification |
|-----------|---------------|
| **Route** | `GET /dashboard` |
| **Purpose** | Student home; orientation, workflow visibility, summary analytics |
| **Functions** | View welcome card, accounting workflow bar, financial position summary cards, trend charts, recent journal entries, account type totals, quick actions |
| **Summary Cards** | Total Assets, Liabilities, Equity, Revenue, Expenses, Net Income (as of fiscal year end) |
| **Charts** | Monthly Revenue, Expenses, Net Income trends |
| **Recent Activity** | Last 5 posted journal entries with links |
| **Quick Actions** | Create JE, COA, T-Accounts, GL, TB, FS, Financial Analysis |
| **Filters** | None (uses latest fiscal year end date) |
| **Permissions** | Authenticated + company selected |
| **Outputs** | Read-only analytics from `DashboardAnalyticsService` |

---

### 5.3 Accounting — Chart of Accounts

| Attribute | Specification |
|-----------|---------------|
| **Route** | `/accounting/accounts` |
| **Purpose** | Define and maintain the account structure |
| **Functions** | List (tree + table), Create, Edit, Deactivate, Activate |
| **Buttons** | New Account, Edit, Deactivate/Activate, Save, Cancel |
| **Table Columns** | Code, Name, Type, Subtype, Normal Balance, Status, Actions |
| **Filters** | Account type, active/inactive, search by code/name |
| **Validation** | Unique code per company; valid type/subtype pairing; header accounts non-postable |
| **Restrictions** | Cannot delete system accounts, accounts with posted activity, or accounts with children |
| **Permissions** | View: all members; Write: accountant+ |
| **Outputs** | Updated account structure affecting all downstream reports |

---

### 5.4 Accounting — Journal Entries

#### 5.4.1 Index

| Attribute | Specification |
|-----------|---------------|
| **Purpose** | Browse and manage journal entries |
| **Functions** | List, filter, navigate to create/show/edit |
| **Table Columns** | Entry #, Date, Description, Status, Total Debit, Total Credit, Posted At |
| **Filters** | Status, date range, search |
| **Permissions** | View: all; Create: accountant+ |

#### 5.4.2 Create / Edit

| Attribute | Specification |
|-----------|---------------|
| **Purpose** | Record double-entry transactions |
| **Functions** | Add lines, select accounts, set amounts, save draft, attach files |
| **Buttons** | Add Line, Remove Line, Save Draft, Cancel |
| **Line Fields** | Account, Description, Debit, Credit |
| **Validation** | Debit = Credit (tolerance 0); minimum 2 lines; valid accounts; entry date within open period |
| **Attachments** | Upload on draft only; store metadata + file |
| **Permissions** | Accountant+; edit/delete draft only |

#### 5.4.3 Show (Detail)

| Attribute | Specification |
|-----------|---------------|
| **Purpose** | View posted or draft entry with full audit context |
| **Functions** | Post, Cancel, Reverse, Print, Manage attachments (draft), View trace links |
| **Buttons** | Post, Cancel, Reverse, Print, Add Attachment, Delete Attachment |
| **Status Transitions** | Draft → Posted; Posted → Cancelled; Posted → Reversed (creates reversal JE) |
| **Validation** | Post: balanced, valid period; Reverse: posted entry only |
| **Outputs** | Posted JE updates all derived reports; audit log entry created |
| **Permissions** | Post/Cancel/Reverse: accountant+ |

---

### 5.5 Accounting — T-Accounts

| Attribute | Specification |
|-----------|---------------|
| **Route** | `/accounting/t-accounts` |
| **Purpose** | Visualize DR/CR activity per account |
| **Modes** | Browse accounts (list) · View single T-Account |
| **Functions** | Filter by date range, account, type; print T-Account |
| **Filters** | Date from, Date to, Account (required for view mode), Account type, Fiscal year |
| **Display** | Left (DR) / Right (CR) columns, running balance, opening balance |
| **Buttons** | Apply Filters, Print, Clear |
| **Permissions** | View: all members |
| **Outputs** | Read-only projection from posted journal entry lines |

---

### 5.6 Accounting — General Ledger

| Attribute | Specification |
|-----------|---------------|
| **Route** | `/accounting/general-ledger` |
| **Purpose** | Chronological account transaction history with running balance |
| **Tabs** | General Ledger · T-Account (same account, alternate view) |
| **Functions** | Filter, view opening balance, running balance, account summary, print |
| **Filters** | Account, date range, fiscal year, include descendants |
| **Table Columns** | Date, Entry #, Description, Debit, Credit, Balance |
| **Summary** | Opening balance, total debits, total credits, closing balance |
| **Export** | Print ✅ · PDF 🔶 (stub) · Excel/CSV 🔶 (stub) |
| **Permissions** | View: all members |
| **Outputs** | Read-only from posted JEs |

---

### 5.7 Accounting — Trial Balance

| Attribute | Specification |
|-----------|---------------|
| **Route** | `/accounting/trial-balance` |
| **Purpose** | Verify DR = CR across all accounts |
| **Functions** | Generate, filter, validate balance |
| **Filters** | As of date, fiscal year |
| **Table Columns** | Account Code, Account Name, Debit, Credit |
| **Summary** | Total Debit, Total Credit, Balanced indicator, Difference |
| **Validation** | Total debits must equal total credits |
| **Export** | Print (browser) · PDF/Excel 🔶 planned |
| **Permissions** | View: all members |

---

### 5.8 Accounting — Financial Statements

| Attribute | Specification |
|-----------|---------------|
| **Route** | `/accounting/financial-statements` |
| **Purpose** | Present formal financial reports |
| **Statement Tabs** | Statement of Financial Position · Income Statement · Statement of Changes in Equity |
| **Filters** | SOFP: as-of date; IS/SOCE: date from + date to; fiscal year |
| **Functions** | Switch statement, apply filters, print, account trace links |
| **Grouping** | Current/Non-current assets & liabilities; revenue/expense sections; equity components |
| **Export** | Print · PDF/Excel 🔶 planned |
| **Permissions** | View: all members |

---

### 5.9 Accounting — Audit Trail

| Attribute | Specification |
|-----------|---------------|
| **Route** | `/accounting/audit-trail` |
| **Purpose** | Review journal entry change history |
| **Functions** | Paginated list of audit events |
| **Table Columns** | Timestamp, User, Action, Entry #, Description, Changes |
| **Scope** | Journal entries only (current); COA/period events planned |
| **Permissions** | View: all company members |

---

### 5.10 Financial Analysis — Dashboard

| Attribute | Specification |
|-----------|---------------|
| **Route** | `/financial-analysis/dashboard` |
| **Purpose** | Executive performance overview |
| **KPI Cards** | Total Assets, Liabilities, Equity, Revenue, Expenses, Net Income — each with current value, previous period, % change, direction indicator |
| **Charts** | Revenue trend, Expense trend, Net Income trend, Revenue vs Expenses, Assets/Liabilities/Expenses breakdown |
| **Top Accounts** | Top revenue, expense, asset, liability accounts |
| **Health** | Business health summary (4 categories + overall) |
| **Insights** | Top 4 rule-based insights |
| **Filters** | As of date, comparison type (month/quarter/year), fiscal year |
| **Drill-down** | KPI cards → Financial Statements |
| **Export** | Print, PDF (print dialog), Excel (CSV) |
| **Permissions** | View: all members |

---

### 5.11 Financial Analysis — Ratio Pages

| Pages | Profitability, Liquidity, Solvency, Efficiency |
| **Display per ratio** | Name, Formula, Computation, Result, Interpretation, Benchmark status, Color indicator |
| **Export** | Print, PDF, CSV per page |
| **Permissions** | View: all members |

---

### 5.12 Financial Analysis — Trend Analysis

| Attribute | Specification |
|-----------|---------------|
| **Purpose** | Compare current vs previous period trends |
| **Display** | KPI comparison cards, current/previous revenue charts, net income charts, revenue vs expenses |
| **Filters** | Same as FA dashboard |

---

### 5.13 Financial Analysis — Financial Insights

| Attribute | Specification |
|-----------|---------------|
| **Purpose** | Rule-based business narrative (no AI) |
| **Display** | Full insight list + business health score panel |
| **Insight types** | Positive, Warning, Info |

---

### 5.14 Settings

| Page | Functions |
|------|-----------|
| Profile | Update name, email; delete account |
| Password | Change password |
| Appearance | Light/dark/system theme |

**Access:** User menu; requires auth only (no company required).

---

### 5.15 Administration (Planned)

| Page | Functions | Status |
|------|-----------|--------|
| Companies | CRUD practice sets / companies | Backend policies only |
| Users | Assign users to companies with roles | Backend policies only |
| Fiscal Years | Create, close, lock fiscal years | Backend policies only |
| Accounting Periods | Close, lock monthly periods | Backend policies only |

---

## 6. Accounting Workflow

### 6.1 Complete Cycle

```
Chart of Accounts
        ↓
Journal Entries (source of truth)
        ↓
T-Accounts (projection)
        ↓
General Ledger (projection)
        ↓
Trial Balance (projection)
        ↓
Financial Statements (projection)
        ↓
Financial Analysis (derived from statements / balances)
```

### 6.2 Module I/O Matrix

| Module | Input | Processing | Output | Dependencies |
|--------|-------|------------|--------|--------------|
| **Chart of Accounts** | User-defined accounts | Validate hierarchy, types | Account structure | Company |
| **Journal Entries** | User transactions | Balance validation, post workflow | `journal_entries` + `journal_entry_lines` | COA, open period |
| **T-Accounts** | Posted JEs | Aggregate DR/CR per account | Visual T-Account | JE lines |
| **General Ledger** | Posted JEs | Chronological lines + running balance | Ledger view | JE lines, opening balance logic |
| **Trial Balance** | Posted JEs | Sum DR/CR per account | TB listing + totals | JE lines |
| **Financial Statements** | Account balances | Map accounts to statement lines, group | SOFP, IS, SOCE | JE lines, COA types/subtypes |
| **Financial Analysis** | FS + balances | Ratio math, benchmarks, insights | Dashboard, ratios, health score | FS, JE-derived balances |

### 6.3 Traceability Chain

Every report figure must be traceable:

```
Report Value → Financial Statement line → General Ledger → T-Account → Journal Entry Lines → Journal Entry
```

Implemented via `AccountTraceLinks` component on account-level views.

---

## 7. Database Relationships

### 7.1 Core Entities

```
companies
  ├── company_users (user_id, role_id, is_default)
  ├── fiscal_years
  │     ├── accounting_periods
  │     └── journal_entry_sequences
  ├── accounts (hierarchical COA)
  ├── journal_entries
  │     ├── journal_entry_lines → accounts
  │     └── journal_entry_attachments
  └── audit_logs (polymorphic)
```

### 7.2 Source of Truth

| Data | Source | Rule |
|------|--------|------|
| **All accounting balances** | `journal_entry_lines` of **posted** (and reversed) journal entries | **SOLE source of truth** |
| Account structure | `accounts` | Master data only |
| Fiscal structure | `fiscal_years`, `accounting_periods` | Period control only |

### 7.3 Prohibited Tables

The following must **NOT** be introduced as accounting data stores:

- `ledger_entries`
- `t_account_entries`
- `trial_balance_entries`
- `financial_statement_entries`
- `financial_ratio_entries`
- `dashboard_entries`
- `analysis_tables`

> **Note:** `ledger_entries` was explicitly dropped. All ledger views are computed dynamically via `LedgerImpact` and service-layer projection.

### 7.4 Key Relationships

| From | To | Relationship |
|------|-----|--------------|
| Company | Accounts | 1:N |
| Company | Journal Entries | 1:N |
| Journal Entry | Journal Entry Lines | 1:N |
| Journal Entry Line | Account | N:1 |
| Account | Account (parent) | Self-referential hierarchy |
| Fiscal Year | Accounting Periods | 1:N (12 monthly) |
| Audit Log | Journal Entry | Polymorphic |

---

## 8. Report Flow

### 8.1 Generation Pipeline

```
journal_entry_lines (posted)
        ↓
AccountBalanceService (per-account & aggregated balances)
        ↓
├── GeneralLedgerService → T-Account / GL views
├── TrialBalanceService → Trial Balance
├── FinancialStatementService → SOFP, IS, SOCE
└── DashboardAnalyticsService / FinancialAnalysisService → Analytics & Ratios
```

### 8.2 Rules

1. **No manual encoding** in any report — all figures are computed
2. Only **posted** and **reversed** journal entries affect balances (`LedgerImpact`)
3. Draft and cancelled entries are excluded
4. Header accounts roll up from children where applicable
5. Financial ratios derive from financial statement figures and account balances — never stored

### 8.3 Statement Generation

| Report | Basis | Date Logic |
|--------|-------|------------|
| Statement of Financial Position | Account balances as of date | Point-in-time |
| Income Statement | Revenue & expense balances | **FRS Target:** period activity; **Current:** cumulative as of date_to |
| Statement of Changes in Equity | Equity accounts + net income | Period change |
| Trial Balance | All account DR/CR | As of date |
| Financial Ratios | Derived metrics | Per analysis period |

---

## 9. Dashboard Specification

### 9.1 Platform Dashboard (`/dashboard`)

| Component | Content |
|-----------|---------|
| Welcome card | Practice set name, educational context |
| Workflow bar | 7-step accounting cycle |
| Summary cards (6) | Assets, Liabilities, Equity, Revenue, Expenses, Net Income |
| Charts (3) | Revenue, Expense, Net Income monthly trends |
| Recent JE table | Last 5 posted entries |
| Account summary | Totals by account type |
| Quick actions | Links to all core modules + FA |

### 9.2 Financial Analysis Dashboard (`/financial-analysis/dashboard`)

| Component | Content |
|-----------|---------|
| KPI cards (6) | Same 6 metrics + previous period + % change |
| Charts (4) | Revenue, Expense, Net Income trends; Revenue vs Expenses |
| Composition (3) | Assets, Liabilities, Expenses breakdown |
| Top accounts (4) | Revenue, Expense, Asset, Liability |
| Health score | 4 categories + overall rating |
| Insights | Top rule-based insights |
| Filters | As of date, comparison type, fiscal year |
| Export bar | Print, PDF, Excel |

---

## 10. Financial Analysis Module

### 10.1 Design Principles

- All ratios computed dynamically — never persisted
- Rule-based insights only — no AI
- Professional presentation — no gamification, badges, or quizzes
- Each ratio shows: formula, computation, result, interpretation, benchmark status

### 10.2 Profitability Ratios

| Ratio | Formula | Source Accounts | Interpretation | Benchmark (Excellent/Good/Fair) |
|-------|---------|-----------------|----------------|--------------------------------|
| Gross Profit Margin | Gross Profit ÷ Revenue × 100 | Revenue − COGS accounts | Profit after direct costs | ≥40% / ≥25% / ≥15% |
| Operating Profit Margin | Operating Profit ÷ Revenue × 100 | Revenue − COGS − Operating Expenses | Operating efficiency | ≥20% / ≥12% / ≥6% |
| Net Profit Margin | Net Income ÷ Revenue × 100 | Revenue − All Expenses | Profit per revenue peso | ≥15% / ≥8% / ≥3% |
| Return on Assets (ROA) | Net Income ÷ Avg Total Assets × 100 | Net Income, Assets (avg) | Profit per asset peso | ≥10% / ≥5% / ≥2% |
| Return on Equity (ROE) | Net Income ÷ Avg Equity × 100 | Net Income, Equity (avg) | Return to owners | ≥15% / ≥10% / ≥5% |
| Return on Investment (ROI) | Net Income ÷ Avg Equity × 100 | Approximated via equity | Return on invested capital | ≥15% / ≥10% / ≥5% |

**COGS detection:** Account names containing "cost of goods" or "cogs".  
**Operating expenses:** Total expenses minus COGS.

### 10.3 Liquidity Ratios

| Ratio | Formula | Source Accounts | Benchmark |
|-------|---------|-----------------|-----------|
| Current Ratio | Current Assets ÷ Current Liabilities | Subtype totals | ≥2.0 / ≥1.5 / ≥1.0 |
| Quick Ratio | (Cash + Receivables) ÷ Current Liabilities | Codes 1110 + 1120 | ≥1.5 / ≥1.0 / ≥0.8 |
| Cash Ratio | Cash ÷ Current Liabilities | Code 1110 | ≥0.5 / ≥0.25 / ≥0.1 |

### 10.4 Solvency Ratios

| Ratio | Formula | Source Accounts | Benchmark |
|-------|---------|-----------------|-----------|
| Debt Ratio | Liabilities ÷ Assets × 100 | Type totals | ≤40% / ≤60% / ≤80% |
| Debt-to-Equity | Liabilities ÷ Equity | Type totals | ≤0.5 / ≤1.0 / ≤2.0 |
| Equity Ratio | Equity ÷ Assets × 100 | Type totals | ≥60% / ≥40% / ≥25% |
| Interest Coverage | Operating Profit ÷ Interest Expense | Operating profit; interest expense accounts | ≥5 / ≥3 / ≥1.5 |

### 10.5 Efficiency Ratios

| Ratio | Formula | Status | Benchmark |
|-------|---------|--------|-----------|
| Asset Turnover | Revenue ÷ Avg Total Assets | ✅ Active | ≥1.5 / ≥1.0 / ≥0.5 |
| Inventory Turnover | COGS ÷ Avg Inventory | 🔶 Future | Requires inventory module |
| Receivable Turnover | Revenue ÷ Avg Receivables | 🔶 Future | Requires AR module |
| Working Capital Turnover | Revenue ÷ Avg Working Capital | ✅ Active | ≥4 / ≥2 / ≥1 |

### 10.6 Business Health Score

| Category | Derived From | Ratings |
|----------|--------------|---------|
| Profitability | Profitability ratios average | Excellent / Good / Fair / Needs Improvement |
| Liquidity | Liquidity ratios average | Same |
| Solvency | Solvency ratios average | Same |
| Efficiency | Active efficiency ratios | Same |
| **Overall** | Average of categories | Same |

**Color coding:** Green (Excellent/Good) · Yellow (Fair) · Red (Needs Improvement)

### 10.7 Period Comparison

| Comparison Type | Current Period | Previous Period |
|-----------------|----------------|-----------------|
| Month | Calendar month of as-of date | Prior calendar month |
| Quarter | Calendar quarter | Prior calendar quarter |
| Year | Calendar year | Prior calendar year |

---

## 11. T-Account Module

### 11.1 Purpose

Provide a visual, educational representation of how debits and credits accumulate in individual accounts.

### 11.2 Workflow

1. Student posts journal entries
2. Navigate to T-Accounts
3. Browse accounts with balances (date range) **OR** select account for detailed view
4. Review DR (left) and CR (right) columns
5. Print for submission

### 11.3 Page Design

| Section | Content |
|---------|---------|
| Filters | Date from, Date to, Account, Account type, Fiscal year |
| Browse mode | Account list with codes, names, balances |
| View mode | T-Account visual with opening balance, transactions, closing balance |
| Actions | Apply, Clear, Print |

### 11.4 Running Balance Logic

- Opening balance = cumulative balance before `date_from`
- Each line: apply DR to debit column, CR to credit column
- Running balance respects account normal balance (debit/credit)
- Only posted and reversed entries included

### 11.5 Relationships

| Related Module | Relationship |
|----------------|--------------|
| Journal Entries | Sole data source |
| General Ledger | Same data, tabular format; GL page includes T-Account tab |
| Financial Statements | Account balances feed statement lines |

---

## 12. General Ledger Module

### 12.1 Opening Balance Logic

Opening balance for a date range = net of all posted activity **before** `date_from`, presented according to account normal balance side.

### 12.2 Running Balance

Each transaction line updates a running balance column. Closing balance = opening + period debits − period credits (adjusted for normal balance).

### 12.3 Filtering

| Filter | Effect |
|--------|--------|
| Account | Required for detail view |
| Date range | Period scope |
| Fiscal year | Optional constraint |
| Include descendants | Roll up child account activity to header |

### 12.4 Export

| Format | Status |
|--------|--------|
| Print | ✅ Browser print |
| PDF | 🔶 Stub ("Coming soon") |
| Excel/CSV | 🔶 Stub ("Coming soon") |

### 12.5 T-Account Integration

GL page provides tab toggle: **General Ledger** ↔ **T-Account** for the selected account.

---

## 13. Trial Balance Module

### 13.1 Generation Rules

- Include all postable accounts with non-zero balances (configurable zero-balance inclusion)
- Present each account's balance on DR or CR side per normal balance
- Compute column totals

### 13.2 Validation

| Check | Rule |
|-------|------|
| Balance | Total Debits = Total Credits |
| Difference | Displayed if out of balance (should not occur with balanced JEs) |
| Indicator | Visual balanced / unbalanced badge |

### 13.3 Export

Print via browser. PDF/Excel planned.

---

## 14. Financial Statements Module

### 14.1 Statement of Financial Position

| Section | Grouping |
|---------|----------|
| Assets | Current Assets, Non-Current Assets |
| Liabilities | Current Liabilities, Non-Current Liabilities |
| Equity | Capital, Drawings, Retained Earnings (computed) |
| Validation | Assets = Liabilities + Equity |

**Account mapping:** By `account_type` and `account_subtype`.

### 14.2 Income Statement

| Section | Content |
|---------|---------|
| Revenue | All revenue accounts |
| Expenses | All expense accounts |
| Net Income | Revenue − Expenses |

**FRS Target:** Filter by date range (period activity).  
**Current implementation note:** Uses cumulative balance as of `date_to` — see Section 19.

### 14.3 Statement of Changes in Equity

| Component | Source |
|-----------|--------|
| Opening equity | Balance at period start |
| Net income | From income statement |
| Drawings | Drawing accounts (name heuristic: drawing, withdrawal, draw) |
| Capital contributions | Capital accounts |
| Closing equity | Computed |

### 14.4 Export

Print supported. PDF/Excel planned. Account trace links on line items.

---

## 15. Practice Sets

### 15.1 Current Implementation

On registration/login, each student receives **one auto-provisioned practice set**:

| Component | Auto-Created |
|-----------|--------------|
| Company | `"{Student Name}'s Practice Set"` |
| Settings | `is_practice_set: true`, `educational: true` |
| Role | Accountant (default) |
| Fiscal Year | Current calendar year, open |
| Periods | 12 monthly open periods |
| Chart of Accounts | 11 starter accounts (see below) |

### 15.2 Starter Chart of Accounts

| Code | Name | Type |
|------|------|------|
| 1110 | Cash | Current Asset |
| 1120 | Accounts Receivable | Current Asset |
| 1130 | Supplies | Current Asset |
| 1210 | Equipment | Non-Current Asset |
| 2110 | Accounts Payable | Current Liability |
| 3100 | Owner's Capital | Equity |
| 3200 | Owner's Drawings | Equity |
| 4100 | Service Revenue | Revenue |
| 5100 | Rent Expense | Expense |
| 5200 | Utilities Expense | Expense |
| 5300 | Salaries Expense | Expense |

### 15.3 Planned Practice Set Catalog

| Practice Set | Description | COA Template | Sample JEs |
|--------------|-------------|--------------|------------|
| Laundry Shop | Service business | Service-focused COA | Optional |
| Car Wash | Service business | Equipment-heavy | Optional |
| Restaurant | Food service | COGS, inventory hints | Optional |
| Dental Clinic | Professional service | Receivables-heavy | Optional |
| Retail Store | Merchandising | Inventory, COGS | Optional |
| Repair Shop | Mixed service/parts | Supplies, equipment | Optional |
| Coffee Shop | Food & beverage | Supplies, revenue | Optional |

**Each template includes:** Pre-built COA, fiscal year, optional starter transactions.  
**Student action:** Select template at onboarding (planned) instead of generic auto-provision.

---

## 16. Laboratory Activities

### 16.1 Purpose

Support structured accounting laboratory exercises used in educational institutions where students complete assigned problems and compare results against expected outcomes.

### 16.2 Status: PLANNED (Not Yet Implemented)

### 16.3 Functional Requirements

| Function | Description |
|----------|-------------|
| Select exercise | Student chooses from instructor-assigned lab activities |
| View instructions | Problem description, given data, requirements |
| Encode journal entries | Standard JE workflow within lab context |
| Generate reports | T-Accounts, GL, TB, FS from student's entries |
| Compare results | Side-by-side or check against expected answer key |
| Submit | Mark exercise complete for instructor review |

### 16.4 Workflow

```
Instructor creates lab activity with expected outcomes
        ↓
Student selects exercise
        ↓
Student records journal entries
        ↓
System auto-generates all reports
        ↓
Student compares with expected results
        ↓
Instructor reviews submission
```

### 16.5 Data Model (Planned)

- `laboratory_activities` — exercise definitions
- `laboratory_submissions` — student attempts
- Expected journal entries / balances stored as reference data (not mixed with live accounting truth)

---

## 17. Reports

### 17.1 Export Matrix

| Report | Print | PDF | Excel/CSV |
|--------|-------|-----|-----------|
| Journal Entry (detail) | ✅ | 🔶 | 🔶 |
| T-Accounts | ✅ | 🔶 | 🔶 |
| General Ledger | ✅ | 🔶 | 🔶 |
| Trial Balance | ✅ | 🔶 | 🔶 |
| Statement of Financial Position | ✅ | 🔶 | 🔶 |
| Income Statement | ✅ | 🔶 | 🔶 |
| Statement of Changes in Equity | ✅ | 🔶 | 🔶 |
| Financial Ratio Report | ✅ | ✅ (print dialog) | ✅ (CSV) |
| FA Dashboard Summary | ✅ | ✅ (print dialog) | ✅ (CSV) |
| FA Insights | ✅ | ✅ (print dialog) | ✅ (CSV) |
| Audit Trail | ✅ | 🔶 | 🔶 |

**Legend:** ✅ Implemented · 🔶 Planned

### 17.2 Export Strategy (FRS Target)

| Format | Method |
|--------|--------|
| Print | Browser `window.print()` with print CSS |
| PDF | Phase 1: print-to-PDF; Phase 2: server-side PDF generation |
| Excel | Client-side CSV download (Excel-compatible); future: formatted XLSX |

---

## 18. Future Enhancements

The following are explicitly **out of scope** for the current freeze. They must not be implemented without FRS revision.

| Enhancement | Rationale for Deferral |
|-------------|------------------------|
| Inventory module | Requires subledger; affects COGS, turnover ratios |
| Accounts Receivable subledger | Required for receivable turnover |
| Accounts Payable subledger | ERP scope |
| Payroll module | ERP scope |
| Cash Flow Statement | Additional statement; indirect method complexity |
| AI Financial Insights | FRS mandates rule-based only |
| Budgeting & Forecasting | Beyond education scope |
| Bank reconciliation | Operational accounting |
| Multi-currency | Complexity beyond introductory courses |
| Fixed asset depreciation engine | Optional advanced topic |
| Gamification (badges, quizzes, achievements) | Explicitly prohibited |
| Server-side PDF for all reports | Phase 2 export enhancement |
| Instructor dashboard & grading | Requires Laboratory module first |
| Institution-level multi-tenancy | Admin module prerequisite |

---

## 19. Architectural Review — Gaps & Recommendations

### 19.1 Identified Inconsistencies

| # | Issue | Severity | Recommendation |
|---|-------|----------|----------------|
| I1 | Income Statement uses cumulative balances, not period activity | High | Update `FinancialStatementService` to filter JE lines by date range for P&L |
| I2 | Financial ratios use cumulative P&L, not period | High | Align `FinancialRatioService` with period-based revenue/expenses |
| I3 | Liquidity ratios hardcode account codes 1110/1120 | Medium | Resolve accounts by subtype or configurable mapping |
| I4 | T-Accounts duplicated on GL page and dedicated page | Low | Keep both (educational) but document as intentional |
| I5 | Onboarding route exists but has no UI (redirect only) | Low | Add practice set selection UI or remove route |
| I6 | Company select uses Blade; rest is Inertia | Medium | Migrate to Inertia page |
| I7 | Administration policies exist without UI | High | Implement admin module per FRS Section 5.15 |
| I8 | Audit trail covers JEs only | Medium | Extend to COA changes and period close/lock |
| I9 | GL/TB/FS export stubbed while FA export works | Medium | Standardize export bar across all report pages |
| I10 | Drawing account detection uses name heuristics | Medium | Add `account_subtype` or flag for drawings |
| I11 | Single practice set per student | Medium | Implement practice set catalog (Section 15.3) |
| I12 | No Instructor role distinct from Super Admin | Medium | Add `instructor` role with scoped permissions |

### 19.2 Recommended Module Reorganization

No major reorganization required. The current three-group sidebar (Platform · Accounting · Financial Analysis) aligns with the educational workflow. Recommended additions:

1. **Administration** group (super admin / instructor only) — when UI is built
2. **Laboratory** group — when module is built
3. Keep Settings in user menu (not sidebar) — standard UX pattern

### 19.3 Priority Roadmap (Post-Freeze)

| Priority | Item | FRS Section |
|----------|------|-------------|
| P0 | Fix period-based P&L and ratios (I1, I2) | 8, 10, 14 |
| P1 | Standardize export across all reports (I9) | 17 |
| P2 | Administration UI (I7) | 5.15 |
| P2 | Practice set catalog (I11) | 15 |
| P3 | Laboratory Activities module | 16 |
| P3 | Instructor role and assignment workflow | 4, 16 |
| P4 | Server-side PDF generation | 17 |
| P4 | Extended audit trail (I8) | 5.9 |

### 19.4 Architecture Principles (Frozen)

1. **Journal entries are the sole accounting source of truth**
2. **All reports are computed dynamically — never stored**
3. **No ERP modules without FRS amendment**
4. **No gamification**
5. **No AI-generated insights**
6. **Professional UI suitable for accounting education**
7. **Full account traceability on all report figures**
8. **Company-scoped multi-tenancy via session context**
9. **Posted entry immutability enforced at DB and application layers**
10. **Educational focus over operational completeness**

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Owner | | | |
| Lead Developer | | | |
| Instructor Representative | | | |

---

*End of Functional Requirements Specification v1.0*
