"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { BanknoteArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/currency";
import { getLocalDateInputValue } from "@/utils/date";

export function ExpensePaymentDialog({
  expenseId,
  expenseTitle,
  remainingAmount,
}: {
  expenseId: string;
  expenseTitle: string;
  remainingAmount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(remainingAmount));
  const [paymentDate, setPaymentDate] = useState(getLocalDateInputValue());
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const response = await fetch(`/api/expenses/${expenseId}/payment`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Number(amount),
        paymentDate,
      }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error("Não foi possível registrar o pagamento.", {
        description: payload.error ?? "Tente novamente.",
      });
      setIsSubmitting(false);
      return;
    }

    toast.success("Pagamento registrado com sucesso.", {
      description: `"${expenseTitle}" recebeu ${formatCurrency(Number(amount))}.`,
    });
    setIsSubmitting(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label={`Registrar pagamento para ${expenseTitle}`}
            title="Registrar pagamento"
          />
        }
      >
        <BanknoteArrowUp className="size-4" />
        <span className="sr-only">Registrar pagamento</span>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pagamento parcial</DialogTitle>
          <DialogDescription>
            Lance uma parte já quitada de &quot;{expenseTitle}&quot;. Restam{" "}
            {formatCurrency(remainingAmount)} para fechar a despesa.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Valor pago agora</Label>
            <Input
              id="payment-amount"
              type="number"
              min="0.01"
              max={remainingAmount}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-date">Data do pagamento</Label>
            <Input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
              required
            />
          </div>
          <DialogFooter className="bg-transparent p-0 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
