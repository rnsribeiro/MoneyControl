import { getCurrentUserId } from "@/lib/auth/session";
import {
  mockExpenses,
  mockIncomes,
  mockInvestments,
  monthlyOverview,
} from "@/lib/mock-data";
import {
  mapExpenseRow,
  mapIncomeRow,
  mapInvestmentRow,
} from "@/lib/services/moneycontrol-mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MC_TABLES } from "@/lib/supabase/tables";
import type {
  CategoryBreakdown,
  DashboardSummary,
  Expense,
  Income,
  Investment,
  MonthlyOverviewPoint,
  RecentActivity,
} from "@/types/finance";
import {
  compareDateOnly,
  formatMonthKey,
  formatMonthKeyLong,
  getCurrentMonthKey,
  getMonthKey,
  getRecentMonthKeys,
} from "@/utils/date";

export type DashboardFilterMode =
  | "all"
  | "current-year"
  | "current-month"
  | "specific-month";

export interface DashboardFilter {
  mode: DashboardFilterMode;
  month?: string;
}

export interface DashboardMonthOption {
  value: string;
  label: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  expenseCategories: CategoryBreakdown[];
  incomeSources: CategoryBreakdown[];
  overview: MonthlyOverviewPoint[];
  activities: RecentActivity[];
  monthOptions: DashboardMonthOption[];
  filter: DashboardFilter;
}

export function parseDashboardFilter(searchParams?: {
  filter?: string | string[];
  month?: string | string[];
}): DashboardFilter {
  const rawFilter = Array.isArray(searchParams?.filter)
    ? searchParams?.filter[0]
    : searchParams?.filter;
  const rawMonth = Array.isArray(searchParams?.month)
    ? searchParams?.month[0]
    : searchParams?.month;

  const mode = isDashboardFilterMode(rawFilter) ? rawFilter : "all";
  const month = isMonthKey(rawMonth) ? rawMonth : undefined;

  if (mode !== "specific-month") {
    return { mode };
  }

  return {
    mode,
    month: month ?? getCurrentMonthKey(),
  };
}

export async function getDashboardData(
  inputFilter: DashboardFilter = { mode: "all" },
): Promise<DashboardData> {
  const snapshot = await getFinanceSnapshot();
  const filter = normalizeFilter(inputFilter);
  const filteredSnapshot = filterFinanceSnapshot(snapshot, filter);

  return {
    summary: buildSummary(
      filteredSnapshot.expenses,
      filteredSnapshot.incomes,
      filteredSnapshot.investments,
    ),
    expenseCategories: buildCategoryBreakdown(
      filteredSnapshot.expenses,
      (expense) => expense.category,
    ),
    incomeSources: buildCategoryBreakdown(
      filteredSnapshot.incomes,
      (income) => income.source,
    ),
    overview: buildMonthlyOverview(snapshot, filter),
    activities: buildRecentActivities(filteredSnapshot),
    monthOptions: buildMonthOptions(snapshot),
    filter,
  };
}

export async function getDashboardSummary(
  filter: DashboardFilter = { mode: "all" },
): Promise<DashboardSummary> {
  return (await getDashboardData(filter)).summary;
}

export async function getExpensesByCategory(
  filter: DashboardFilter = { mode: "all" },
): Promise<CategoryBreakdown[]> {
  return (await getDashboardData(filter)).expenseCategories;
}

export async function getIncomeBySource(
  filter: DashboardFilter = { mode: "all" },
): Promise<CategoryBreakdown[]> {
  return (await getDashboardData(filter)).incomeSources;
}

export async function getMonthlyOverview(
  filter: DashboardFilter = { mode: "all" },
): Promise<MonthlyOverviewPoint[]> {
  return (await getDashboardData(filter)).overview;
}

export async function getRecentActivities(
  filter: DashboardFilter = { mode: "all" },
): Promise<RecentActivity[]> {
  return (await getDashboardData(filter)).activities;
}

function normalizeFilter(filter: DashboardFilter): DashboardFilter {
  if (filter.mode !== "specific-month") {
    return { mode: filter.mode };
  }

  return {
    mode: "specific-month",
    month: isMonthKey(filter.month) ? filter.month : getCurrentMonthKey(),
  };
}

