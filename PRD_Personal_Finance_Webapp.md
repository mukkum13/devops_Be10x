# PRD: Personal Finance Webapp (working name: "PocketLedger")

| | |
|---|---|
| **Author** | Product Team |
| **Date** | 2026-11-14 |
| **Status** | Draft v0.1 for review |
| **Target** | MVP |

---

## 1. Overview

### 1.1 Problem
Most people don't know where their money goes each month. Spreadsheets are tedious, and full-featured apps (bank-linking, investing, credit scores) are heavy, intrusive, or paid. Users want a fast, simple way to record spending, see trends, and stay within a budget.

### 1.2 Product Vision
A lightweight, privacy-respecting web app that lets an individual track income and expenses, set monthly budgets, and understand their finances at a glance, in under 60 seconds a day.

### 1.3 Goals
1. Let a new user log their first transaction within 2 minutes of signing up.
2. Give a clear monthly picture: income, spending, savings, budget status.
3. Help users stay on budget through simple alerts.
4. Keep scope small: manual entry first, no bank integrations in MVP.

### 1.4 Non-Goals (MVP)
- Bank/card account linking (Plaid etc.)
- Investment, crypto, or tax tracking
- Multi-user / shared household budgets
- Bill payment or any money movement
- Native mobile apps (web is responsive only)
- Financial advice

---

## 2. Target Users

| Persona | Description | Key need |
|---|---|---|
| **Aarav, 24, early-career professional** | First salary, no budgeting habit | See where money goes, save more |
| **Meera, 32, freelancer** | Irregular income | Track income vs. expenses per month |
| **Rohan, 40, family earner** | Many recurring bills | Don't overspend; track recurring costs |

**Primary user:** An individual (18-45) managing personal money alone, comfortable with web apps, not a finance expert.

---

## 3. User Stories

**Account**
- As a user, I can sign up / log in with email + password (or Google) so my data is saved.
- As a user, I can reset my password and delete my account and data.

**Transactions**
- As a user, I can add an expense or income with amount, date, category, and optional note.
- As a user, I can edit or delete a transaction.
- As a user, I can search and filter transactions by date range, category, type, and amount.
- As a user, I can mark a transaction as recurring (weekly / monthly) so it auto-creates.

**Categories**
- As a user, I get sensible default categories (Food, Rent, Transport, Bills, Shopping, Health, Entertainment, Salary, Other) and can add/rename/archive my own.

**Budgets**
- As a user, I can set a monthly budget per category and an overall monthly budget.
- As a user, I see progress bars and get a warning at 80% and 100% of a budget.

**Dashboard & Insights**
- As a user, I see this month's income, expenses, net savings, and top spending categories on one screen.
- As a user, I see a spending-by-category chart and a monthly trend chart (last 6 months).

**Data**
- As a user, I can import transactions from CSV and export all my data as CSV.

---

## 4. Functional Requirements

Priority: **P0** = MVP must-have, **P1** = should-have, **P2** = later.

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Email/password auth with verification and password reset | P0 |
| FR-2 | Google sign-in | P1 |
| FR-3 | Create / read / update / delete transactions (amount, type, date, category, note) | P0 |
| FR-4 | Default + custom categories | P0 |
| FR-5 | Transaction list with filter, sort, search, pagination | P0 |
| FR-6 | Dashboard: monthly income, expense, net, top categories | P0 |
| FR-7 | Charts: category breakdown (donut), 6-month trend (bar/line) | P0 |
| FR-8 | Monthly budgets per category + overall, with progress display | P0 |
| FR-9 | Budget alerts (in-app) at 80% / 100% | P1 |
| FR-10 | Recurring transactions (weekly/monthly) | P1 |
| FR-11 | CSV export | P0 |
| FR-12 | CSV import with column mapping and duplicate detection | P1 |
| FR-13 | Savings goals (target amount, deadline, progress) | P2 |
| FR-14 | Multi-currency display (single base currency in MVP) | P2 |
| FR-15 | Dark mode | P2 |
| FR-16 | Delete account and all data | P0 |

### Business rules
- Amounts stored as integer minor units (e.g., paise/cents) to avoid floating-point errors.
- One base currency per user, chosen at signup (default INR; configurable).
- Month boundaries use the user's time zone.
- Deleting a category with transactions requires reassigning or archiving; transactions are never orphaned.
- Budgets roll over each month using the previous month's values unless edited.

---

