import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { name, email, password } = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      {
        error: "Informe nome, e-mail e senha válidos.",
      },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      {
        error: "Supabase não configurado no servidor.",
      },
      { status: 500 },
    );
  }

  const admin = createSupabaseAdminClient();

  if (admin) {
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name ?? "",
      },
    });

    if (createError) {
      const normalizedMessage =
        createError.message.toLowerCase().includes("already") ||
        createError.message.toLowerCase().includes("registered") ||
        createError.message.toLowerCase().includes("exists")
          ? "Este e-mail já está cadastrado. Tente entrar na plataforma com sua senha."
          : createError.message;

      return NextResponse.json(
        {
          error: normalizedMessage,
        },
        { status: 400 },
      );
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        {
          error: signInError.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      autoConfirmed: true,
    });
  }

  const origin = request.headers.get("origin");
  const emailRedirectTo = origin ? `${origin}/login` : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        full_name: name ?? "",
      },
    },
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    autoConfirmed: Boolean(data.session),
    requiresEmailConfirmation: !data.session,
  });
}

