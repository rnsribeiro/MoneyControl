import Link from "next/link";
import type { Goal } from "@/types/finance";
import { GoalProgressBar } from "@/components/goals/goal-progress-bar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

export function DashboardGoals({ goals }: { goals: Goal[] }) {
  if (!goals.length) {
    return (
      <Card className="border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Metas financeiras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Crie metas para acompanhar sonhos como carro, viagem, reserva ou qualquer outro objetivo.
          </p>
          <Link href="/metas/nova" className={buttonVariants({ size: "sm" })}>
            Criar primeira meta
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Metas financeiras</CardTitle>
          <p className="text-sm text-muted-foreground">
            Acompanhe sonhos e objetivos sem misturar a lógica de receita, despesa e aporte.
          </p>
        </div>
        <Link href="/metas" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Ver metas
        </Link>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-3">
        {goals.slice(0, 3).map((goal) => (
          <div key={goal.id} className="rounded-2xl border border-border/70 bg-slate-50/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-medium text-foreground">{goal.title}</p>
                <p className="text-xs text-muted-foreground">
                  {goal.targetDate ? `Até ${formatDate(goal.targetDate)}` : "Sem prazo final"}
                </p>
              </div>
              <span className="text-sm font-semibold text-primary">{goal.progressPercentage}%</span>
            </div>
            <div className="mt-4 space-y-2">
              <GoalProgressBar progressPercentage={goal.progressPercentage} />
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{formatCurrency(goal.currentAmount)} reservado</span>
                <span>Faltam {formatCurrency(goal.remainingAmount)}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
