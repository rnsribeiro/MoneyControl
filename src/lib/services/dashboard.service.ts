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
  RecentActivity,
} from "@/types/finance";
import { formatMonthKey, getMonthKey, getRecentMonthKeys } from "@/utils/date";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { expenses, incomes, investments } = await getFinanceSnapshot();
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

export async function getExpensesByCategory(): Promise<CategoryBreakdown[]> {
  const { expenses } = await getFinanceSnapshot();
  const totals = new Map<string, number>();

  expenses.forEach((expense) => {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  });

  const grandTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  if (!grandTotal) {
    return [];
  }
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  return Array.from(totals.entries()).map(([category, total], index) => ({
    category,
    total,
    percentage: Math.round((total / grandTotal) * 100),
    color: colors[index % colors.length],
  }));
}

export async function getMonthlyOverview() {
  const { expenses, incomes, investments } = await getFinanceSnapshot();
  const monthKeys = getRecentMonthKeys(6);
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

  incomes.forEach((income) => {
    const monthKey = getMonthKey(income.expectedDate);
    const month = monthMap.get(monthKey);
    if (month) {
      month.income += income.amount;
    }
  });

  expenses.forEach((expense) => {
    const monthKey = getMonthKey(expense.date);
    const month = monthMap.get(monthKey);
    if (month) {
      month.expense += expense.amount;
    }
  });

  investments.forEach((investment) => {
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

  return hasAnyRealData ? overview : monthlyOverview;
}

export async function getRecentActivities(): Promise<RecentActivity[]> {
  const { expenses, incomes, investments } = await getFinanceSnapshot();

  return [
    ...incomes.map((income) => ({
      id: income.id,
      title: income.title,
      amount: income.amount,
      date: income.status === "received" ? income.receivedAt ?? income.date : income.expectedDate,
      category: income.source,
      type: "income" as const,
      status: income.status === "received" ? "recebido" : "a receber",
    })),
    ...expenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      type: "expense" as const,
      status: expense.status,
    })),
    ...investments.map((investment) => ({
      id: investment.id,
      title: investment.name,
      amount: investment.amount,
      date: investment.date,
      category: investment.type,
      type: "investment" as const,
      status: "investido",
    })),
  ]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 6);
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
      .select("id, title, amount, category_name, expense_date, due_date, paid_at, payment_method, status, notes")
      .eq("user_id", userId),
    supabase
      .from(MC_TABLES.incomes)
      .select("id, title, amount, source, received_at, expected_date, actual_received_at, status, notes")
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
