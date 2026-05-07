import Link from "next/link";
import { ExpenseActions } from "@/components/expenses/expense-actions";
import { ExpenseOverview } from "@/components/expenses/expense-overview";
import { ExpensePaymentDialog } from "@/components/expenses/expense-payment-dialog";
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
        description="Registre, filtre e acompanhe tudo o que sai do seu caixa, inclusive contas parcialmente pagas."
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
            <CardTitle className="font-heading text-xl">Contas do período</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Pago</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Falta</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Atalhos</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Gerenciar</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <p>{expense.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.paidAt
                            ? `Último pagamento em ${formatDate(expense.paidAt)}`
                            : "Sem pagamento registrado"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{expense.category}</TableCell>
                    <TableCell className="capitalize">{expense.paymentMethod}</TableCell>
                    <TableCell>{formatDate(expense.dueDate)}</TableCell>
                    <TableCell>
                      <ExpenseStatusBadge status={expense.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium text-emerald-700">
                      {formatCurrency(expense.paidAmount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium text-amber-700">
                      {formatCurrency(expense.remainingAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {expense.remainingAmount > 0 ? (
                          <ExpensePaymentDialog
                            expenseId={expense.id}
                            expenseTitle={expense.title}
                            remainingAmount={expense.remainingAmount}
                          />
                        ) : null}
                        <ExpenseStatusToggle
                          expenseId={expense.id}
                          status={expense.status}
                          amount={expense.amount}
                        />
                      </div>
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
          description="Comece cadastrando a primeira movimentação para popular tabelas, cards e gráficos."
          ctaHref="/despesas/nova"
          ctaLabel="Cadastrar despesa"
        />
      )}
    </div>
  );
}
