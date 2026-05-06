"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useElementSize } from "@/hooks/use-element-size";
import type { MonthlyOverviewPoint } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";

export function MonthlyOverviewChart({
  data,
}: {
  data: MonthlyOverviewPoint[];
}) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const canRenderChart = size.width > 0 && size.height > 0 && data.length > 0;

  return (
    <Card className="border-border/70 bg-white/85 shadow-sm shadow-slate-200/50">
      <CardHeader className="space-y-1">
        <CardTitle className="font-heading text-xl">Evolucao mensal</CardTitle>
        <p className="text-sm text-muted-foreground">
          Compare receitas, despesas e aportes para ajustar seu ritmo financeiro.
        </p>
      </CardHeader>
      <CardContent className="min-w-0">
        <div ref={ref} className="h-80 min-w-0">
          {canRenderChart ? (
            <AreaChart width={size.width} height={size.height} data={data}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100, 116, 139, 0.15)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `R$ ${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="var(--chart-1)"
                fill="url(#incomeGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="var(--chart-4)"
                fill="url(#expenseGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-slate-50 text-sm text-muted-foreground">
              {data.length ? "Carregando grafico..." : "Sem dados suficientes para o grafico."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
