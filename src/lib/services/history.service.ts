import { listExpenses } from "@/lib/services/expenses.service";
import { listIncomes } from "@/lib/services/incomes.service";
import { listInvestments } from "@/lib/services/investments.service";
import type { HistoryEntry, HistoryFilterType } from "@/types/finance";
import { compareDateOnly } from "@/utils/date";

export interface HistoryFilters {
  type: HistoryFilterType;
  term: string;
  startDate?: string;
  endDate?: string;
}

export interface HistorySummary {
  totalEntries: number;
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
}

export interface HistoryData {
  entries: HistoryEntry[];
  summary: HistorySummary;
  filters: HistoryFilters;
}

export function parseHistoryFilters(searchParams?: {
  type?: string | string[];
  term?: string | string[];
  startDate?: string | string[];
  endDate?: string | string[];
}): HistoryFilters {
  const rawType = getFirstParam(searchParams?.type);
  const rawTerm = getFirstParam(searchParams?.term);
  const rawStartDate = getFirstParam(searchParams?.startDate);
  const rawEndDate = getFirstParam(searchParams?.endDate);

  return normalizeHistoryFilters({
    type: isHistoryFilterType(rawType) ? rawType : "all",
    term: rawTerm?.trim() ?? "",
    startDate: isDateInput(rawStartDate) ? rawStartDate : undefined,
    endDate: isDateInput(rawEndDate) ? rawEndDate : undefined,
  });
}

export async function getHistoryData(
  inputFilters: HistoryFilters = { type: "all", term: "" },
): Promise<HistoryData> {
  const filters = normalizeHistoryFilters(inputFilters);
  const entries = await listHistoryEntries();
  const filteredEntries = entries.filter((entry) => matchesHistoryFilters(entry, filters));

  return {
    entries: filteredEntries,
    summary: buildHistorySummary(filteredEntries),
    filters,
  };
}

export async function listHistoryEntries(): Promise<HistoryEntry[]> {
  const [expenses, incomes, investments] = await Promise.all([
    listExpenses(),
    listIncomes(),
    listInvestments(),
  ]);

  return [
    ...incomes.map<HistoryEntry>((income) => ({
      id: income.id,
      title: income.title,
      amount: income.amount,
      date: income.date,
      category: income.source,
      type: "income",
      status: income.status === "received" ? "Recebido" : "A receber",
      notes: income.notes,
      secondaryLabel:
        income.status === "received"
          ? `Recebido em ${income.date}`
          : `Previsto para ${income.expectedDate}`,
    })),
    ...expenses.map<HistoryEntry>((expense) => ({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      type: "expense",
      status: getExpenseStatusLabel(expense.status),
      notes: expense.notes,
      secondaryLabel: `Pagamento por ${expense.paymentMethod}`,
    })),
    ...investments.map<HistoryEntry>((investment) => ({
      id: investment.id,
      title: investment.name,
      amount: investment.amount,
      date: investment.date,
      category: investment.type,
      type: "investment",
      status: "Investido",
      notes: investment.notes,
      secondaryLabel: `${investment.broker} • ${investment.goal}`,
    })),
  ].sort((a, b) => compareDateOnly(b.date, a.date));
}

function buildHistorySummary(entries: HistoryEntry[]): HistorySummary {
  return entries.reduce<HistorySummary>(
    (acc, entry) => {
      acc.totalEntries += 1;

      if (entry.type === "income") {
        acc.totalIncome += entry.amount;
      }

      if (entry.type === "expense") {
        acc.totalExpense += entry.amount;
      }

      if (entry.type === "investment") {
        acc.totalInvestment += entry.amount;
      }

      return acc;
    },
    {
      totalEntries: 0,
      totalIncome: 0,
      totalExpense: 0,
      totalInvestment: 0,
    },
  );
}

function matchesHistoryFilters(entry: HistoryEntry, filters: HistoryFilters) {
  if (filters.type !== "all" && entry.type !== filters.type) {
    return false;
  }

  if (filters.startDate && compareDateOnly(entry.date, filters.startDate) < 0) {
    return false;
  }

  if (filters.endDate && compareDateOnly(entry.date, filters.endDate) > 0) {
    return false;
  }

  if (!filters.term) {
    return true;
  }

  const haystack = [
    entry.title,
    entry.category,
    entry.status,
    entry.notes,
    entry.secondaryLabel,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("pt-BR");

  return haystack.includes(filters.term.toLocaleLowerCase("pt-BR"));
}

function normalizeHistoryFilters(filters: HistoryFilters): HistoryFilters {
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
    type: filters.type,
    term: filters.term.trim(),
    startDate,
    endDate,
  };
}

function getFirstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function isHistoryFilterType(value: string | undefined): value is HistoryFilterType {
  return value === "all" || value === "income" || value === "expense" || value === "investment";
}

function isDateInput(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function getExpenseStatusLabel(status: string) {
  if (status === "paid") {
    return "Pago";
  }

  if (status === "partial") {
    return "Parcial";
  }

  if (status === "overdue") {
    return "Vencida";
  }

  return "Pendente";
}
