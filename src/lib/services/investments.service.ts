import { getCurrentUserId } from "@/lib/auth/session";
import { mockInvestments } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapInvestmentRow } from "@/lib/services/moneycontrol-mappers";
import { MC_TABLES } from "@/lib/supabase/tables";
import type { Investment } from "@/types/finance";

export async function listInvestments(): Promise<Investment[]> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return mockInvestments;
  }

  const { data, error } = await supabase
    .from(MC_TABLES.investments)
    .select("id, name, type, amount, investment_date, broker, goal, notes")
    .eq("user_id", userId)
    .order("investment_date", { ascending: false });

  if (error) {
    return mockInvestments;
  }

  return data.map(mapInvestmentRow);
}

export async function getInvestmentById(id: string): Promise<Investment | null> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return mockInvestments.find((investment) => investment.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from(MC_TABLES.investments)
    .select("id, name, type, amount, investment_date, broker, goal, notes")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapInvestmentRow(data);
}