## 5. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Performance** | Dashboard loads < 2 s on 4G; list of 10,000 transactions stays responsive via pagination |
| **Security** | HTTPS only; passwords hashed (argon2/bcrypt); OWASP Top 10 mitigations; session/JWT expiry; rate-limited login |
| **Privacy** | No selling of data; no bank credentials stored; user can export/delete all data; privacy policy at launch |
| **Availability** | 99.5% uptime target; daily DB backups |
| **Accessibility** | WCAG 2.1 AA; keyboard navigable; charts have text alternatives |
| **Responsiveness** | Works on mobile (≥360 px), tablet, desktop |
| **Browser support** | Latest 2 versions of Chrome, Safari, Firefox, Edge |
| **Compliance** | Follow applicable data-protection law (e.g., India DPDP Act, GDPR if EU users) |

---

## 6. UX Requirements

### Key screens
1. **Landing / Sign up / Log in**
2. **Dashboard** (default after login): month selector, KPI cards (Income, Expenses, Net), category donut, trend chart, budget progress, recent transactions
3. **Transactions**: table with filters; "+ Add transaction" button always visible
4. **Add/Edit transaction**: modal or drawer; keyboard-friendly; remembers last-used category
5. **Budgets**: per-category budget list with progress bars
6. **Categories** (settings)
7. **Settings**: profile, currency, time zone, export/import, delete account

### UX principles
- Adding a transaction takes ≤ 3 taps/clicks plus typing the amount.
- Empty states guide the user to the next action.
- Color is never the only status signal (green/amber/red plus icons and text).
- Destructive actions require confirmation and offer undo where possible.

---

## 7. Suggested Technical Approach (for Engineering to confirm)

- **Frontend:** React (or Next.js) + TypeScript, Tailwind, a charting library (Recharts/Chart.js)
- **Backend:** Node.js (or Python/FastAPI) REST API
- **Database:** PostgreSQL
- **Auth:** Managed provider or well-vetted library (e.g., Auth.js, Supabase Auth)
- **Hosting:** Vercel / Render / similar; managed Postgres

### Core data model
- `User(id, email, password_hash, base_currency, timezone, created_at)`
- `Category(id, user_id, name, type[income|expense], archived)`
- `Transaction(id, user_id, category_id, type, amount_minor, date, note, recurring_rule_id, created_at)`
- `Budget(id, user_id, category_id|null, month, amount_minor)`
- `RecurringRule(id, user_id, frequency, next_run_date, template_fields)`

---

## 8. Success Metrics

| Metric | Target (90 days post-launch) |
|---|---|
| Activation: signup → first transaction within 24 h | ≥ 60% |
| Week-4 retention | ≥ 30% |
| Weekly active users logging ≥ 3 transactions | ≥ 40% of actives |
| Users with at least one budget set | ≥ 50% |
| Dashboard p75 load time | < 2 s |
| Support tickets per 100 users | < 5 |
| CSAT / NPS | ≥ 40 NPS |

---

## 9. Release Plan

| Phase | Scope | Notes |
|---|---|---|
| **Alpha** (internal) | FR-1, 3, 4, 5, 6 | Core loop working |
| **Beta** (50-100 users) | + FR-7, 8, 11, 16 | Collect feedback, measure activation |
| **MVP launch** | + FR-9, 10, 12 (P1s as capacity allows) | Public launch |
| **Post-MVP** | Savings goals, multi-currency, dark mode, bank linking evaluation | Based on data |

Suggested timeline: ~8-10 weeks for MVP with 1 designer, 2 engineers, 1 PM/QA (estimate; Engineering to validate).

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Manual entry causes drop-off | Low retention | Fast entry UX, recurring transactions, CSV import; evaluate bank linking post-MVP |
| Security breach of financial data | Severe trust loss | Security review before beta, minimal data stored, encryption at rest/in transit |
| Scope creep | Delays | Strict P0/P1/P2 gating; non-goals list |
| Users distrust a new finance app | Low signups | Clear privacy stance, easy data export/delete |

---

## 11. Open Questions

1. Target market and default currency/locale (India-first, or global)?
2. Free forever, freemium, or paid? Any monetization in MVP?
3. Is Google sign-in required at launch or can it follow?
4. Do we need email notifications for budget alerts, or in-app only?
5. Data residency requirements?
6. Brand name and visual identity: who owns it?

---

## 12. Acceptance Criteria (MVP sample)

- **Add transaction:** Given a logged-in user, when they submit a valid amount, date, and category, then the transaction appears in the list and dashboard totals update immediately.
- **Budget alert:** Given a ₹10,000 Food budget, when Food spending reaches ₹8,000, then the user sees an 80% warning; at ₹10,000 a 100% alert.
- **Export:** Given a user with transactions, when they click Export CSV, then a file with all their transactions downloads, with columns matching the import format.
- **Delete account:** When a user confirms deletion, all their data is removed within 30 days and they are logged out immediately.
- **Validation:** Amount must be > 0 and ≤ 9,99,99,999; date cannot be blank; future dates are allowed only for recurring items.
