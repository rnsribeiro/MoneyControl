import { ExpenseForm } from "@/components/forms/expense-form";
import { PageHeader } from "@/components/shared/page-header";
import { listCategories } from "@/lib/services/categories.service";

export default async function NewExpensePage() {
  const categoryOptions = await listCategories("expense");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar despesa"
        description="Formulário com validação pronta para receber persistência via Server Action ou route handler com Supabase."
      />
      <ExpenseForm categoryOptions={categoryOptions} />
    </div>
  );
}

