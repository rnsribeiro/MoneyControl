import { notFound } from "next/navigation";
import { InvestmentForm } from "@/components/forms/investment-form";
import { PageHeader } from "@/components/shared/page-header";
import { listCategories } from "@/lib/services/categories.service";
import { getInvestmentById } from "@/lib/services/investments.service";

export default async function EditInvestmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [investment, typeOptions] = await Promise.all([
    getInvestmentById(id),
    listCategories("investment"),
  ]);

  if (!investment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar investimento"
        description="Atualize ativo, categoria, corretora, objetivo e valor do aporte."
      />
      <InvestmentForm
        typeOptions={typeOptions}
        initialValues={{
          id: investment.id,
          name: investment.name,
          type: investment.type,
          amount: investment.amount,
          broker: investment.broker,
          goal: investment.goal,
          date: investment.date,
          notes: investment.notes,
        }}
      />
    </div>
  );
}
