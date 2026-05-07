import Link from "next/link";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardFilter } from "@/components/dashboard/dashboard-filter";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { MigrationWarning } from "@/app/(app)/dashboard/migration-warning";
import { PageHeader } from "@/components/shared/page-header";
import {
  getDashboardData,
  parseDashboardFilter,
} from "@/lib/services/dashboard.service";
import { buttonVariants } from "@/components/ui/button";
import { hasExpenseTableConnection } from "@/lib/services/expenses.service";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{
    filter?: string | string[];
    month?: string | string[];
  }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const filter = parseDashboardFilter(resolvedSearchParams);

  const [dashboardData, hasTables] = await Promise.all([
    getDashboardData(filter),
    hasExpenseTableConnection(),
  ]);

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão consolidada para acompanhar saldo, categorias com maior impacto e ritmo dos aportes."
        actions={
          <>
            <Link
              href="/receitas/nova"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Nova receita
            </Link>
            <Link
              href="/investimentos/novo"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Novo aporte
            </Link>
            <Link href="/despesas/nova" className={buttonVariants({ size: "sm" })}>
              Nova despesa
            </Link>
          </>
        }
      />
      <DashboardFilter
        filter={dashboardData.filter}
        monthOptions={dashboardData.monthOptions}
      />
      {!hasTables ? <MigrationWarning /> : null}
      <MetricGrid summary={dashboardData.summary} />
      <DashboardCharts
        summary={dashboardData.summary}
        overview={dashboardData.overview}
        expenseCategories={dashboardData.expenseCategories}
        incomeSources={dashboardData.incomeSources}
      />
      <RecentTransactions activities={dashboardData.activities} />
    </div>
  );
}
