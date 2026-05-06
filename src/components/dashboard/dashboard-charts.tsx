"use client";

import dynamic from "next/dynamic";
import type { CategoryBreakdown, MonthlyOverviewPoint } from "@/types/finance";

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

interface DashboardChartsProps {
  overview: MonthlyOverviewPoint[];
  categories: CategoryBreakdown[];
}

export function DashboardCharts({
  overview,
  categories,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
      <MonthlyOverviewChart data={overview} />
      <ExpensesByCategoryChart data={categories} />
    </div>
  );
}
