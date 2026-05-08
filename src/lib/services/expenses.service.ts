import { getCurrentUserId } from "@/lib/auth/session";
import { mockExpenses } from "@/lib/mock-data";
import { mapExpenseRow } from "@/lib/services/moneycontrol-mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MC_TABLES } from "@/lib/supabase/tables";
import type { Expense } from "@/types/finance";
import { compareDateOnly, parseDateOnly } from "@/utils/date";

export interface ExpenseFilters {
  status: "all" | "paid" | "pending" | "partial" | "overdue";
  term: string;
  startDate?: string;
  endDate?: string;
}

export async function listExpenses(): Promise<Expense[]> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return mockExpenses;
  }

  const { data, error } = await supabase
    .from(MC_TABLES.expenses)
    .select(
      "id, title, amount, paid_amount, category_name, expense_date, due_date, paid_at, payment_method, status, notes",
    )
    .eq("user_id", userId)
    .order("due_date", { ascending: false });

  if (error) {
    return mockExpenses;
  }

  return data.map(mapExpenseRow);
}

export function parseExpenseFilters(searchParams?: {
  status?: string | string[];
  term?: string | string[];
  startDate?: string | string[];
  endDate?: string | string[];
}): ExpenseFilters {
  const rawStatus = getFirstParam(searchParams?.status);
  const rawTerm = getFirstParam(searchParams?.term);
  const rawStartDate = getFirstParam(searchParams?.startDate);
  const rawEndDate = getFirstParam(searchParams?.endDate);

  return normalizeExpenseFilters({
    status: isExpenseFilterStatus(rawStatus) ? rawStatus : "all",
    term: rawTerm?.trim() ?? "",
    startDate: isDateInput(rawStartDate) ? rawStartDate : undefined,
    endDate: isDateInput(rawEndDate) ? rawEndDate : undefined,
  });
}

export async function getExpenseData(
  inputFilters: ExpenseFilters = { status: "all", term: "" },
) {
  const filters = normalizeExpenseFilters(inputFilters);
  const expenses = await listExpenses();
  const filteredExpenses = expenses.filter((expense) => matchesExpenseFilters(expense, filters));

  return {
    expenses: filteredExpenses,
    overview: getExpenseOverview(filteredExpenses),
    filters,
  };
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return mockExpenses.find((expense) => expense.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from(MC_TABLES.expenses)
    .select(
      "id, title, amount, paid_amount, category_name, expense_date, due_date, paid_at, payment_method, status, notes",
    )
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapExpenseRow(data);
}

export interface ExpenseOverview {
  paidThisMonth: number;
  pendingThisMonth: number;
  overdueCount: number;
  paidThisYear: number;
}

export function getExpenseOverview(expenses: Expense[]): ExpenseOverview {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return expenses.reduce<ExpenseOverview>(
    (acc, expense) => {
      const referenceDate = expense.dueDate ? parseDateOnly(expense.dueDate) : null;
      const paidDate = expense.paidAt ? parseDateOnly(expense.paidAt) : null;

      if (
        expense.paidAmount > 0 &&
        paidDate &&
        paidDate.getMonth() === currentMonth &&
        paidDate.getFullYear() === currentYear
      ) {
        acc.paidThisMonth += expense.paidAmount;
      }

      if (
        expense.remainingAmount > 0 &&
        referenceDate &&
        referenceDate.getMonth() === currentMonth &&
        referenceDate.getFullYear() === currentYear
      ) {
        acc.pendingThisMonth += expense.remainingAmount;
      }

      if (expense.status === "overdue") {
        acc.overdueCount += 1;
      }

      if (expense.paidAmount > 0 && paidDate && paidDate.getFullYear() === currentYear) {
        acc.paidThisYear += expense.paidAmount;
      }

      return acc;
    },
    {
      paidThisMonth: 0,
      pendingThisMonth: 0,
      overdueCount: 0,
      paidThisYear: 0,
    },
  );
}

export async function hasExpenseTableConnection(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase
    .from(MC_TABLES.expenses)
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  return !error;
}

function matchesExpenseFilters(expense: Expense, filters: ExpenseFilters) {
  if (filters.status !== "all" && expense.status !== filters.status) {
    return false;
  }

  const referenceDate = expense.dueDate ?? expense.date;

  if (filters.startDate && compareDateOnly(referenceDate, filters.startDate) < 0) {
    return false;
  }

  if (filters.endDate && compareDateOnly(referenceDate, filters.endDate) > 0) {
    return false;
  }

  if (!filters.term) {
    return true;
  }

  const haystack = [
    expense.title,
    expense.category,
    expense.paymentMethod,
    expense.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("pt-BR");

  return haystack.includes(filters.term.toLocaleLowerCase("pt-BR"));
}

function normalizeExpenseFilters(filters: ExpenseFilters): ExpenseFilters {
  const startDate = isDateInput(filters.startDate) ? filters.startDate : undefined;
  const endDate = isDateInput(filters.endDate) ? filters.endDate : undefined;

  if (startDate && endDate && compareDateOnly(startDate, endDate) > 0) {
    return {
      ...filters,
      startDate: endDate,
      endDate: startDate,
    };
  }

  return {
    status: filters.status,
    term: filters.term.trim(),
    startDate,
    endDate,
  };
}

function getFirstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function isExpenseFilterStatus(value: string | undefined): value is ExpenseFilters["status"] {
  return (
    value === "all" ||
    value === "paid" ||
    value === "pending" ||
    value === "partial" ||
    value === "overdue"
  );
}

function isDateInput(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}
