import { InvestmentForm } from "@/components/forms/investment-form";
import { PageHeader } from "@/components/shared/page-header";
import { listCategories } from "@/lib/services/categories.service";

export default async function NewInvestmentPage() {
  const typeOptions = await listCategories("investment");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar investimento"
        description="Formulario estruturado para captar tipo, corretora, objetivo e valor do aporte com validacao pronta."
      />
      <InvestmentForm typeOptions={typeOptions} />
    </div>
  );
}
