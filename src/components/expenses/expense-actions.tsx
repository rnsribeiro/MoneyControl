"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MC_TABLES } from "@/lib/supabase/tables";
import { Button, buttonVariants } from "@/components/ui/button";

export function ExpenseActions({
  expenseId,
  expenseTitle,
}: {
  expenseId: string;
  expenseTitle: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      `Excluir a despesa "${expenseTitle}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      toast.error("Supabase não configurado.");
      return;
    }

    const { error } = await supabase.from(MC_TABLES.expenses).delete().eq("id", expenseId);

    if (error) {
      toast.error("Não foi possível excluir a despesa.", {
        description: error.message,
      });
      return;
    }

    toast.success("Despesa excluída com sucesso.");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/despesas/${expenseId}/editar`}
        aria-label={`Editar despesa ${expenseTitle}`}
        title="Editar despesa"
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
        aria-label={`Excluir despesa ${expenseTitle}`}
        title="Excluir despesa"
      >
        <Trash2 className="size-4" />
        <span className="sr-only">Excluir</span>
      </Button>
    </div>
  );
}

