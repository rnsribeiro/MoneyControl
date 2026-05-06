"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MC_TABLES } from "@/lib/supabase/tables";
import { Button, buttonVariants } from "@/components/ui/button";

export function CategoryActions({
  categoryId,
  categoryName,
}: {
  categoryId?: string;
  categoryName: string;
}) {
  const router = useRouter();

  if (!categoryId) {
    return <span className="text-xs text-muted-foreground">Padrao do sistema</span>;
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Excluir a categoria "${categoryName}"? Essa acao nao pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      toast.error("Supabase nao configurado.");
      return;
    }

    const { error } = await supabase
      .from(MC_TABLES.categories)
      .delete()
      .eq("id", categoryId);

    if (error) {
      toast.error("Nao foi possivel excluir a categoria.", {
        description: error.message,
      });
      return;
    }

    toast.success("Categoria excluida com sucesso.");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/categorias/${categoryId}/editar`}
        aria-label={`Editar categoria ${categoryName}`}
        title="Editar categoria"
        className={buttonVariants({ size: "icon-sm", variant: "outline" })}
      >
        <Pencil className="size-4" />
        <span className="sr-only">Editar</span>
      </Link>
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        onClick={handleDelete}
        aria-label={`Excluir categoria ${categoryName}`}
        title="Excluir categoria"
      >
        <Trash2 className="size-4" />
        <span className="sr-only">Excluir</span>
      </Button>
    </div>
  );
}
