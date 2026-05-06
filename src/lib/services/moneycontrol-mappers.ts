import type { Expense, Income, Investment } from "@/types/finance";

export function mapExpenseRow(row: {
  id: string;
  title: string;
  amount: number | string;
  category_name: string;
  expense_date: string;
  due_date?: string;
  paid_at?: string | null;
  payment_method: string;
  status: "paid" | "pending";
  notes?: string | null;
}): Expense {
  const dueDate = row.due_date ?? row.expense_date;
  const isOverdue =
    row.status !== "paid" &&
    new Date(dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    category: row.category_name,
    date: dueDate,
    dueDate,
    paidAt: row.paid_at ?? undefined,
    paymentMethod: row.payment_method,
    status: isOverdue ? "overdue" : row.status,
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
