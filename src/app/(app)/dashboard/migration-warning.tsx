import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function MigrationWarning() {
  return (
    <Card className="border-amber-200 bg-amber-50/80">
      <CardContent className="flex items-start gap-3 px-5 py-4 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          As tabelas do MoneyControl ainda não parecem disponíveis neste projeto Supabase.
          Aplique a migration em{" "}
          <code>supabase/migrations/20260506103000_moneycontrol_init.sql</code> para
          sair do modo demonstração.
        </p>
      </CardContent>
    </Card>
  );
}

