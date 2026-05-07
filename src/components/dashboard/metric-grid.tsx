import {
  CircleDollarSign,
  Landmark,
  PiggyBank,
  TrendingDown,
  Wallet,
} from "lucide-react";
import type { DashboardSummary } from "@/types/finance";
import { SummaryCard } from "@/components/dashboard/summary-card";

export function MetricGrid({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        title="Em caixa"
        value={summary.cashOnHand}
        hint="Recebido menos despesas pagas e investimentos."
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
        title="Despesas pagas"
        value={summary.paidExpenses}
        hint={`${summary.pendingExpenses > 0 ? "Ainda há contas pendentes." : "Tudo quitado no período."}`}
        trend="down"
        icon={TrendingDown}
      />
      <SummaryCard
        title="Investimentos"
        value={summary.totalInvested}
        hint={`${summary.savingsRate}% do recebido foi para patrimônio.`}
        icon={PiggyBank}
      />
    </div>
  );
}

