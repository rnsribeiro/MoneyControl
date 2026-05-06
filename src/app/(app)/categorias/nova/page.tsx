import { CategoryForm } from "@/components/forms/category-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar categoria"
        description="Adicione categorias proprias para despesas, receitas e investimentos."
      />
      <CategoryForm />
    </div>
  );
}
