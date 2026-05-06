import { getCurrentUserId } from "@/lib/auth/session";
import { mockExpenses } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MC_TABLES } from "@/lib/supabase/tables";
import { mapExpenseRow } from "@/lib/services/moneycontrol-mappers";
import type { Expense } from "@/types/finance";

export async function listExpenses(): Promise<Expense[]> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return mockExpenses;
  }

  const { data, error } = await supabase
    .from(MC_TABLES.expenses)
    .select("id, title, amount, category_name, expense_date, due_date, paid_at, payment_method, status, notes")
    .eq("user_id", userId)
    .order("due_date", { ascending: false });

  if (error) {
    return mockExpenses;
  }

  return data.map(mapExpenseRow);
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return mockExpenses.find((expense) => expense.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from(MC_TABLES.expenses)
    .select("id, title, amount, category_name, expense_date, due_date, paid_at, payment_method, status, notes")
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
      const dueDate = new Date(expense.dueDate);
      const paidDate = expense.paidAt ? new Date(expense.paidAt) : null;

      if (
        expense.status === "paid" &&
        paidDate &&
        paidDate.getMonth() === currentMonth &&
        paidDate.getFullYear() === currentYear
      ) {
        acc.paidThisMonth += expense.amount;
      }

      if (
        expense.status !== "paid" &&
        dueDate.getMonth() === currentMonth &&
        dueDate.getFullYear() === currentYear
      ) {
        acc.pendingThisMonth += expense.amount;
      }

      if (expense.status === "overdue") {
        acc.overdueCount += 1;
      }

      if (expense.status === "paid" && paidDate && paidDate.getFullYear() === currentYear) {
        acc.paidThisYear += expense.amount;
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
