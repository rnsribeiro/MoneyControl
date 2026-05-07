"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { useElementSize } from "@/hooks/use-element-size";
import type { CategoryBreakdown, DashboardSummary } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";

function buildChartData(summary: DashboardSummary): CategoryBreakdown[] {
  const items = [
    {
      category: "Receitas",
      total: summary.totalIncome,
      color: "var(--chart-1)",
    },
    {
      category: "Despesas",
      total: summary.totalExpenses,
      color: "var(--chart-4)",
    },
  ].filter((item) => item.total > 0);

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  return items.map((item) => ({
    ...item,
    percentage: grandTotal ? Math.round((item.total / grandTotal) * 100) : 0,
  }));
}

export function IncomeVsExpenseChart({
  summary,
}: {
  summary: DashboardSummary;
}) {
  const data = buildChartData(summary);
  const { ref, size } = useElementSize<HTMLDivElement>();
  const canRenderChart = size.width > 0 && size.height > 0 && data.length > 0;
  const chartSize = Math.min(size.width, size.height);
  const outerRadius = Math.max(68, Math.floor(chartSize / 2) - 18);
  const innerRadius = Math.max(42, Math.floor(outerRadius * 0.62));

  return (
    <Card className="border-border/70 bg-white/85 shadow-sm shadow-slate-200/50">
      <CardHeader className="space-y-1">
        <CardTitle className="font-heading text-xl">Receitas x despesas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Compare rapidamente o volume total de entradas e saídas no período.
        </p>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)]">
        <div
          ref={ref}
          className="flex h-80 min-w-0 items-center justify-center rounded-[28px] bg-slate-50/70 px-4 py-4"
        >
          {canRenderChart ? (
            <PieChart width={size.width} height={size.height}>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
            </PieChart>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50 text-sm text-muted-foreground">
              Sem dados suficientes para o gráfico.
            </div>
          )}
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {data.map((item) => (
            <div
              key={item.category}
              className="min-w-0 rounded-2xl border border-border/70 bg-slate-50 p-4"
            >
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="mt-1 size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.percentage}% do total comparado
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-right font-heading text-lg font-semibold">
                  {formatCurrency(item.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
