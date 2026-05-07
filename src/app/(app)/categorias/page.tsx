import Link from "next/link";
import { CategoryActions } from "@/components/categories/category-actions";
import { CategoryKindBadge } from "@/components/categories/category-kind-badge";
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
import { listAllCategories } from "@/lib/services/categories.service";

export default async function CategoriesPage() {
  const categories = await listAllCategories();

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Categorias"
        description="Cadastre categorias personalizadas para despesas, receitas e investimentos e use essas opções nos formulários."
        actions={
          <Link href="/categorias/nova" className={buttonVariants({ size: "sm" })}>
            Nova categoria
          </Link>
        }
      />

      {categories.length ? (
        <Card className="min-w-0 border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Categorias disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-px whitespace-nowrap text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id ?? `${category.kind}-${category.value}`}>
                    <TableCell className="font-medium">{category.label}</TableCell>
                    <TableCell>{category.value}</TableCell>
                    <TableCell>
                      <CategoryKindBadge kind={category.kind} />
                    </TableCell>
                    <TableCell className="text-right">
                      <CategoryActions
                        categoryId={category.id}
                        categoryName={category.label}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="Nenhuma categoria cadastrada"
          description="Crie categorias personalizadas para organizar melhor seus lançamentos."
          ctaHref="/categorias/nova"
          ctaLabel="Cadastrar categoria"
        />
      )}
    </div>
  );
}

