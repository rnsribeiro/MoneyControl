import Link from "next/link";
import { CalendarDays, CircleUserRound } from "lucide-react";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { buttonVariants } from "@/components/ui/button";

interface AppHeaderProps {
  userLabel?: string;
  isSupabaseReady: boolean;
  isAuthenticated: boolean;
}

export function AppHeader({
  userLabel,
  isSupabaseReady,
  isAuthenticated,
}: AppHeaderProps) {
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());

  return (
    <header className="flex min-w-0 flex-col gap-4 rounded-[28px] border border-border/70 bg-white/85 px-4 py-4 shadow-sm shadow-slate-200/40 backdrop-blur xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          <span className="capitalize">{today}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {isSupabaseReady
            ? "Supabase conectado. Ambiente pronto para autenticação e dados reais."
            : "Preencha .env.local para substituir os dados de exemplo por dados reais."}
        </p>
      </div>
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
          <CircleUserRound className="size-4" />
          <span className="truncate">{userLabel ?? "Convidado"}</span>
        </div>
        <Link
          href="/despesas/nova"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Nova despesa
        </Link>
        {isAuthenticated ? <SignOutButton /> : null}
      </div>
    </header>
  );
}

