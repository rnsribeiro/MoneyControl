import type { Expense, Goal, Income, Investment } from "@/types/finance";
import { compareDateOnly, getLocalDateInputValue } from "@/utils/date";

export function mapExpenseRow(row: {
  id: string;
  title: string;
  amount: number | string;
  paid_amount?: number | string | null;
  category_name: string;
  expense_date: string;
  due_date?: string;
  paid_at?: string | null;
  payment_method: string;
  status: "paid" | "pending" | "partial";
  notes?: string | null;
}): Expense {
  const dueDate = row.due_date ?? undefined;
  const amount = Number(row.amount);
  const paidAmount = clampCurrency(Number(row.paid_amount ?? 0), amount);
  const remainingAmount = clampCurrency(amount - paidAmount);
  const progressPercentage = amount ? Math.min(100, Math.round((paidAmount / amount) * 100)) : 0;
  const baseStatus =
    paidAmount >= amount ? "paid" : paidAmount > 0 ? "partial" : row.status;
  const isOverdue =
    dueDate
      ? remainingAmount > 0 && compareDateOnly(dueDate, getLocalDateInputValue()) < 0
      : false;

  return {
    id: row.id,
    title: row.title,
    amount,
    paidAmount,
    remainingAmount,
    progressPercentage,
    category: row.category_name,
    date: row.expense_date,
    dueDate: dueDate,
    paidAt: row.paid_at ?? undefined,
    paymentMethod: row.payment_method,
    status: isOverdue ? "overdue" : baseStatus,
    notes: row.notes ?? undefined,
  };
}

export function mapIncomeRow(row: {
  id: string;
  title: string;
  amount: number | string;
  source: string;
  received_at: string;
  expected_date?: string;
  actual_received_at?: string | null;
  status?: "received" | "expected";
  notes?: string | null;
}): Income {
  const expectedDate = row.expected_date ?? row.received_at;
  const status = row.status ?? "received";

  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    source: row.source,
    date: status === "received" ? row.actual_received_at ?? row.received_at : expectedDate,
    expectedDate,
    receivedAt: row.actual_received_at ?? undefined,
    status,
    notes: row.notes ?? undefined,
  };
}

export function mapInvestmentRow(row: {
  id: string;
  name: string;
  type: string;
  amount: number | string;
  investment_date: string;
  broker: string;
  goal: string;
  notes?: string | null;
}): Investment {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    amount: Number(row.amount),
    date: row.investment_date,
    broker: row.broker,
    goal: row.goal,
    notes: row.notes ?? undefined,
  };
}

export function mapGoalRow(row: {
  id: string;
  title: string;
  target_amount: number | string;
  current_amount?: number | string | null;
  target_date?: string | null;
  notes?: string | null;
}): Goal {
  const targetAmount = Number(row.target_amount);
  const currentAmount = clampCurrency(Number(row.current_amount ?? 0));
  const remainingAmount = clampCurrency(Math.max(targetAmount - currentAmount, 0));
  const progressPercentage = targetAmount
    ? Math.min(100, Math.round((currentAmount / targetAmount) * 100))
    : 0;

  return {
    id: row.id,
    title: row.title,
    targetAmount,
    currentAmount,
    remainingAmount,
    progressPercentage,
    targetDate: row.target_date ?? undefined,
    notes: row.notes ?? undefined,
    isCompleted: currentAmount >= targetAmount,
  };
}

function clampCurrency(value: number, ceiling?: number) {
  const normalized = Number.isFinite(value) ? Math.max(0, value) : 0;

  if (typeof ceiling === "number") {
    return Math.min(normalized, ceiling);
  }

  return normalized;
}
