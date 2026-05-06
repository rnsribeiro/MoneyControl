import { Badge } from "@/components/ui/badge";
import type { ExpenseStatus } from "@/types/finance";

export function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
  const config = {
    paid: {
      label: "Pago",
      className: "bg-emerald-100 text-emerald-800",
    },
    pending: {
      label: "Pendente",
      className: "bg-amber-100 text-amber-900",
    },
    overdue: {
      label: "Vencida",
      className: "bg-rose-100 text-rose-800",
    },
  }[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}
