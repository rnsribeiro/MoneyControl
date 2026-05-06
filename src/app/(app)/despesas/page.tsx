import Link from "next/link";
import { ExpenseActions } from "@/components/expenses/expense-actions";
import { ExpenseOverview } from "@/components/expenses/expense-overview";
import { ExpenseStatusBadge } from "@/components/expenses/expense-status-badge";
import { ExpenseStatusToggle } from "@/components/expenses/expense-status-toggle";
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
import { getExpenseOverview, listExpenses } from "@/lib/services/expenses.service";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

export default async function ExpensesPage() {
  const expenses = await listExpenses();
  const overview = getExpenseOverview(expenses);

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Despesas"
        description="Registre, filtre e acompanhe tudo o que sai do seu caixa com um layout pronto para evoluir para CRUD completo."
        actions={
          <Link href="/despesas/nova" className={buttonVariants({ size: "sm" })}>
            Adicionar despesa
          </Link>
        }
      />
      <ExpenseOverview overview={overview} />

      {expenses.length ? (
        <Card className="min-w-0 border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Contas do periodo</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pago em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Atualizar</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Gerenciar</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell className="capitalize">{expense.category}</TableCell>
                    <TableCell className="capitalize">{expense.paymentMethod}</TableCell>
                    <TableCell>{formatDate(expense.dueDate)}</TableCell>
                    <TableCell>
                      {expense.paidAt ? formatDate(expense.paidAt) : "Ainda nao"}
                    </TableCell>
                    <TableCell>
                      <ExpenseStatusBadge status={expense.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ExpenseStatusToggle expenseId={expense.id} status={expense.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ExpenseActions expenseId={expense.id} expenseTitle={expense.title} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="Nenhuma despesa registrada"
          description="Comece cadastrando a primeira movimentacao para popular tabelas, cards e graficos."
          ctaHref="/despesas/nova"
          ctaLabel="Cadastrar despesa"
        />
      )}
    </div>
  );
}
