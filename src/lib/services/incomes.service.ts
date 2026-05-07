import { getCurrentUserId } from "@/lib/auth/session";
import { mockIncomes } from "@/lib/mock-data";
import { mapIncomeRow } from "@/lib/services/moneycontrol-mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MC_TABLES } from "@/lib/supabase/tables";
import type { CategoryBreakdown, Income } from "@/types/finance";
import { compareDateOnly } from "@/utils/date";

export interface IncomeFilters {
  status: "all" | "received" | "expected";
  term: string;
  startDate?: string;
  endDate?: string;
}

export async function listIncomes(): Promise<Income[]> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return mockIncomes;
  }

  const { data, error } = await supabase
    .from(MC_TABLES.incomes)
    .select("id, title, amount, source, received_at, expected_date, actual_received_at, status, notes")
    .eq("user_id", userId)
    .order("expected_date", { ascending: false });

  if (error) {
    return mockIncomes;
  }

  return data.map(mapIncomeRow);
}

export function parseIncomeFilters(searchParams?: {
  status?: string | string[];
  term?: string | string[];
  startDate?: string | string[];
  endDate?: string | string[];
}): IncomeFilters {
  const rawStatus = getFirstParam(searchParams?.status);
  const rawTerm = getFirstParam(searchParams?.term);
  const rawStartDate = getFirstParam(searchParams?.startDate);
  const rawEndDate = getFirstParam(searchParams?.endDate);

  return normalizeIncomeFilters({
    status: isIncomeFilterStatus(rawStatus) ? rawStatus : "all",
    term: rawTerm?.trim() ?? "",
    startDate: isDateInput(rawStartDate) ? rawStartDate : undefined,
    endDate: isDateInput(rawEndDate) ? rawEndDate : undefined,
  });
}

export async function getIncomeData(
  inputFilters: IncomeFilters = { status: "all", term: "" },
) {
  const filters = normalizeIncomeFilters(inputFilters);
  const incomes = await listIncomes();
  const filteredIncomes = incomes.filter((income) => matchesIncomeFilters(income, filters));

  return {
    incomes: filteredIncomes,
    sourceBreakdown: buildIncomeSourceBreakdown(filteredIncomes),
    filters,
  };
}

export async function getIncomeById(id: string): Promise<Income | null> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return mockIncomes.find((income) => income.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from(MC_TABLES.incomes)
    .select("id, title, amount, source, received_at, expected_date, actual_received_at, status, notes")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapIncomeRow(data);
}

export function buildIncomeSourceBreakdown(incomes: Income[]): CategoryBreakdown[] {
  const totals = new Map<string, number>();
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

  incomes.forEach((income) => {
    totals.set(income.source, (totals.get(income.source) ?? 0) + income.amount);
  });

  const grandTotal = incomes.reduce((sum, income) => sum + income.amount, 0);

  if (!grandTotal) {
    return [];
  }

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, total], index) => ({
      category,
      total,
      percentage: Math.round((total / grandTotal) * 100),
      color: colors[index % colors.length],
    }));
}

function matchesIncomeFilters(income: Income, filters: IncomeFilters) {
  if (filters.status !== "all" && income.status !== filters.status) {
    return false;
  }

  if (filters.startDate && compareDateOnly(income.date, filters.startDate) < 0) {
    return false;
  }

  if (filters.endDate && compareDateOnly(income.date, filters.endDate) > 0) {
    return false;
  }

  if (!filters.term) {
    return true;
  }

  const haystack = [income.title, income.source, income.notes]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("pt-BR");

  return haystack.includes(filters.term.toLocaleLowerCase("pt-BR"));
}

function normalizeIncomeFilters(filters: IncomeFilters): IncomeFilters {
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

function isIncomeFilterStatus(value: string | undefined): value is IncomeFilters["status"] {
  return value === "all" || value === "received" || value === "expected";
}

function isDateInput(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}
