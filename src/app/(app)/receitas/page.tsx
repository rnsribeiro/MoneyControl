import Link from "next/link";
import { IncomeBySourceChart } from "@/components/dashboard/income-by-source-chart";
import { IncomeActions } from "@/components/incomes/income-actions";
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
import { getIncomeBySource } from "@/lib/services/dashboard.service";
import { listIncomes } from "@/lib/services/incomes.service";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

export default async function IncomesPage() {
  const [incomes, incomeSources] = await Promise.all([
    listIncomes(),
    getIncomeBySource(),
  ]);

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

      {incomeSources.length ? <IncomeBySourceChart data={incomeSources} /> : null}

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
