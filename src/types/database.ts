export interface MoneyControlExpenseInsert {
  user_id: string;
  title: string;
  amount: number;
  paid_amount: number;
  category_name: string;
  payment_method: string;
  status: "paid" | "pending" | "partial";
  expense_date: string;
  due_date: string;
  paid_at?: string;
  notes?: string;
}

export interface MoneyControlIncomeInsert {
  user_id: string;
  title: string;
  amount: number;
  source: string;
  received_at: string;
  expected_date: string;
  actual_received_at?: string;
  status: "received" | "expected";
  notes?: string;
}

export interface MoneyControlInvestmentInsert {
  user_id: string;
  name: string;
  type: string;
  amount: number;
  broker: string;
  goal: string;
  investment_date: string;
  notes?: string;
}

export interface MoneyControlGoalInsert {
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  notes?: string;
}
