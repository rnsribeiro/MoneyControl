import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { MigrationWarning } from "@/app/(app)/dashboard/migration-warning";
import { PageHeader } from "@/components/shared/page-header";
import {
  getDashboardSummary,
  getExpensesByCategory,
  getMonthlyOverview,
  getRecentActivities,
} from "@/lib/services/dashboard.service";
import { buttonVariants } from "@/components/ui/button";
import { hasExpenseTableConnection } from "@/lib/services/expenses.service";
import Link from "next/link";

export default async function DashboardPage() {
  const [summary, categories, overview, activities, hasTables] = await Promise.all([
    getDashboardSummary(),
    getExpensesByCategory(),
    getMonthlyOverview(),
    getRecentActivities(),
    hasExpenseTableConnection(),
  ]);

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visao consolidada do periodo para acompanhar saldo, categorias com maior impacto e ritmo dos aportes."
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
      {!hasTables ? <MigrationWarning /> : null}
      <MetricGrid summary={summary} />
      <DashboardCharts overview={overview} categories={categories} />
      <RecentTransactions activities={activities} />
    </div>
  );
}
