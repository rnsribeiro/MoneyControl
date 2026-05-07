import Link from "next/link";
import { CheckCircle2, Clock3, Target } from "lucide-react";
import type { Goal } from "@/types/finance";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalProgressBar } from "@/components/goals/goal-progress-bar";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

export function GoalCard({
  goal,
  showActions = true,
}: {
  goal: Goal;
  showActions?: boolean;
}) {
  return (
    <Card className="border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="font-heading text-xl">{goal.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {goal.targetDate
                ? `Meta até ${formatDate(goal.targetDate)}`
                : "Meta sem prazo final definido"}
            </p>
          </div>
          <div
            className={`flex size-11 items-center justify-center rounded-2xl ${
              goal.isCompleted
                ? "bg-emerald-100 text-emerald-700"
                : "bg-primary/10 text-primary"
            }`}
          >
            {goal.isCompleted ? (
              <CheckCircle2 className="size-5" />
            ) : goal.targetDate ? (
              <Clock3 className="size-5" />
            ) : (
              <Target className="size-5" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Valor-alvo" value={formatCurrency(goal.targetAmount)} />
          <Metric label="Já reservado" value={formatCurrency(goal.currentAmount)} />
          <Metric label="Ainda falta" value={formatCurrency(goal.remainingAmount)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">Progresso da meta</span>
            <span className="text-sm font-semibold text-primary">
              {goal.progressPercentage}%
            </span>
          </div>
          <GoalProgressBar progressPercentage={goal.progressPercentage} />
        </div>
        {goal.notes ? <p className="text-sm leading-6 text-muted-foreground">{goal.notes}</p> : null}
        {showActions ? (
          <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
            <Link
              href={`/metas/${goal.id}/editar`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Editar meta
            </Link>
            <Link href="/investimentos/novo" className={buttonVariants({ size: "sm" })}>
              Registrar aporte
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-slate-50/80 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
