import Link from "next/link";
import { InvestmentActions } from "@/components/investments/investment-actions";
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
import { listInvestments } from "@/lib/services/investments.service";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

export default async function InvestmentsPage() {
  const investments = await listInvestments();

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Investimentos"
        description="Acompanhe aportes e organize o historico da carteira com uma base preparada para metas e rentabilidade futura."
        actions={
          <Link href="/investimentos/novo" className={buttonVariants({ size: "sm" })}>
            Adicionar aporte
          </Link>
        }
      />

      {investments.length ? (
        <Card className="min-w-0 border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Aportes recentes</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Corretora</TableHead>
                  <TableHead>Objetivo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Gerenciar</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell className="font-medium">{investment.name}</TableCell>
                    <TableCell className="capitalize">{investment.type}</TableCell>
                    <TableCell>{investment.broker}</TableCell>
                    <TableCell className="capitalize">{investment.goal}</TableCell>
                    <TableCell>{formatDate(investment.date)}</TableCell>
                    <TableCell className="text-right">
                      <InvestmentActions
                        investmentId={investment.id}
                        investmentTitle={investment.name}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium">
                      {formatCurrency(investment.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="Nenhum investimento registrado"
          description="Cadastre aportes para visualizar a evolucao do patrimonio e integrar essas informacoes ao dashboard."
          ctaHref="/investimentos/novo"
          ctaLabel="Cadastrar aporte"
        />
      )}
    </div>
  );
}
