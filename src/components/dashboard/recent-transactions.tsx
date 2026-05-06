import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecentActivity } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { ExpenseStatusBadge } from "@/components/expenses/expense-status-badge";

export function RecentTransactions({
  activities,
}: {
  activities: RecentActivity[];
}) {
  return (
    <Card className="min-w-0 border-border/70 bg-white/85 shadow-sm shadow-slate-200/50">
      <CardHeader className="space-y-1">
        <CardTitle className="font-heading text-xl">Movimentacoes recentes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Lista consolidada para acompanhar o que mais mudou no periodo.
        </p>
      </CardHeader>
      <CardContent className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descricao</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-px whitespace-nowrap text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {activity.type}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{activity.category}</TableCell>
                <TableCell>{formatDate(activity.date)}</TableCell>
                <TableCell>
                  {activity.type === "expense" &&
                  (activity.status === "paid" ||
                    activity.status === "pending" ||
                    activity.status === "overdue") ? (
                    <ExpenseStatusBadge status={activity.status} />
                  ) : (
                    <Badge variant="secondary" className="capitalize">
                      {activity.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right font-medium">
                  {formatCurrency(activity.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
