import { notFound } from "next/navigation";
import { ExpenseForm } from "@/components/forms/expense-form";
import { PageHeader } from "@/components/shared/page-header";
import { listCategories } from "@/lib/services/categories.service";
import { getExpenseById } from "@/lib/services/expenses.service";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [expense, categoryOptions] = await Promise.all([
    getExpenseById(id),
    listCategories("expense"),
  ]);

  if (!expense) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar despesa"
        description="Atualize vencimento, categoria, pagamento e status da conta."
      />
      <ExpenseForm
        categoryOptions={categoryOptions}
        initialValues={{
          id: expense.id,
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          dueDate: expense.dueDate,
          paymentMethod: expense.paymentMethod,
          status: expense.status === "paid" ? "paid" : "pending",
          notes: expense.notes,
        }}
      />
    </div>
  );
}
