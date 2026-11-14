(() => {
  "use strict";

  const STORAGE_KEY = "pocketledger-data-v1";
  const palette = ["#78a786", "#e1ad6e", "#7594b8", "#a58ac5", "#d27b6b", "#5ca9a2", "#b28b60", "#8a9b70", "#c27b9b"];
  const categoryIcons = {
    Food: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v7m4-7v7M5 7h8M9 10v11m8-18v18m0-18c2 2 3 4 3 7h-3"/></svg>',
    Rent: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9Z"/></svg>',
    Transport: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9m-14 0h14m-14 0-1 3m15-3 1 3M7 9h10M8 13h.01M16 13h.01M7 19h2m6 0h2"/></svg>',
    Bills: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2v-17Z"/><path d="M9 8h6m-6 4h6m-6 4h3"/></svg>',
    Shopping: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
    Health: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/><path d="M9 12h6m-3-3v6"/></svg>',
    Entertainment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 17 5-10 5 10 3-6 3 6H4Z"/><path d="M5 20h14"/></svg>',
    Salary: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18m-9 2v3m-2-2h4"/></svg>',
    Other: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
    default: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="M8 9h8m-8 4h5"/></svg>'
  };
  const defaultCategories = [
    { id: "food", name: "Food", type: "expense", archived: false },
    { id: "rent", name: "Rent", type: "expense", archived: false },
    { id: "transport", name: "Transport", type: "expense", archived: false },
    { id: "bills", name: "Bills", type: "expense", archived: false },
    { id: "shopping", name: "Shopping", type: "expense", archived: false },
    { id: "health", name: "Health", type: "expense", archived: false },
    { id: "entertainment", name: "Entertainment", type: "expense", archived: false },
    { id: "salary", name: "Salary", type: "income", archived: false },
    { id: "other", name: "Other", type: "expense", archived: false }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const today = new Date();
  const todayKey = toDateKey(today);
  let state = loadState();
  let selectedMonth = monthKey(today);
  let toastTimer;
  let pendingDelete = null;

  function toDateKey(date) {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  }

  function monthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function monthStart(key) {
    const [year, month] = key.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  function money(minor) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    }).format(Math.round(minor / 100));
  }

  function parseAmount(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 99999999) return null;
    return Math.round(amount * 100);
  }

  function makeId() {
    return globalThis.crypto?.randomUUID?.() ?? `pl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function seedTransactions() {
    const entries = [
      [0, 2, "expense", "Rent", 18500, "Monthly rent"],
      [0, 3, "expense", "Food", 420, "Coffee & breakfast"],
      [0, 5, "income", "Salary", 82000, "Monthly salary"],
      [0, 6, "expense", "Transport", 1850, "Metro card"],
      [0, 8, "expense", "Bills", 2340, "Electricity & internet"],
      [0, 10, "expense", "Food", 680, "Groceries"],
      [0, 12, "expense", "Shopping", 2499, "Everyday essentials"],
      [0, 15, "expense", "Health", 960, "Pharmacy"],
      [0, 17, "expense", "Food", 780, "Dinner with friends"],
      [0, 20, "expense", "Entertainment", 599, "Movie night"],
      [-2, 3, "expense", "Rent", 18500, "Monthly rent"],
      [-2, 5, "income", "Salary", 82000, "Monthly salary"],
      [-2, 9, "expense", "Food", 3650, "Groceries & meals"],
      [-2, 14, "expense", "Bills", 2100, "Monthly bills"],
      [-2, 20, "expense", "Transport", 2200, "Commute"],
      [-1, 2, "expense", "Rent", 18500, "Monthly rent"],
      [-1, 5, "income", "Salary", 82000, "Monthly salary"],
      [-1, 10, "expense", "Food", 3250, "Groceries & meals"],
      [-1, 18, "expense", "Bills", 2200, "Monthly bills"],
      [-3, 2, "expense", "Rent", 18500, "Monthly rent"],
      [-3, 5, "income", "Salary", 82000, "Monthly salary"],
      [-3, 11, "expense", "Food", 2950, "Groceries & meals"],
      [-3, 16, "expense", "Shopping", 3100, "Household items"],
      [-3, 23, "expense", "Bills", 2250, "Monthly bills"],
      [-4, 4, "expense", "Rent", 18500, "Monthly rent"],
      [-4, 5, "income", "Salary", 82000, "Monthly salary"],
      [-4, 13, "expense", "Food", 3400, "Groceries & meals"],
      [-4, 18, "expense", "Transport", 1850, "Commute"],
      [-5, 2, "expense", "Rent", 18500, "Monthly rent"],
      [-5, 5, "income", "Salary", 79000, "Monthly salary"],
      [-5, 12, "expense", "Food", 3850, "Groceries & meals"],
      [-5, 19, "expense", "Bills", 2180, "Monthly bills"]
    ];
    return entries.map(([offset, day, type, category, amount, note]) => {
      const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
      base.setDate(Math.min(day, lastDay, offset === 0 ? today.getDate() : lastDay));
      return { id: makeId(), type, category, amount: amount * 100, date: toDateKey(base), note, recurring: false };
    });
  }

  function initialState() {
    const expenses = defaultCategories.filter(category => category.type === "expense");
    const budgets = Object.fromEntries(expenses.map(category => [category.name, 1000000]));
    budgets.Rent = 2000000;
    budgets.Food = 1200000;
    budgets.Transport = 500000;
    budgets.Bills = 400000;
    budgets.Shopping = 400000;
    return { categories: structuredClone(defaultCategories), transactions: seedTransactions(), budgets };
  }

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return initialState();
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.categories) || !parsed.budgets) throw new Error("Saved finance data is incomplete.");
      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error("PocketLedger could not read saved data.", error);
        showToast("Saved data could not be read. Your demo data has been restored.", true);
        return initialState();
      }
      if (error instanceof Error && error.message !== "Saved finance data is incomplete.") throw error;
      console.error("PocketLedger could not read saved data.", error);
      return initialState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("PocketLedger could not save data to this browser.", error);
      showToast("Could not save your changes in this browser. Check available storage.", true);
    }
  }

  function categoryColor(name) {
    const index = Math.max(0, state.categories.findIndex(category => category.name === name));
    return palette[index % palette.length];
  }

  function categoryStyle(name) {
    const color = categoryColor(name);
    return `--category-color:${color};--category-soft:${hexToRgba(color, .12)}`;
  }

  function hexToRgba(hex, alpha) {
    const value = hex.replace("#", "");
    const number = Number.parseInt(value, 16);
    return `rgba(${number >> 16}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
  }

  function iconFor(name) {
    return categoryIcons[name] || categoryIcons.default;
  }

  function monthTransactions(key) {
    return state.transactions.filter(transaction => transaction.date.slice(0, 7) === key);
  }

  function totalsFor(key) {
    return monthTransactions(key).reduce((totals, transaction) => {
      totals[transaction.type] += transaction.amount;
      return totals;
    }, { income: 0, expense: 0 });
  }

  function monthLabel(key, options = { month: "long", year: "numeric" }) {
    return new Intl.DateTimeFormat("en-IN", options).format(monthStart(key));
  }

  function monthSelectOptions() {
    const select = $("#month-select");
    const current = new Date(today.getFullYear(), today.getMonth(), 1);
    select.innerHTML = "";
    for (let offset = -11; offset <= 0; offset += 1) {
      const date = new Date(current.getFullYear(), current.getMonth() + offset, 1);
      const key = monthKey(date);
      const option = document.createElement("option");
      option.value = key;
      option.textContent = monthLabel(key);
      select.append(option);
    }
    select.value = selectedMonth;
  }

  function setMonthOptions() {
    const filters = $("#transaction-month-filter");
    const values = [...new Set(state.transactions.map(item => item.date.slice(0, 7)))].sort().reverse();
    filters.innerHTML = '<option value="all">All months</option>';
    values.forEach(key => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = monthLabel(key);
      filters.append(option);
    });
  }

  function updateHeader(view) {
    const titles = {
      dashboard: `Good ${today.getHours() < 12 ? "morning" : today.getHours() < 18 ? "afternoon" : "evening"}, Alex`,
      transactions: "Your transactions",
      budgets: "Plan with intention",
      categories: "A system that fits you"
    };
    $("#page-title").textContent = titles[view] || titles.dashboard;
    $("#current-date-label").textContent = view === "dashboard" ? "YOUR MONEY, IN FOCUS" : "POCKETLEDGER WORKSPACE";
  }

  function navigate(view) {
    const target = $(`#view-${view}`);
    if (!target) return;
    $$(".view").forEach(section => {
      const isActive = section === target;
      section.classList.toggle("is-visible", isActive);
      section.hidden = !isActive;
    });
    $$(".nav-link").forEach(button => button.classList.toggle("is-active", button.dataset.navigation === view));
    updateHeader(view);
    $("#main-content").focus({ preventScroll: true });
    if (view === "transactions") renderTransactions();
    if (view === "budgets") renderBudgets();
    if (view === "categories") renderCategories();
  }

  function renderSummary() {
    const totals = totalsFor(selectedMonth);
    const prior = totalsFor(monthKey(new Date(monthStart(selectedMonth).getFullYear(), monthStart(selectedMonth).getMonth() - 1, 1)));
    const savings = totals.income - totals.expense;
    const totalBudget = Object.values(state.budgets).reduce((sum, value) => sum + value, 0);
    const budgetRemaining = totalBudget - totals.expense;
    const incomeDiff = prior.income ? Math.round((totals.income - prior.income) / prior.income * 100) : 0;
    const expenseDiff = prior.expense ? Math.round((totals.expense - prior.expense) / prior.expense * 100) : 0;
    $("#income-total").textContent = money(totals.income);
    $("#expense-total").textContent = money(totals.expense);
    $("#savings-total").textContent = money(savings);
    $("#budget-left").textContent = money(budgetRemaining);
    setMetricPill($("#income-change"), incomeDiff, true);
    setMetricPill($("#expense-change"), expenseDiff, false);
    $("#savings-rate").textContent = `${totals.income ? Math.round(savings / totals.income * 100) : 0}% saved`;
    const usage = totalBudget ? Math.round(totals.expense / totalBudget * 100) : 0;
    $("#budget-usage").textContent = `${usage}% used`;
    $("#budget-usage").className = `metric-pill ${usage >= 100 ? "negative" : usage >= 80 ? "neutral" : "positive"}`;
    $("#month-status-label").textContent = selectedMonth === monthKey(today) ? "Month in progress" : monthLabel(selectedMonth);
    renderTrend();
    renderCategoryChart(totals.expense);
    renderDashboardBudgets();
    renderRecent();
  }

  function setMetricPill(element, percentage, inverse) {
    element.textContent = `${percentage > 0 ? "+" : ""}${percentage}%`;
    const isGood = inverse ? percentage >= 0 : percentage <= 0;
    element.className = `metric-pill ${isGood ? "positive" : "negative"}`;
  }

  function renderTrend() {
    const months = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = monthStart(selectedMonth);
      date.setMonth(date.getMonth() - offset);
      const key = monthKey(date);
      months.push({ key, totals: totalsFor(key), label: monthLabel(key, { month: "short" }) });
    }
    const max = Math.max(100, ...months.flatMap(item => [item.totals.income, item.totals.expense]));
    const width = 620;
    const height = 177;
    const left = 43;
    const right = 8;
    const top = 12;
    const bottom = 23;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const y = value => top + plotHeight - value / max * plotHeight;
    const x = index => left + index * plotWidth / (months.length - 1);
    const formatTick = value => {
      const rupees = value / 100;
      if (rupees >= 10000000) return `${Math.round(rupees / 10000000)}Cr`;
      if (rupees >= 100000) return `${Math.round(rupees / 100000)}L`;
      if (rupees >= 1000) return `${Math.round(rupees / 1000)}k`;
      return String(Math.round(rupees));
    };
    const ticks = [0, max / 2, max];
    const grid = ticks.map(value => `<line class="chart-grid-line" x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}"></line><text class="chart-label" x="${left - 8}" y="${y(value) + 3}" text-anchor="end">${formatTick(value)}</text>`).join("");
    const pathFor = key => months.map((item, index) => `${index ? "L" : "M"}${x(index)},${y(item.totals[key])}`).join(" ");
    const points = key => months.map((item, index) => `<circle class="chart-point-${key}" cx="${x(index)}" cy="${y(item.totals[key])}" r="3.5"><title>${item.label}: ${money(item.totals[key])} ${key}</title></circle>`).join("");
    const labels = months.map((item, index) => `<text class="chart-label" x="${x(index)}" y="${height - 4}" text-anchor="middle">${item.label}</text>`).join("");
    $("#trend-chart").innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Monthly income and expense comparison"><g>${grid}</g><path class="chart-line-income" d="${pathFor("income")}"></path><path class="chart-line-expense" d="${pathFor("expense")}"></path>${points("income")}${points("expense")}${labels}</svg>`;
    $("#trend-description").textContent = months.map(item => `${monthLabel(item.key)}: income ${money(item.totals.income)}, expenses ${money(item.totals.expense)}.`).join(" ");
  }

  function renderCategoryChart(total) {
    const totals = {};
    monthTransactions(selectedMonth).filter(item => item.type === "expense").forEach(item => {
      totals[item.category] = (totals[item.category] || 0) + item.amount;
    });
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    let cursor = 0;
    const slices = entries.map(([name, value]) => {
      const start = cursor;
      cursor += total ? value / total * 100 : 0;
      return `${categoryColor(name)} ${start}% ${cursor}%`;
    });
    $("#category-donut").style.background = slices.length ? `conic-gradient(${slices.join(", ")})` : "conic-gradient(#dbe8df 0 100%)";
    $("#category-donut").setAttribute("aria-label", entries.length ? `Spending by category: ${entries.map(([name, value]) => `${name} ${money(value)}`).join(", ")}` : "No spending recorded this month");
    $("#donut-total").textContent = money(total);
    $("#category-legend").innerHTML = entries.length
      ? entries.slice(0, 5).map(([name, value]) => `<li style="${categoryStyle(name)}"><i class="legend-dot"></i><span>${escapeHtml(name)}</span><strong>${money(value)} <span class="category-percent">${total ? Math.round(value / total * 100) : 0}%</span></strong></li>`).join("")
      : '<li class="legend-empty">Add an expense to see your breakdown.</li>';
  }

  function budgetState(spent, budget) {
    const ratio = budget > 0 ? spent / budget : 0;
    return { ratio, percent: Math.round(ratio * 100), kind: ratio >= 1 ? "over" : ratio >= .8 ? "warning" : "good" };
  }

  function renderDashboardBudgets() {
    const list = $("#dashboard-budget-list");
    const entries = Object.entries(state.budgets).map(([name, budget]) => {
      const spent = monthTransactions(selectedMonth).filter(item => item.type === "expense" && item.category === name).reduce((sum, item) => sum + item.amount, 0);
      return { name, budget, spent, state: budgetState(spent, budget) };
    }).sort((a, b) => b.spent / (b.budget || 1) - a.spent / (a.budget || 1)).slice(0, 4);
    list.innerHTML = entries.length ? entries.map(({ name, budget, spent, state: status }) => `
      <div class="budget-row">
        <div class="budget-row-top"><span class="category-symbol" style="${categoryStyle(name)}">${iconFor(name)}</span><span class="budget-row-name">${escapeHtml(name)}</span><strong class="budget-row-amount">${money(spent)} <span style="color:#a0aaa4;font-weight:400">/ ${money(budget)}</span></strong></div>
        <div class="progress-track" aria-label="${escapeHtml(name)} budget ${status.percent}% used"><span class="${status.kind === "good" ? "" : status.kind === "warning" ? "is-warning" : "is-over"}" style="width:${Math.min(100, status.percent)}%"></span></div>
        <div class="budget-row-footer"><span>${money(Math.max(0, budget - spent))} left</span><span class="budget-state ${status.kind}">${status.kind === "over" ? "Over budget" : status.kind === "warning" ? "Almost there" : `${status.percent}% used`}</span></div>
      </div>`).join("") : '<div class="empty-inline">No budgets yet. Add one to start planning.</div>';
  }

  function renderRecent() {
    const list = $("#recent-transactions");
    const entries = monthTransactions(selectedMonth).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    list.innerHTML = entries.length ? entries.map(transaction => `
      <div class="recent-item">
        <span class="recent-icon" style="${categoryStyle(transaction.category)}">${iconFor(transaction.category)}</span>
        <span class="recent-description"><strong>${escapeHtml(transaction.note || transaction.category)}</strong><span>${escapeHtml(transaction.category)} · ${formatDate(transaction.date)}</span></span>
        <span class="recent-amount ${transaction.type}">${transaction.type === "income" ? "+" : "−"}${money(transaction.amount)}</span>
      </div>`).join("") : '<div class="empty-inline">No transactions this month yet.</div>';
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${date}T00:00:00`));
  }

  function renderTransactions() {
    const query = $("#transaction-search").value.trim().toLocaleLowerCase();
    const type = $("#type-filter").value;
    const category = $("#category-filter").value;
    const month = $("#transaction-month-filter").value;
    const transactions = state.transactions.filter(item => {
      const matchesQuery = !query || `${item.note} ${item.category} ${item.type}`.toLocaleLowerCase().includes(query);
      return matchesQuery && (type === "all" || item.type === type) && (category === "all" || item.category === category) && (month === "all" || item.date.startsWith(month));
    }).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    $("#transaction-rows").innerHTML = transactions.map(item => `
      <tr>
        <td><div class="transaction-cell"><span class="recent-icon" style="${categoryStyle(item.category)}">${iconFor(item.category)}</span><span class="transaction-cell-copy"><strong>${escapeHtml(item.note || item.category)}</strong><span>${item.recurring ? `Recurring · ${escapeHtml(item.frequency || "monthly")}` : "Manual entry"}</span></span></div></td>
        <td><span class="category-tag" style="${categoryStyle(item.category)}"><i class="legend-dot"></i>${escapeHtml(item.category)}</span></td>
        <td>${formatDate(item.date)}</td><td><span class="type-tag ${item.type}">${item.type === "income" ? "Income" : "Expense"}</span></td>
        <td class="transaction-amount ${item.type}">${item.type === "income" ? "+" : "−"}${money(item.amount)}</td>
        <td><div class="row-actions"><button class="icon-button" type="button" data-edit="${escapeAttr(item.id)}" aria-label="Edit ${escapeAttr(item.note || item.category)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/></svg></button><button class="icon-button danger" type="button" data-delete="${escapeAttr(item.id)}" aria-label="Delete ${escapeAttr(item.note || item.category)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16m-10 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/></svg></button></div></td>
      </tr>`).join("");
    $("#transaction-empty").hidden = transactions.length > 0;
    $(".transactions-table").hidden = transactions.length === 0;
    $("#transaction-count").textContent = `Showing ${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`;
    $("#transaction-nav-count").textContent = String(state.transactions.length);
  }

  function renderBudgets() {
    const monthTotal = Object.values(state.budgets).reduce((sum, amount) => sum + amount, 0);
    const spentTotal = Object.entries(state.budgets).reduce((sum, [name]) => sum + monthTransactions(selectedMonth).filter(item => item.type === "expense" && item.category === name).reduce((subtotal, item) => subtotal + item.amount, 0), 0);
    const overviewStatus = budgetState(spentTotal, monthTotal);
    $("#overall-budget-total").textContent = money(monthTotal);
    $("#overall-budget-spent").textContent = money(spentTotal);
    $("#overall-budget-progress").style.width = `${Math.min(100, overviewStatus.percent)}%`;
    $("#overall-budget-progress").className = overviewStatus.kind === "warning" ? "is-warning" : overviewStatus.kind === "over" ? "is-over" : "";
    $("#overall-budget-caption").textContent = `${overviewStatus.percent}% of your plan · ${money(Math.max(0, monthTotal - spentTotal))} remaining`;
    const grid = $("#budget-card-grid");
    const entries = Object.entries(state.budgets).sort(([a], [b]) => a.localeCompare(b));
    grid.innerHTML = entries.length ? entries.map(([name, budget]) => {
      const spent = monthTransactions(selectedMonth).filter(item => item.type === "expense" && item.category === name).reduce((sum, item) => sum + item.amount, 0);
      const status = budgetState(spent, budget);
      return `<article class="panel budget-detail-card">
        <div class="budget-detail-top"><span class="category-symbol" style="${categoryStyle(name)}">${iconFor(name)}</span><span class="budget-detail-title"><strong>${escapeHtml(name)}</strong><span>${monthLabel(selectedMonth)}</span></span><button class="icon-button" type="button" data-edit-budget="${escapeAttr(name)}" aria-label="Edit ${escapeAttr(name)} budget"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/></svg></button></div>
        <div class="budget-detail-amounts"><strong>${money(spent)}</strong><span>of ${money(budget)}</span></div>
        <div class="progress-track" aria-label="${escapeHtml(name)} budget ${status.percent}% used"><span class="${status.kind === "good" ? "" : status.kind === "warning" ? "is-warning" : "is-over"}" style="width:${Math.min(100, status.percent)}%"></span></div>
        <div class="budget-detail-footer"><span>${money(Math.max(0, budget - spent))} left</span><strong class="${status.kind}">${status.kind === "over" ? "Over budget" : status.kind === "warning" ? "80%+ used" : `${status.percent}% used`}</strong></div>
      </article>`;
    }).join("") : '<div class="budget-empty"><strong>No budgets yet</strong>Add a category budget to give your spending a gentle limit.</div>';
  }

  function renderCategories() {
    const categoryFilter = $("#category-filter");
    const previousFilter = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="all">All categories</option>';
    state.categories.forEach(category => {
      if (category.archived) return;
      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      categoryFilter.append(option);
    });
    categoryFilter.value = [...categoryFilter.options].some(option => option.value === previousFilter) ? previousFilter : "all";
    $("#category-management-list").innerHTML = state.categories.map(category => `
      <div class="category-management-item ${category.archived ? "is-archived" : ""}">
        <span class="category-symbol" style="${categoryStyle(category.name)}">${iconFor(category.name)}</span>
        <span class="category-management-copy"><strong>${escapeHtml(category.name)}</strong><span>${category.type === "income" ? "Income" : "Expense"}${category.archived ? " · Archived" : ""}</span></span>
        <button class="icon-button" type="button" data-rename-category="${escapeAttr(category.id)}" aria-label="Rename ${escapeAttr(category.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/></svg></button>
        <button class="icon-button ${category.archived ? "" : "danger"}" type="button" data-archive-category="${escapeAttr(category.id)}" aria-label="${category.archived ? "Restore" : "Archive"} ${escapeAttr(category.name)}"><svg viewBox="0 0 24 24" aria-hidden="true">${category.archived ? '<path d="M4 7h16v13H4zM3 4h18v3H3zM9 12h6"/>' : '<path d="M4 7h16v13H4zM3 4h18v3H3zM9 12h6"/>'}</svg></button>
      </div>`).join("");
  }

  function updateTransactionCategoryList(type, selected = "") {
    const select = $("#transaction-category");
    const options = state.categories.filter(category => category.type === type && (!category.archived || category.name === selected));
    select.innerHTML = options.map(category => `<option value="${escapeAttr(category.name)}">${escapeHtml(category.name)}</option>`).join("");
    if (selected && options.some(category => category.name === selected)) select.value = selected;
    if (!options.length) select.innerHTML = `<option value="">Add an ${type} category first</option>`;
  }

  function openTransaction(transaction = null) {
    const form = $("#transaction-form");
    form.reset();
    clearFormErrors();
    $("#transaction-id").value = transaction?.id || "";
    const type = transaction?.type || "expense";
    setTransactionType(type);
    $("#transaction-amount").value = transaction ? (transaction.amount / 100).toFixed(2) : "";
    $("#transaction-date").value = transaction?.date || todayKey;
    $("#transaction-note").value = transaction?.note || "";
    $("#transaction-recurring").checked = transaction?.recurring || false;
    $("#recurring-frequency").hidden = !$("#transaction-recurring").checked;
    $("#recurring-frequency").value = transaction?.frequency || "monthly";
    $("#transaction-dialog-title").textContent = transaction ? "Edit transaction" : "Add a transaction";
    $("#save-transaction").textContent = transaction ? "Save changes" : "Save transaction";
    updateTransactionCategoryList(type, transaction?.category);
    $("#transaction-dialog").showModal();
    requestAnimationFrame(() => $("#transaction-amount").focus());
  }

  function setTransactionType(type) {
    $("#transaction-type").value = type;
    $$("[data-transaction-type]").forEach(button => {
      const active = button.dataset.transactionType === type;
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
    updateTransactionCategoryList(type, $("#transaction-category").value);
  }

  function clearFormErrors() {
    $("#amount-error").textContent = "";
    $("#date-error").textContent = "";
    $(".amount-field").classList.remove("has-error");
    $("#transaction-date").closest(".form-field").classList.remove("has-error");
    $("#form-error-summary").hidden = true;
    $("#form-error-summary").textContent = "";
  }

  function validateTransaction() {
    clearFormErrors();
    const errors = [];
    const amount = parseAmount($("#transaction-amount").value);
    const date = $("#transaction-date").value;
    const recurring = $("#transaction-recurring").checked;
    if (amount === null) {
      $("#amount-error").textContent = "Enter an amount greater than ₹0 and no more than ₹9,99,99,999.";
      $(".amount-field").classList.add("has-error");
      errors.push({ input: $("#transaction-amount"), message: "Check the amount — it must be between ₹0.01 and ₹9,99,99,999." });
    }
    if (!date) {
      $("#date-error").textContent = "Choose a date for this transaction.";
      $("#transaction-date").closest(".form-field").classList.add("has-error");
      errors.push({ input: $("#transaction-date"), message: "Choose a transaction date." });
    } else if (date > todayKey && !recurring) {
      $("#date-error").textContent = "Future dates are available for recurring transactions.";
      $("#transaction-date").closest(".form-field").classList.add("has-error");
      errors.push({ input: $("#transaction-date"), message: "Choose today or an earlier date, or mark this as recurring." });
    }
    if (errors.length) {
      const summary = $("#form-error-summary");
      summary.textContent = errors.map(item => item.message).join(" ");
      summary.hidden = false;
      errors[0].input.focus();
      return false;
    }
    return true;
  }

  function handleTransactionSubmit(event) {
    event.preventDefault();
    if (!validateTransaction()) return;
    const id = $("#transaction-id").value;
    const existing = state.transactions.find(item => item.id === id);
    const transaction = {
      id: id || makeId(),
      type: $("#transaction-type").value,
      category: $("#transaction-category").value,
      amount: parseAmount($("#transaction-amount").value),
      date: $("#transaction-date").value,
      note: $("#transaction-note").value.trim(),
      recurring: $("#transaction-recurring").checked,
      frequency: $("#transaction-recurring").checked ? $("#recurring-frequency").value : ""
    };
    if (!transaction.category) {
      showToast("Add a category for this type before saving.", true);
      return;
    }
    if (existing) state.transactions = state.transactions.map(item => item.id === id ? transaction : item);
    else state.transactions.push(transaction);
    saveState();
    $("#transaction-dialog").close();
    renderAll();
    showToast(existing ? "Transaction updated." : "Transaction saved.");
  }

  function deleteTransaction(id) {
    const transaction = state.transactions.find(item => item.id === id);
    if (!transaction) return;
    const previous = state.transactions;
    state.transactions = state.transactions.filter(item => item.id !== id);
    saveState();
    renderAll();
    showToast(`Removed ${transaction.note || transaction.category}.`, false, () => {
      state.transactions = previous;
      saveState();
      renderAll();
      showToast("Transaction restored.");
    }, "Undo");
  }

  function renderAll() {
    renderSummary();
    renderTransactions();
    renderBudgets();
    renderCategories();
    setMonthOptions();
  }

  function showToast(message, error = false, action = null, actionLabel = "") {
    const region = $("#toast-region");
    const toast = document.createElement("div");
    toast.className = `toast${error ? " error" : ""}`;
    toast.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${error ? '<path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v4m0 3h.01"/>' : '<path d="m5 12 4 4L19 6"/>'}</svg><span>${escapeHtml(message)}</span>${action ? `<button type="button">${escapeHtml(actionLabel)}</button>` : ""}`;
    if (action) $("button", toast).addEventListener("click", () => { action(); toast.remove(); });
    region.replaceChildren(toast);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.remove(), action ? 6000 : 3600);
  }

  function exportCsv() {
    const header = ["id", "date", "type", "category", "amount", "note", "recurring", "frequency"];
    const rows = state.transactions.map(item => [item.id, item.date, item.type, item.category, (item.amount / 100).toFixed(2), item.note || "", item.recurring ? "true" : "false", item.frequency || ""]);
    const csv = [header, ...rows].map(row => row.map(csvEscape).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pocketledger-transactions-${todayKey}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Your transactions are ready to take with you.");
  }

  function csvEscape(value) {
    const text = String(value ?? "");
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if (quoted) {
        if (char === '"' && text[index + 1] === '"') { value += '"'; index += 1; }
        else if (char === '"') quoted = false;
        else value += char;
      } else if (char === '"' && value === "") quoted = true;
      else if (char === ",") { row.push(value); value = ""; }
      else if (char === "\n" || char === "\r") {
        if (char === "\r" && text[index + 1] === "\n") index += 1;
        row.push(value);
        if (row.some(cell => cell.trim())) rows.push(row);
        row = [];
        value = "";
      } else value += char;
    }
    if (quoted) throw new Error("The CSV file has an unfinished quoted field.");
    if (value || row.length) {
      row.push(value);
      if (row.some(cell => cell.trim())) rows.push(row);
    }
    return rows;
  }

  async function importCsv(file) {
    try {
      const rows = parseCsv(await file.text());
      if (rows.length < 2) throw new Error("This CSV has no transaction rows.");
      const headers = rows[0].map(value => value.trim().replace(/^\uFEFF/, "").toLowerCase());
      const required = ["date", "type", "category", "amount"];
      const missing = required.filter(header => !headers.includes(header));
      if (missing.length) throw new Error(`Missing required columns: ${missing.join(", ")}.`);
      const index = name => headers.indexOf(name);
      const signatureSet = new Set(state.transactions.map(transactionSignature));
      const knownCategories = new Map(state.categories.map(category => [category.name.toLowerCase(), category]));
      const categoriesToAdd = [];
      const imported = [];
      let duplicates = 0;
      rows.slice(1).forEach((row, line) => {
        const get = name => row[index(name)]?.trim() || "";
        const date = get("date");
        const type = get("type").toLowerCase();
        const categoryName = get("category");
        const rawAmount = Number(get("amount").replace(/[₹,\s]/g, ""));
        const amount = parseAmount(String(rawAmount));
        const recurring = get("recurring").toLowerCase() === "true";
        const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00`) : null;
        if (!parsedDate || toDateKey(parsedDate) !== date || !["income", "expense"].includes(type) || !categoryName || amount === null || (date > todayKey && !recurring)) {
          throw new Error(`Row ${line + 2} needs a valid date, type, category, and positive amount.`);
        }
        const key = categoryName.toLowerCase();
        let category = knownCategories.get(key);
        if (category && category.type !== type) {
          throw new Error(`Row ${line + 2} uses "${categoryName}" as both income and expense. Use a matching category.`);
        }
        if (!category) {
          category = { id: makeId(), name: categoryName, type, archived: false };
          knownCategories.set(key, category);
          categoriesToAdd.push(category);
        }
        const candidateId = get("id");
        const transaction = { id: candidateId && !state.transactions.some(item => item.id === candidateId) ? candidateId : makeId(), date, type, category: category.name, amount, note: get("note"), recurring, frequency: get("frequency") || "" };
        const signature = transactionSignature(transaction);
        if (signatureSet.has(signature)) duplicates += 1;
        else {
          signatureSet.add(signature);
          imported.push(transaction);
        }
      });
      state.categories.push(...categoriesToAdd);
      categoriesToAdd.filter(category => category.type === "expense").forEach(category => {
        if (!Object.hasOwn(state.budgets, category.name)) state.budgets[category.name] = 1000000;
      });
      state.transactions.push(...imported);
      saveState();
      renderAll();
      showToast(`Imported ${imported.length} transaction${imported.length === 1 ? "" : "s"}${duplicates ? ` · skipped ${duplicates} duplicate${duplicates === 1 ? "" : "s"}` : ""}.`);
    } catch (error) {
      console.error("PocketLedger could not import the selected CSV.", error);
      showToast(error instanceof Error ? error.message : "The CSV could not be imported.", true);
    }
  }

  function transactionSignature(transaction) {
    return [transaction.date, transaction.type, transaction.category.toLowerCase(), transaction.amount, (transaction.note || "").trim().toLowerCase()].join("|");
  }

  function addCategory(event) {
    event.preventDefault();
    const input = $("#new-category-name");
    const name = input.value.trim();
    const type = $("#new-category-type").value;
    if (!name) return;
    if (state.categories.some(category => category.name.toLowerCase() === name.toLowerCase())) {
      showToast("That category already exists.", true);
      input.focus();
      return;
    }
    state.categories.push({ id: makeId(), name, type, archived: false });
    if (type === "expense" && !state.budgets[name]) state.budgets[name] = 1000000;
    saveState();
    event.target.reset();
    renderAll();
    showToast(`${name} category added.`);
  }

  function renameCategory(id) {
    const category = state.categories.find(item => item.id === id);
    if (!category) return;
    const name = window.prompt("Rename category", category.name)?.trim();
    if (!name || name === category.name) return;
    if (state.categories.some(item => item.name.toLowerCase() === name.toLowerCase())) {
      showToast("That category already exists.", true);
      return;
    }
    const oldName = category.name;
    category.name = name;
    state.transactions.forEach(item => { if (item.category === oldName) item.category = name; });
    if (Object.hasOwn(state.budgets, oldName)) {
      state.budgets[name] = state.budgets[oldName];
      delete state.budgets[oldName];
    }
    saveState();
    renderAll();
    showToast("Category renamed.");
  }

  function archiveCategory(id) {
    const category = state.categories.find(item => item.id === id);
    if (!category) return;
    category.archived = !category.archived;
    saveState();
    renderAll();
    showToast(`${category.name} ${category.archived ? "archived" : "restored"}.`);
  }

  function editBudget(name) {
    const current = state.budgets[name] || 0;
    const entered = window.prompt(`Monthly budget for ${name} (in ₹)`, String(current / 100));
    if (entered === null) return;
    const amount = parseAmount(entered);
    if (amount === null) {
      showToast("Enter a budget greater than ₹0 and no more than ₹9,99,99,999.", true);
      return;
    }
    state.budgets[name] = amount;
    saveState();
    renderAll();
    showToast(`${name} budget updated.`);
  }

  function addBudget() {
    const options = state.categories.filter(item => item.type === "expense" && !item.archived && !Object.hasOwn(state.budgets, item.name));
    if (!options.length) {
      showToast("Every active expense category already has a budget.", true);
      return;
    }
    const category = window.prompt(`Choose a category: ${options.map(item => item.name).join(", ")}`, options[0].name);
    if (category === null) return;
    const selected = options.find(item => item.name.toLowerCase() === category.trim().toLowerCase());
    if (!selected) {
      showToast("Enter one of the active expense category names.", true);
      return;
    }
    const enteredAmount = window.prompt(`Monthly budget for ${selected.name} (in ₹)`, "10000");
    if (enteredAmount === null) return;
    const amount = parseAmount(enteredAmount);
    if (amount === null) {
      showToast("Enter a budget greater than ₹0 and no more than ₹9,99,99,999.", true);
      return;
    }
    state.budgets[selected.name] = amount;
    saveState();
    renderAll();
    showToast(`${selected.name} budget added.`);
  }

  function confirmReset() {
    if (!window.confirm("Reset this local PocketLedger demo? Your transactions, categories, and budgets will be replaced with fresh sample data.")) return;
    state = initialState();
    saveState();
    renderAll();
    showToast("Fresh sample data is ready.");
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function bindEvents() {
    $$("[data-navigation]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault();
      navigate(button.dataset.navigation);
    }));
    $$("[data-open-transaction]").forEach(button => button.addEventListener("click", () => openTransaction()));
    $$("#view-transactions, #view-dashboard, #view-budgets, #view-categories").forEach(view => view.addEventListener("click", event => {
      const edit = event.target.closest("[data-edit]");
      if (edit) openTransaction(state.transactions.find(item => item.id === edit.dataset.edit));
      const remove = event.target.closest("[data-delete]");
      if (remove) deleteTransaction(remove.dataset.delete);
      const budget = event.target.closest("[data-edit-budget]");
      if (budget) editBudget(budget.dataset.editBudget);
      const rename = event.target.closest("[data-rename-category]");
      if (rename) renameCategory(rename.dataset.renameCategory);
      const archive = event.target.closest("[data-archive-category]");
      if (archive) archiveCategory(archive.dataset.archiveCategory);
    }));
    $("#month-select").addEventListener("change", event => { selectedMonth = event.target.value; renderAll(); });
    $("#transaction-search").addEventListener("input", renderTransactions);
    $("#type-filter").addEventListener("change", renderTransactions);
    $("#category-filter").addEventListener("change", renderTransactions);
    $("#transaction-month-filter").addEventListener("change", renderTransactions);
    $$("[data-transaction-type]").forEach(button => button.addEventListener("click", () => setTransactionType(button.dataset.transactionType)));
    $("#transaction-form").addEventListener("submit", handleTransactionSubmit);
    $("#transaction-recurring").addEventListener("change", event => { $("#recurring-frequency").hidden = !event.target.checked; });
    $("#close-transaction-dialog").addEventListener("click", () => $("#transaction-dialog").close());
    $("#cancel-transaction").addEventListener("click", () => $("#transaction-dialog").close());
    $("#transaction-dialog").addEventListener("click", event => {
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close();
    });
    $("#import-csv").addEventListener("click", () => $("#csv-file").click());
    $("#csv-file").addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (file) void importCsv(file);
      event.target.value = "";
    });
    $("#export-csv").addEventListener("click", exportCsv);
    $("#add-category-form").addEventListener("submit", addCategory);
    $("#add-budget").addEventListener("click", addBudget);
    $("#reset-data").addEventListener("click", confirmReset);
    document.addEventListener("keydown", event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        navigate("transactions");
        $("#transaction-search").focus();
      }
      if (event.key === "Escape" && $("#transaction-dialog").open) $("#transaction-dialog").close();
    });
  }

  function init() {
    monthSelectOptions();
    bindEvents();
    renderAll();
    if (!localStorage.getItem(STORAGE_KEY)) saveState();
  }

  init();
})();
