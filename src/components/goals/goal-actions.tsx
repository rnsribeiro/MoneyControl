"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MC_TABLES } from "@/lib/supabase/tables";
import { Button, buttonVariants } from "@/components/ui/button";

export function GoalActions({
  goalId,
  goalTitle,
}: {
  goalId: string;
  goalTitle: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(`Excluir a meta "${goalTitle}"? Essa ação não pode ser desfeita.`);

    if (!confirmed) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      toast.error("Supabase não configurado.");
      return;
    }

    const { error } = await supabase.from(MC_TABLES.goals).delete().eq("id", goalId);

    if (error) {
      toast.error("Não foi possível excluir a meta.", {
        description: error.message,
      });
      return;
    }

    toast.success("Meta excluída com sucesso.");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/metas/${goalId}/editar`}
        aria-label={`Editar meta ${goalTitle}`}
        title="Editar meta"
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
        aria-label={`Excluir meta ${goalTitle}`}
        title="Excluir meta"
      >
        <Trash2 className="size-4" />
        <span className="sr-only">Excluir</span>
      </Button>
    </div>
  );
}
