import { getCurrentUserId } from "@/lib/auth/session";
import { mockGoals } from "@/lib/mock-data";
import { mapGoalRow } from "@/lib/services/moneycontrol-mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MC_TABLES } from "@/lib/supabase/tables";
import type { Goal } from "@/types/finance";

export interface GoalOverview {
  totalReserved: number;
  totalTarget: number;
  completedCount: number;
  activeCount: number;
}

export async function listGoals(): Promise<Goal[]> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return mockGoals;
  }

  const { data, error } = await supabase
    .from(MC_TABLES.goals)
    .select("id, title, target_amount, current_amount, target_date, notes")
    .eq("user_id", userId)
    .order("target_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    return mockGoals;
  }

  return data.map(mapGoalRow);
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return mockGoals.find((goal) => goal.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from(MC_TABLES.goals)
    .select("id, title, target_amount, current_amount, target_date, notes")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapGoalRow(data);
}

export function getGoalOverview(goals: Goal[]): GoalOverview {
  return goals.reduce<GoalOverview>(
    (acc, goal) => {
      acc.totalReserved += goal.currentAmount;
      acc.totalTarget += goal.targetAmount;
      if (goal.isCompleted) {
        acc.completedCount += 1;
      } else {
        acc.activeCount += 1;
      }
      return acc;
    },
    {
      totalReserved: 0,
      totalTarget: 0,
      completedCount: 0,
      activeCount: 0,
    },
  );
}
