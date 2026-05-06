"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MC_TABLES } from "@/lib/supabase/tables";
import { Button, buttonVariants } from "@/components/ui/button";

export function IncomeActions({
  incomeId,
  incomeTitle,
}: {
  incomeId: string;
  incomeTitle: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      `Excluir a receita "${incomeTitle}"? Essa acao nao pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      toast.error("Supabase nao configurado.");
      return;
    }

    const { error } = await supabase.from(MC_TABLES.incomes).delete().eq("id", incomeId);

    if (error) {
      toast.error("Nao foi possivel excluir a receita.", {
        description: error.message,
      });
      return;
    }

    toast.success("Receita excluida com sucesso.");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/receitas/${incomeId}/editar`}
        aria-label={`Editar receita ${incomeTitle}`}
        title="Editar receita"
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
        aria-label={`Excluir receita ${incomeTitle}`}
        title="Excluir receita"
      >
        <Trash2 className="size-4" />
        <span className="sr-only">Excluir</span>
      </Button>
    </div>
  );
}
