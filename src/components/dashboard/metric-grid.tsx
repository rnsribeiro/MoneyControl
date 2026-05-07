import {
  CircleDollarSign,
  Landmark,
  PiggyBank,
  Target,
  TrendingDown,
  Wallet,
} from "lucide-react";
import type { DashboardSummary } from "@/types/finance";
import { SummaryCard } from "@/components/dashboard/summary-card";

export function MetricGrid({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
      <SummaryCard
        title="Em caixa"
        value={summary.cashOnHand}
        hint="Recebido menos despesas já pagas e investimentos."
        icon={Wallet}
      />
      <SummaryCard
        title="Recebido"
        value={summary.receivedIncome}
        hint="Receitas que já entraram no caixa."
        icon={Landmark}
      />
      <SummaryCard
        title="A receber"
        value={summary.expectedIncome}
        hint="Valores previstos para entrar."
        icon={CircleDollarSign}
      />
      <SummaryCard
        title="Pago em despesas"
        value={summary.paidExpenses}
        hint={
          summary.pendingExpenses > 0
            ? `Ainda faltam ${summary.pendingExpenses.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })} para quitar tudo.`
            : "Tudo quitado no período."
        }
        trend="down"
        icon={TrendingDown}
      />
      <SummaryCard
        title="Investimentos"
        value={summary.totalInvested}
        hint={`${summary.savingsRate}% do recebido foi para patrimônio.`}
        icon={PiggyBank}
      />
      <SummaryCard
        title="Reservado para metas"
        value={summary.goalReserved}
        hint="Objetivos acompanhados como sonhos e desejos financeiros."
        icon={Target}
      />
    </div>
  );
}
