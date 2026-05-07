"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ExpenseStatus } from "@/types/finance";

interface ExpenseStatusToggleProps {
  expenseId: string;
  status: ExpenseStatus;
  amount?: number;
}

export function ExpenseStatusToggle({
  expenseId,
  status,
  amount,
}: ExpenseStatusToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);

    const nextStatus = status === "paid" ? "pending" : "paid";
    const response = await fetch(`/api/expenses/${expenseId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: nextStatus,
      }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error("Não foi possível atualizar a despesa.", {
        description: payload.error ?? "Tente novamente.",
      });
      setIsLoading(false);
      return;
    }

    toast.success(
      nextStatus === "paid"
        ? `Despesa marcada como paga${amount ? ` em ${amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : ""}.`
        : "Despesa marcada como pendente.",
    );
    router.refresh();
    setIsLoading(false);
  }

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="outline"
      disabled={isLoading}
      onClick={handleToggle}
      aria-label={status === "paid" ? "Marcar despesa como pendente" : "Marcar despesa como paga"}
      title={status === "paid" ? "Marcar pendente" : "Quitar despesa"}
    >
      {status === "paid" ? <RotateCcw className="size-4" /> : <CheckCircle2 className="size-4" />}
      <span className="sr-only">
        {status === "paid" ? "Marcar pendente" : "Quitar despesa"}
      </span>
    </Button>
  );
}

