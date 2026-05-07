import Link from "next/link";
import { IncomeBySourceChart } from "@/components/dashboard/income-by-source-chart";
import { IncomeActions } from "@/components/incomes/income-actions";
import { IncomeStatusBadge } from "@/components/incomes/income-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RecordsFilter } from "@/components/shared/records-filter";
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
import { getIncomeData, parseIncomeFilters } from "@/lib/services/incomes.service";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

const INCOME_STATUS_OPTIONS = [
  { value: "all", label: "Todos os status" },
  { value: "received", label: "Somente recebidas" },
  { value: "expected", label: "Somente a receber" },
];

export default async function IncomesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    status?: string | string[];
    term?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
  }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const filters = parseIncomeFilters(resolvedSearchParams);
  const { incomes, sourceBreakdown } = await getIncomeData(filters);

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Receitas"
        description="Centralize entradas financeiras para que saldo, taxa de poupança e evolução mensal reflitam seus dados reais."
        actions={
          <Link href="/receitas/nova" className={buttonVariants({ size: "sm" })}>
            Adicionar receita
          </Link>
        }
      />
      <RecordsFilter
        title="Filtro completo de receitas"
        description="Refine a visualização por status, intervalo de datas e busca por termo para localizar rapidamente qualquer entrada."
        searchPlaceholder="Descrição, origem ou observação"
        statusLabel="Status"
        statusOptions={INCOME_STATUS_OPTIONS}
        filters={filters}
      />

      {sourceBreakdown.length ? <IncomeBySourceChart data={sourceBreakdown} /> : null}

      {incomes.length ? (
        <Card className="min-w-0 border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Entradas do período</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Previsto</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">
                    Gerenciar
                  </TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell className="font-medium">{income.title}</TableCell>
                    <TableCell className="capitalize">{income.source}</TableCell>
                    <TableCell>
                      <IncomeStatusBadge status={income.status} />
                    </TableCell>
                    <TableCell>{formatDate(income.expectedDate)}</TableCell>
                    <TableCell>{formatDate(income.date)}</TableCell>
                    <TableCell className="text-right">
                      <IncomeActions incomeId={income.id} incomeTitle={income.title} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium">
                      {formatCurrency(income.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="Nenhuma receita registrada"
          description="Cadastre entradas para refletir saldo, variação mensal e metas de investimento com mais precisão."
          ctaHref="/receitas/nova"
          ctaLabel="Cadastrar receita"
        />
      )}
    </div>
  );
}
