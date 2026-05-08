"use client";

import { useRouter } from "next/navigation";
import { ExpenseStatusBadge } from "@/components/expenses/expense-status-badge";
import { HistoryTypeBadge } from "@/components/history/history-type-badge";
import { IncomeStatusBadge } from "@/components/incomes/income-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { HistoryEntry } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

export function HistoryEntryRow({
  entry,
  href,
}: {
  entry: HistoryEntry;
  href: string;
}) {
  const router = useRouter();

  function navigate() {
    router.push(href);
  }

  return (
    <TableRow
      role="link"
      tabIndex={0}
      onClick={navigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate();
        }
      }}
      className="cursor-pointer focus-visible:bg-muted/60 focus-visible:outline-none"
    >
      <TableCell className="min-w-[220px]">
        <div className="space-y-1">
          <p className="font-medium text-foreground">{entry.title}</p>
          <p className="text-xs text-muted-foreground">{entry.secondaryLabel}</p>
        </div>
      </TableCell>
      <TableCell>
        <HistoryTypeBadge type={entry.type} />
      </TableCell>
      <TableCell className="capitalize">{entry.category}</TableCell>
      <TableCell>{renderStatusBadge(entry)}</TableCell>
      <TableCell>{formatDate(entry.date)}</TableCell>
      <TableCell className="max-w-[280px] text-sm text-muted-foreground">
        {entry.notes || "Sem observações."}
      </TableCell>
      <TableCell className="text-right">
        <span className={buttonVariants({ variant: "ghost", size: "sm" })}>Abrir</span>
      </TableCell>
      <TableCell className="whitespace-nowrap text-right font-medium">
        {formatCurrency(entry.amount)}
      </TableCell>
    </TableRow>
  );
}

function renderStatusBadge(entry: HistoryEntry) {
  if (entry.type === "expense") {
    const status =
      entry.status === "Pago"
        ? "paid"
        : entry.status === "Vencida"
          ? "overdue"
          : entry.status === "Parcial"
            ? "partial"
            : "pending";

    return <ExpenseStatusBadge status={status} />;
  }

  if (entry.type === "income") {
    return <IncomeStatusBadge status={entry.status === "Recebido" ? "received" : "expected"} />;
  }

  return <span className="text-sm font-medium text-muted-foreground">{entry.status}</span>;
}
