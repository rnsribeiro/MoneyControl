export type TransactionType = "expense" | "income" | "investment";
export type HistoryFilterType = "all" | TransactionType;
export type ExpenseStatus = "paid" | "pending" | "partial" | "overdue";
export type IncomeStatus = "received" | "expected";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  category: string;
  date: string;
  dueDate?: string;
  paidAt?: string;
  paymentMethod: string;
  status: ExpenseStatus;
  notes?: string;
}

export interface Income {
  id: string;
  title: string;
  amount: number;
  source: string;
  date: string;
  expectedDate: string;
  receivedAt?: string;
  status: IncomeStatus;
  notes?: string;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  date: string;
  broker: string;
  goal: string;
  notes?: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  targetDate?: string;
  notes?: string;
  isCompleted: boolean;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  color: string;
}

export interface MonthlyOverviewPoint {
  month: string;
  income: number;
  expense: number;
  investment: number;
}

export interface DashboardSummary {
  totalIncome: number;
  receivedIncome: number;
  expectedIncome: number;
  totalExpenses: number;
  paidExpenses: number;
  pendingExpenses: number;
  totalInvested: number;
  goalReserved: number;
  balance: number;
  cashOnHand: number;
  savingsRate: number;
}

export interface RecentActivity {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  type: TransactionType;
  status: string;
}

export interface HistoryEntry {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  type: TransactionType;
  status: string;
  notes?: string;
  secondaryLabel?: string;
}
