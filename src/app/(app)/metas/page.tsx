import Link from "next/link";
import { GoalActions } from "@/components/goals/goal-actions";
import { GoalCard } from "@/components/goals/goal-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getGoalOverview, listGoals } from "@/lib/services/goals.service";
import { formatCurrency } from "@/utils/currency";

export default async function GoalsPage() {
  const goals = await listGoals();
  const overview = getGoalOverview(goals);

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Metas"
        description="Trate sonhos e objetivos como um plano financeiro visual, com progresso percentual e valor que ainda falta reservar."
        actions={
          <Link href="/metas/nova" className={buttonVariants({ size: "sm" })}>
            Nova meta
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Reservado nas metas" value={formatCurrency(overview.totalReserved)} />
        <SummaryCard label="Valor-alvo somado" value={formatCurrency(overview.totalTarget)} />
        <SummaryCard label="Metas ativas" value={String(overview.activeCount)} />
        <SummaryCard label="Metas concluídas" value={String(overview.completedCount)} />
      </div>

      {goals.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {goals.map((goal) => (
            <div key={goal.id} className="space-y-3">
              <GoalCard goal={goal} showActions={false} />
              <Card className="border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
                <CardContent className="flex items-center justify-end p-4">
                  <GoalActions goalId={goal.id} goalTitle={goal.title} />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma meta criada"
          description="Cadastre objetivos como carro, viagem, reforma ou reserva e acompanhe quanto já foi separado para cada um."
          ctaHref="/metas/nova"
          ctaLabel="Criar meta"
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
      <CardContent className="space-y-3 p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
