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
    <Card className="overflow-hidden border-border/70 bg-white/85 shadow-sm shadow-slate-200/50">
      <CardContent className="space-y-5 p-5">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="font-heading text-3xl font-semibold tracking-tight">
              {formatCurrency(value)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
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
