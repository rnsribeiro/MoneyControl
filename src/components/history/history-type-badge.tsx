import { Badge } from "@/components/ui/badge";
import type { TransactionType } from "@/types/finance";

const TYPE_CONFIG: Record<
  TransactionType,
  {
    label: string;
    className: string;
  }
> = {
  income: {
    label: "Entrada",
    className: "bg-emerald-100 text-emerald-800",
  },
  expense: {
    label: "Saída",
    className: "bg-rose-100 text-rose-800",
  },
  investment: {
    label: "Investimento",
    className: "bg-sky-100 text-sky-900",
  },
};

export function HistoryTypeBadge({ type }: { type: TransactionType }) {
  const config = TYPE_CONFIG[type];

  return <Badge className={config.className}>{config.label}</Badge>;
}
