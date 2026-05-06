import { Badge } from "@/components/ui/badge";
import type { IncomeStatus } from "@/types/finance";

export function IncomeStatusBadge({ status }: { status: IncomeStatus }) {
  const config = {
    received: {
      label: "Recebido",
      className: "bg-emerald-100 text-emerald-800",
    },
    expected: {
      label: "A receber",
      className: "bg-sky-100 text-sky-900",
    },
  }[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}
