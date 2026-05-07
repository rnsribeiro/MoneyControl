import Link from "next/link";
import { ExpenseStatusBadge } from "@/components/expenses/expense-status-badge";
import { HistoryFilter } from "@/components/history/history-filter";
import { HistoryTypeBadge } from "@/components/history/history-type-badge";
import { IncomeStatusBadge } from "@/components/incomes/income-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getHistoryData,
  parseHistoryFilters,
} from "@/lib/services/history.service";
import type { HistoryEntry } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

interface HistoryPageProps {
  searchParams?: Promise<{
    type?: string | string[];
    term?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const filters = parseHistoryFilters(resolvedSearchParams);
  const { entries, summary } = await getHistoryData(filters);

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Histórico"
        description="Consulte todos os lançamentos do sistema em um só lugar, com filtro por tipo, intervalo de datas e busca por termo."
        actions={
          <>
            <Link href="/despesas/nova" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Nova despesa
            </Link>
            <Link href="/receitas/nova" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Nova receita
            </Link>
            <Link href="/investimentos/novo" className={buttonVariants({ size: "sm" })}>
              Novo investimento
            </Link>
          </>
        }
      />

      <HistoryFilter filters={filters} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total de lançamentos" value={summary.totalEntries.toString()} />
        <SummaryCard label="Entradas filtradas" value={formatCurrency(summary.totalIncome)} />
        <SummaryCard label="Saídas filtradas" value={formatCurrency(summary.totalExpense)} />
        <SummaryCard
          label="Investimentos filtrados"
          value={formatCurrency(summary.totalInvestment)}
        />
      </div>

      {entries.length ? (
        <Card className="min-w-0 border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Lançamentos encontrados</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lançamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Gerenciar</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={`${entry.type}-${entry.id}`}>
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
                      <Link
                        href={getHistoryEditHref(entry)}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        Abrir
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium">
                      {formatCurrency(entry.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="Nenhum lançamento encontrado"
          description="Ajuste os filtros para ampliar a busca ou registre uma nova movimentação para começar a preencher o histórico."
          ctaHref="/despesas/nova"
          ctaLabel="Cadastrar despesa"
        />
      )}
    </div>
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

function getHistoryEditHref(entry: HistoryEntry) {
  if (entry.type === "expense") {
    return `/despesas/${entry.id}/editar`;
  }

  if (entry.type === "income") {
    return `/receitas/${entry.id}/editar`;
  }

  return `/investimentos/${entry.id}/editar`;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
      <CardContent className="space-y-3 p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
