import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MC_TABLES } from "@/lib/supabase/tables";
import { getLocalDateInputValue } from "@/utils/date";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });
  }

  const { id } = await context.params;
  const { status } = (await request.json()) as { status?: "paid" | "pending" };

  if (!status) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const payload = {
    status,
    paid_at: status === "paid" ? getLocalDateInputValue() : null,
  };

  const { error } = await supabase
    .from(MC_TABLES.expenses)
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
