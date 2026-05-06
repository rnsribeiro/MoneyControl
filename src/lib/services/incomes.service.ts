import { getCurrentUserId } from "@/lib/auth/session";
import { mockIncomes } from "@/lib/mock-data";
import { mapIncomeRow } from "@/lib/services/moneycontrol-mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MC_TABLES } from "@/lib/supabase/tables";
import type { Income } from "@/types/finance";

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
