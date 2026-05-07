import { BrandLogo } from "@/components/shared/brand-logo";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  PiggyBank,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(19,78,74,0.22),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(180deg,_#f7fbfa_0%,_#eef5f6_48%,_#ffffff_100%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div>
            <BrandLogo className="h-16" priority />
            <p className="text-sm text-muted-foreground">
              Despesas, investimentos e dashboards em um único lugar.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
              Entrar
            </Link>
            <Link href="/cadastro" className={buttonVariants({ className: "bg-primary text-primary-foreground" })}>
              Criar conta
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <span className="inline-flex rounded-full border border-primary/20 bg-white/80 px-4 py-1 text-sm font-medium text-primary shadow-sm backdrop-blur">
              Controle financeiro com foco em clareza e ação
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-heading text-5xl font-bold tracking-tight text-balance text-foreground lg:text-6xl">
                Visualize seus gastos, organize seus aportes e tome decisões com segurança.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                O MoneyControl foi pensado para transformar movimentações do dia a dia
                em um painel claro: saldo, categorias, investimentos e metas sempre a
                um clique.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className={buttonVariants({ size: "lg", className: "h-12 px-6" })}
              >
                Ver dashboard demo
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/despesas/nova"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "h-12 px-6",
                })}
              >
                Cadastrar primeira despesa
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <FeatureCard
                icon={<Wallet className="size-5 text-primary" />}
                title="Gestão de gastos"
                description="Registre despesas, acompanhe categorias e monitore variações."
              />
              <FeatureCard
                icon={<PiggyBank className="size-5 text-primary" />}
                title="Investimentos"
                description="Acompanhe aportes, corretoras e objetivos financeiros."
              />
              <FeatureCard
                icon={<BarChart3 className="size-5 text-primary" />}
                title="Dashboards"
                description="Cards e gráficos para entender seu dinheiro sem planilhas soltas."
              />
            </div>
          </div>

          <Card className="overflow-hidden border-white/60 bg-white/90 shadow-2xl shadow-primary/10 backdrop-blur">
            <CardHeader className="border-b border-border/60 bg-slate-950 px-6 py-5 text-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-xl">Visão do mês</CardTitle>
                  <p className="mt-1 text-sm text-slate-300">
                    Resumo rápido com foco em saldo, gastos e investimentos.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                  <ShieldCheck className="size-3.5" />
                  Estrutura pronta para Supabase
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <MetricPreview label="Saldo atual" value="R$ 7.450,00" accent="text-emerald-600" />
                <MetricPreview label="Investido no mês" value="R$ 1.850,00" accent="text-sky-600" />
                <MetricPreview label="Despesas fixas" value="R$ 2.930,00" accent="text-rose-600" />
                <MetricPreview label="Taxa de poupança" value="28%" accent="text-amber-600" />
              </div>
              <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Categorias com mais impacto</p>
                    <p className="text-xs text-muted-foreground">
                      Alimentação, moradia e transporte concentraram 67% dos gastos.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Abril</span>
                </div>
                <div className="space-y-3">
                  <ProgressPreview label="Moradia" value="42%" width="w-[42%]" tone="bg-primary" />
                  <ProgressPreview label="Alimentação" value="16%" width="w-[16%]" tone="bg-sky-500" />
                  <ProgressPreview label="Transporte" value="9%" width="w-[9%]" tone="bg-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-white/70 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur">
      <CardContent className="space-y-3 p-5">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
          {icon}
        </div>
        <div className="space-y-1.5">
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricPreview({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-2 font-heading text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function ProgressPreview({
  label,
  value,
  width,
  tone,
}: {
  label: string;
  value: string;
  width: string;
  tone: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className={`h-2 rounded-full ${width} ${tone}`} />
      </div>
    </div>
  );
}

