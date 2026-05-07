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
  const { amount, paymentDate } = (await request.json()) as {
    amount?: number;
    paymentDate?: string;
  };

  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: "Informe um valor de pagamento válido." }, { status: 400 });
  }

  const { data: expense, error: expenseError } = await supabase
    .from(MC_TABLES.expenses)
    .select("amount, paid_amount")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (expenseError || !expense) {
    return NextResponse.json({ error: "Despesa não encontrada." }, { status: 404 });
  }

  const totalAmount = Number(expense.amount);
  const currentPaidAmount = Number(expense.paid_amount ?? 0);
  const nextPaidAmount = Math.min(totalAmount, currentPaidAmount + parsedAmount);
  const nextStatus =
    nextPaidAmount >= totalAmount ? "paid" : nextPaidAmount > 0 ? "partial" : "pending";

  const { error } = await supabase
    .from(MC_TABLES.expenses)
    .update({
      paid_amount: nextPaidAmount,
      status: nextStatus,
      paid_at: paymentDate || getLocalDateInputValue(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, paidAmount: nextPaidAmount, status: nextStatus });
}
