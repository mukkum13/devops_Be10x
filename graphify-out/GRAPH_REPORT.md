# Graph Report - devops_be10x  (2026-11-14)

## Corpus Check
- 2 files · ~7,215 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 79 nodes · 219 edges · 13 communities (11 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- bindEvents
- app.js
- PRD: Personal Finance Webapp (working name: "PocketLedger")
- renderBudgets
- importCsv
- money
- showToast
- openTransaction
- 1. Overview
- categoryStyle
- 6. UX Requirements
- 4. Functional Requirements
- 7. Suggested Technical Approach (for Engineering to confirm)

## God Nodes (most connected - your core abstractions)
1. `renderAll()` - 17 edges
2. `bindEvents()` - 17 edges
3. `showToast()` - 14 edges
4. `PRD: Personal Finance Webapp (working name: "PocketLedger")` - 13 edges
5. `saveState()` - 12 edges
6. `renderSummary()` - 12 edges
7. `renderBudgets()` - 11 edges
8. `renderTransactions()` - 10 edges
9. `importCsv()` - 10 edges
10. `escapeHtml()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `bindEvents()` --indirect_call--> `renderTransactions()`  [INFERRED]
  app.js → app.js  _Bridges community 3 → community 0_
- `bindEvents()` --indirect_call--> `exportCsv()`  [INFERRED]
  app.js → app.js  _Bridges community 6 → community 0_
- `bindEvents()` --indirect_call--> `addCategory()`  [INFERRED]
  app.js → app.js  _Bridges community 4 → community 0_
- `renderBudgets()` --calls--> `money()`  [EXTRACTED]
  app.js → app.js  _Bridges community 5 → community 3_
- `renderCategoryChart()` --calls--> `money()`  [EXTRACTED]
  app.js → app.js  _Bridges community 5 → community 9_

## Import Cycles
- None detected.

## Communities (13 total, 2 thin omitted)

### Community 0 - "bindEvents"
Cohesion: 0.45
Nodes (11): addBudget(), archiveCategory(), bindEvents(), deleteTransaction(), editBudget(), handleTransactionSubmit(), init(), parseAmount() (+3 more)

### Community 1 - "app.js"
Cohesion: 0.51
Nodes (9): monthKey(), monthLabel(), monthSelectOptions(), monthStart(), renderSummary(), renderTrend(), setMetricPill(), setMonthOptions() (+1 more)

### Community 2 - "PRD: Personal Finance Webapp (working name: "PocketLedger")"
Cohesion: 0.20
Nodes (9): 10. Risks & Mitigations, 11. Open Questions, 12. Acceptance Criteria (MVP sample), 2. Target Users, 3. User Stories, 5. Non-Functional Requirements, 8. Success Metrics, 9. Release Plan (+1 more)

### Community 3 - "renderBudgets"
Cohesion: 0.50
Nodes (8): escapeAttr(), escapeHtml(), iconFor(), navigate(), renderBudgets(), renderCategories(), renderTransactions(), updateHeader()

### Community 4 - "importCsv"
Cohesion: 0.33
Nodes (7): addCategory(), importCsv(), makeId(), parseCsv(), seedTransactions(), toDateKey(), transactionSignature()

### Community 5 - "money"
Cohesion: 0.40
Nodes (6): budgetState(), formatDate(), money(), monthTransactions(), renderDashboardBudgets(), renderRecent()

### Community 6 - "showToast"
Cohesion: 0.40
Nodes (6): confirmReset(), csvEscape(), exportCsv(), initialState(), loadState(), showToast()

### Community 7 - "openTransaction"
Cohesion: 0.50
Nodes (5): clearFormErrors(), openTransaction(), setTransactionType(), updateTransactionCategoryList(), validateTransaction()

### Community 8 - "1. Overview"
Cohesion: 0.40
Nodes (5): 1.1 Problem, 1.2 Product Vision, 1.3 Goals, 1.4 Non-Goals (MVP), 1. Overview

### Community 9 - "categoryStyle"
Cohesion: 0.67
Nodes (4): categoryColor(), categoryStyle(), hexToRgba(), renderCategoryChart()

### Community 10 - "6. UX Requirements"
Cohesion: 0.67
Nodes (3): 6. UX Requirements, Key screens, UX principles

## Knowledge Gaps
- **16 isolated node(s):** `1.1 Problem`, `1.2 Product Vision`, `1.3 Goals`, `1.4 Non-Goals (MVP)`, `2. Target Users` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 17 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PRD: Personal Finance Webapp (working name: "PocketLedger")` connect `PRD: Personal Finance Webapp (working name: "PocketLedger")` to `1. Overview`, `6. UX Requirements`, `4. Functional Requirements`, `7. Suggested Technical Approach (for Engineering to confirm)`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `bindEvents()` (e.g. with `addBudget()` and `addCategory()`) actually correct?**
  _`bindEvents()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `1.1 Problem`, `1.2 Product Vision`, `1.3 Goals` to the rest of the system?**
  _16 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Why does `1. Overview` connect `1. Overview` to `PRD: Personal Finance Webapp (working name: "PocketLedger")`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `6. UX Requirements` connect `6. UX Requirements` to `PRD: Personal Finance Webapp (working name: "PocketLedger")`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._