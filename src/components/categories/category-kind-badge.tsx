import { Badge } from "@/components/ui/badge";

export function CategoryKindBadge({
  kind,
}: {
  kind: "expense" | "income" | "investment";
}) {
  const label =
    kind === "expense" ? "Despesa" : kind === "income" ? "Receita" : "Investimento";

  return <Badge variant="secondary">{label}</Badge>;
}
