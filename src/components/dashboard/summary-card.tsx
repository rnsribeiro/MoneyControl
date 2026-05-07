import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";

interface SummaryCardProps {
  title: string;
  value: number;
  hint: string;
  trend?: "up" | "down";
  icon: LucideIcon;
}

export function SummaryCard({
  title,
  value,
  hint,
  trend = "up",
  icon: Icon,
}: SummaryCardProps) {
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="min-h-[216px] overflow-hidden border-border/70 bg-white/85 shadow-sm shadow-slate-200/50">
      <CardContent className="flex h-full flex-col gap-6 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="font-heading text-[2rem] leading-none font-semibold tracking-tight text-foreground sm:text-[2.2rem]">
              {formatCurrency(value)}
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
        </div>
        <div className="mt-auto flex items-start gap-2 rounded-2xl bg-slate-50/85 p-3 text-sm leading-6 text-muted-foreground">
          <TrendIcon
            className={
              trend === "up"
                ? "mt-0.5 size-4 shrink-0 text-emerald-600"
                : "mt-0.5 size-4 shrink-0 text-rose-500"
            }
          />
          <span>{hint}</span>
        </div>
      </CardContent>
    </Card>
  );
}
