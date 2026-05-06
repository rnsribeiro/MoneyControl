"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MC_TABLES } from "@/lib/supabase/tables";
import { Button, buttonVariants } from "@/components/ui/button";

export function InvestmentActions({
  investmentId,
  investmentTitle,
}: {
  investmentId: string;
  investmentTitle: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      `Excluir o investimento "${investmentTitle}"? Essa acao nao pode ser desfeita.`,
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
      .from(MC_TABLES.investments)
      .delete()
      .eq("id", investmentId);

    if (error) {
      toast.error("Nao foi possivel excluir o investimento.", {
        description: error.message,
      });
      return;
    }

    toast.success("Investimento excluido com sucesso.");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/investimentos/${investmentId}/editar`}
        aria-label={`Editar investimento ${investmentTitle}`}
        title="Editar investimento"
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
        aria-label={`Excluir investimento ${investmentTitle}`}
        title="Excluir investimento"
      >
        <Trash2 className="size-4" />
        <span className="sr-only">Excluir</span>
      </Button>
    </div>
  );
}
