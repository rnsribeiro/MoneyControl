import { notFound } from "next/navigation";
import { IncomeForm } from "@/components/forms/income-form";
import { PageHeader } from "@/components/shared/page-header";
import { listCategories } from "@/lib/services/categories.service";
import { getIncomeById } from "@/lib/services/incomes.service";

export default async function EditIncomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [income, sourceOptions] = await Promise.all([
    getIncomeById(id),
    listCategories("income"),
  ]);

  if (!income) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar receita"
        description="Atualize descricao, origem, data e status da receita."
      />
      <IncomeForm
        sourceOptions={sourceOptions}
        initialValues={{
          id: income.id,
          title: income.title,
          amount: income.amount,
          source: income.source,
          date: income.status === "received" ? income.receivedAt ?? income.date : income.expectedDate,
          status: income.status,
          notes: income.notes,
        }}
      />
    </div>
  );
}
