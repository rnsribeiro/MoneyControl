import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/forms/category-form";
import { PageHeader } from "@/components/shared/page-header";
import { getCategoryById } from "@/lib/services/categories.service";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar categoria"
        description="Atualize nome, tipo e cor da categoria personalizada."
      />
      <CategoryForm
        initialValues={{
          id: category.id,
          name: category.label,
          kind: category.kind,
          color: category.color,
        }}
      />
    </div>
  );
}
