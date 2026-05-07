"use client";

import dynamic from "next/dynamic";
import type {
  CategoryBreakdown,
  DashboardSummary,
  MonthlyOverviewPoint,
} from "@/types/finance";

const MonthlyOverviewChart = dynamic(
  () =>
    import("@/components/dashboard/monthly-overview-chart").then(
      (module) => module.MonthlyOverviewChart,
    ),
  { ssr: false },
);

const ExpensesByCategoryChart = dynamic(
  () =>
    import("@/components/dashboard/expenses-by-category-chart").then(
      (module) => module.ExpensesByCategoryChart,
    ),
  { ssr: false },
);

const IncomeBySourceChart = dynamic(
  () =>
    import("@/components/dashboard/income-by-source-chart").then(
      (module) => module.IncomeBySourceChart,
    ),
  { ssr: false },
);

const IncomeVsExpenseChart = dynamic(
  () =>
    import("@/components/dashboard/income-vs-expense-chart").then(
      (module) => module.IncomeVsExpenseChart,
    ),
  { ssr: false },
);

interface DashboardChartsProps {
  summary: DashboardSummary;
  overview: MonthlyOverviewPoint[];
  expenseCategories: CategoryBreakdown[];
  incomeSources: CategoryBreakdown[];
}

export function DashboardCharts({
  summary,
  overview,
  expenseCategories,
  incomeSources,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6">
      <MonthlyOverviewChart data={overview} />
      <div className="grid gap-6 2xl:grid-cols-3">
        <IncomeVsExpenseChart summary={summary} />
        <ExpensesByCategoryChart data={expenseCategories} />
        <IncomeBySourceChart data={incomeSources} />
      </div>
    </div>
  );
}
