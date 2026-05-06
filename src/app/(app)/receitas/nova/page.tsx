import { IncomeForm } from "@/components/forms/income-form";
import { PageHeader } from "@/components/shared/page-header";
import { listCategories } from "@/lib/services/categories.service";

export default async function NewIncomePage() {
  const sourceOptions = await listCategories("income");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar receita"
        description="Registre receitas recebidas e valores a receber para visualizar melhor seu caixa e previsao do periodo."
      />
      <IncomeForm sourceOptions={sourceOptions} />
    </div>
  );
}
