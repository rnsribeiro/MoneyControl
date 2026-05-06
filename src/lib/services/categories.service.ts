import { getCurrentUserId } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MC_TABLES } from "@/lib/supabase/tables";

export interface CategoryOption {
  id?: string;
  value: string;
  label: string;
  kind: "expense" | "income" | "investment";
  color?: string;
}

export async function getCategoryById(id: string): Promise<CategoryOption | null> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return null;
  }

  const { data, error } = await supabase
    .from(MC_TABLES.categories)
    .select("id, name, slug, kind, color")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    value: data.slug,
    label: data.name,
    kind: data.kind,
    color: data.color ?? undefined,
  };
}

export async function listCategories(
  kind: CategoryOption["kind"],
): Promise<CategoryOption[]> {
  const supabase = await createSupabaseServerClient();
  const userId = await getCurrentUserId();

  if (!supabase || !userId) {
    return [];
  }

  const { data, error } = await supabase
    .from(MC_TABLES.categories)
    .select("id, name, slug, kind, color")
    .eq("user_id", userId)
    .eq("kind", kind)
    .order("name");

  if (error || !data.length) {
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    value: item.slug,
    label: item.name,
    kind: item.kind,
    color: item.color ?? undefined,
  }));
}

export async function listAllCategories(): Promise<CategoryOption[]> {
  const [expense, income, investment] = await Promise.all([
    listCategories("expense"),
    listCategories("income"),
    listCategories("investment"),
  ]);

  return [...expense, ...income, ...investment];
}