function isDashboardFilterMode(value: string | undefined): value is DashboardFilterMode {
  return (
    value === "all" ||
    value === "current-year" ||
    value === "current-month" ||
    value === "specific-month"
  );
}

function isMonthKey(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}$/.test(value));
}

function buildSummary(
  expenses: Expense[],
  incomes: Income[],
  investments: Investment[],
): DashboardSummary {
  const receivedIncome = incomes
    .filter((item) => item.status === "received")
    .reduce((sum, item) => sum + item.amount, 0);
  const expectedIncome = incomes
    .filter((item) => item.status === "expected")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = receivedIncome + expectedIncome;
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const paidExpenses = expenses
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingExpenses = expenses
    .filter((item) => item.status !== "paid")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpenses - totalInvested;
  const cashOnHand = receivedIncome - paidExpenses - totalInvested;
  const savingsRate = receivedIncome ? Math.round((totalInvested / receivedIncome) * 100) : 0;

  return {
    totalIncome,
    receivedIncome,
    expectedIncome,
    totalExpenses,
    paidExpenses,
    pendingExpenses,
    totalInvested,
    balance,
    cashOnHand,
    savingsRate,
  };
}

function buildCategoryBreakdown<T extends Expense | Income>(
  items: T[],
  getLabel: (item: T) => string,
): CategoryBreakdown[] {
  const totals = new Map<string, number>();

  items.forEach((item) => {
    const label = getLabel(item);
    totals.set(label, (totals.get(label) ?? 0) + item.amount);
  });

  const grandTotal = items.reduce((sum, item) => sum + item.amount, 0);

  if (!grandTotal) {
    return [];
  }

  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "#0ea5a4",
    "#16a34a",
    "#f97316",
  ];

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, total], index) => ({
      category,
      total,
      percentage: Math.round((total / grandTotal) * 100),
      color: colors[index % colors.length],
    }));
}

function buildMonthlyOverview(
  snapshot: { expenses: Expense[]; incomes: Income[]; investments: Investment[] },
  filter: DashboardFilter,
): MonthlyOverviewPoint[] {
  const monthKeys = buildOverviewMonthKeys(snapshot, filter);
  const monthMap = new Map(
    monthKeys.map((monthKey) => [
      monthKey,
      {
        month: formatMonthKey(monthKey),
        income: 0,
        expense: 0,
        investment: 0,
      },
    ]),
  );

  snapshot.incomes.forEach((income) => {
    const monthKey = getMonthKey(income.date);
    const month = monthMap.get(monthKey);
    if (month) {
      month.income += income.amount;
    }
  });

  snapshot.expenses.forEach((expense) => {
    const monthKey = getMonthKey(expense.date);
    const month = monthMap.get(monthKey);
    if (month) {
      month.expense += expense.amount;
    }
  });

  snapshot.investments.forEach((investment) => {
    const monthKey = getMonthKey(investment.date);
    const month = monthMap.get(monthKey);
    if (month) {
      month.investment += investment.amount;
    }
  });

  const overview = Array.from(monthMap.values());
  const hasAnyRealData = overview.some(
    (item) => item.income > 0 || item.expense > 0 || item.investment > 0,
  );

  if (filter.mode === "all" && !hasAnyRealData) {
    return monthlyOverview;
  }

  return overview;
}

function buildOverviewMonthKeys(
  snapshot: { expenses: Expense[]; incomes: Income[]; investments: Investment[] },
  filter: DashboardFilter,
) {
  const currentMonthKey = getCurrentMonthKey();
  const currentYear = Number(currentMonthKey.slice(0, 4));

  if (filter.mode === "current-month") {
    return [currentMonthKey];
  }

  if (filter.mode === "specific-month") {
    return [filter.month ?? currentMonthKey];
  }

  if (filter.mode === "current-year") {
    return Array.from({ length: 12 }, (_, index) => {
      const month = String(index + 1).padStart(2, "0");
      return `${currentYear}-${month}`;
    });
  }

  const uniqueMonthKeys = getSnapshotMonthKeys(snapshot);

  return uniqueMonthKeys.length ? uniqueMonthKeys.slice(-6) : getRecentMonthKeys(6);
}

