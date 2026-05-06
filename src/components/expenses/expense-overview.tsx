import { CircleDollarSign, Clock3, CreditCard, CalendarCheck2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ExpenseOverview as ExpenseOverviewData } from "@/lib/services/expenses.service";
import { formatCurrency } from "@/utils/currency";

export function ExpenseOverview({ overview }: { overview: ExpenseOverviewData }) {
  const items = [
    {
      label: "Pago no mes",
      value: formatCurrency(overview.paidThisMonth),
      icon: CalendarCheck2,
    },
    {
      label: "Pendente no mes",
      value: formatCurrency(overview.pendingThisMonth),
      icon: Clock3,
    },
    {
      label: "Contas vencidas",
      value: String(overview.overdueCount),
      icon: CreditCard,
    },
    {
      label: "Pago no ano",
      value: formatCurrency(overview.paidThisYear),
      icon: CircleDollarSign,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-heading text-2xl font-semibold">{item.value}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