function buildRecentActivities(snapshot: {
  expenses: Expense[];
  incomes: Income[];
  investments: Investment[];
}): RecentActivity[] {
  return [
    ...snapshot.incomes.map((income) => ({
      id: income.id,
      title: income.title,
      amount: income.amount,
      date: income.date,
      category: income.source,
      type: "income" as const,
      status: income.status === "received" ? "recebido" : "a receber",
    })),
    ...snapshot.expenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      type: "expense" as const,
      status: expense.status,
    })),
    ...snapshot.investments.map((investment) => ({
      id: investment.id,
      title: investment.name,
      amount: investment.amount,
      date: investment.date,
      category: investment.type,
      type: "investment" as const,
      status: "investido",
    })),
  ]
    .sort((a, b) => compareDateOnly(b.date, a.date))
    .slice(0, 6);
}

function buildMonthOptions(snapshot: {
  expenses: Expense[];
  incomes: Income[];
  investments: Investment[];
}): DashboardMonthOption[] {
  const uniqueMonthKeys = getSnapshotMonthKeys(snapshot).reverse();
  const monthKeys = uniqueMonthKeys.length ? uniqueMonthKeys : [getCurrentMonthKey()];

  return monthKeys.map((monthKey) => ({
    value: monthKey,
    label: formatMonthKeyLong(monthKey),
  }));
}

function getSnapshotMonthKeys(snapshot: {
  expenses: Expense[];
  incomes: Income[];
  investments: Investment[];
}) {
  return Array.from(
    new Set([
      ...snapshot.expenses.map((expense) => getMonthKey(expense.date)),
      ...snapshot.incomes.map((income) => getMonthKey(income.date)),
      ...snapshot.investments.map((investment) => getMonthKey(investment.date)),
    ]),
  ).sort();
}

function filterFinanceSnapshot(
  snapshot: { expenses: Expense[]; incomes: Income[]; investments: Investment[] },
  filter: DashboardFilter,
) {
  return {
    expenses: snapshot.expenses.filter((expense) => matchesFilter(expense.date, filter)),
    incomes: snapshot.incomes.filter((income) => matchesFilter(income.date, filter)),
    investments: snapshot.investments.filter((investment) =>
      matchesFilter(investment.date, filter),
    ),
  };
}

function matchesFilter(date: string, filter: DashboardFilter) {
  if (filter.mode === "all") {
    return true;
  }

  const monthKey = getMonthKey(date);
  const year = monthKey.slice(0, 4);
  const currentMonthKey = getCurrentMonthKey();
  const currentYear = currentMonthKey.slice(0, 4);

  if (filter.mode === "current-month") {
    return monthKey === currentMonthKey;
  }

  if (filter.mode === "current-year") {
    return year === currentYear;
  }

  return monthKey === filter.month;
}

async function getFinanceSnapshot(): Promise<{
  expenses: Expense[];
  incomes: Income[];
  investments: Investment[];
}> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return {
      expenses: mockExpenses,
      incomes: mockIncomes,
      investments: mockInvestments,
    };
  }

  const [expensesResult, incomesResult, investmentsResult] = await Promise.all([
    supabase
      .from(MC_TABLES.expenses)
      .select(
        "id, title, amount, category_name, expense_date, due_date, paid_at, payment_method, status, notes",
      )
      .eq("user_id", userId),
    supabase
      .from(MC_TABLES.incomes)
      .select(
        "id, title, amount, source, received_at, expected_date, actual_received_at, status, notes",
      )
      .eq("user_id", userId),
    supabase
      .from(MC_TABLES.investments)
      .select("id, name, type, amount, investment_date, broker, goal, notes")
      .eq("user_id", userId),
  ]);

  if (expensesResult.error || incomesResult.error || investmentsResult.error) {
    return {
      expenses: mockExpenses,
      incomes: mockIncomes,
      investments: mockInvestments,
    };
  }

  return {
    expenses: expensesResult.data.map(mapExpenseRow),
    incomes: incomesResult.data.map(mapIncomeRow),
    investments: investmentsResult.data.map(mapInvestmentRow),
  };
}
