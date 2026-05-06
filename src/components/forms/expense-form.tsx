"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CategoryOption } from "@/lib/services/categories.service";
import { MC_TABLES } from "@/lib/supabase/tables";
import {
  expenseSchema,
  type ExpenseFormInput,
  type ExpenseFormValues,
} from "@/lib/validations/expense.schema";
import type { MoneyControlExpenseInsert } from "@/types/database";
import { CategoryRequiredState } from "@/components/shared/category-required-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ExpenseForm({
  categoryOptions,
  initialValues,
}: {
  categoryOptions: CategoryOption[];
  initialValues?: {
    id: string;
    title: string;
    amount: number;
    category: string;
    dueDate: string;
    paymentMethod: string;
    status: "paid" | "pending";
    notes?: string;
  };
}) {
  const resolvedCategoryOptions = categoryOptions;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      amount: initialValues?.amount ?? 0,
      category: initialValues?.category ?? resolvedCategoryOptions[0]?.value ?? "",
      dueDate: initialValues?.dueDate ?? new Date().toISOString().slice(0, 10),
      paymentMethod: initialValues?.paymentMethod ?? "",
      status: initialValues?.status ?? "pending",
      notes: initialValues?.notes ?? "",
    },
  });

  if (!resolvedCategoryOptions.length) {
    return <CategoryRequiredState kindLabel="despesas" />;
  }

  async function onSubmit(values: ExpenseFormValues) {
    setIsSubmitting(true);
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      toast.error("Supabase nao configurado.");
      setIsSubmitting(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Sessao nao encontrada.", {
        description: "Faca login para salvar suas despesas.",
      });
      setIsSubmitting(false);
      return;
    }

    const payload: MoneyControlExpenseInsert = {
      user_id: user.id,
      title: values.title,
      amount: values.amount,
      category_name: values.category,
      payment_method: values.paymentMethod,
      status: values.status,
      expense_date: values.dueDate,
      due_date: values.dueDate,
      paid_at: values.status === "paid" ? values.dueDate : undefined,
      notes: values.notes,
    };

    const { error } = initialValues?.id
      ? await supabase.from(MC_TABLES.expenses).update(payload).eq("id", initialValues.id)
      : await supabase.from(MC_TABLES.expenses).insert(payload);

    if (error) {
      toast.error("Nao foi possivel salvar a despesa.", {
        description: error.message,
      });
      setIsSubmitting(false);
      return;
    }

    toast.success(
      initialValues?.id ? "Despesa atualizada com sucesso." : "Despesa salva com sucesso.",
      {
        description: initialValues?.id
          ? `"${values.title}" foi atualizada no MoneyControl.`
          : `"${values.title}" foi adicionada ao MoneyControl.`,
      },
    );
    setIsSubmitting(false);
    form.reset({
      title: initialValues?.title ?? "",
      amount: initialValues?.amount ?? 0,
      category: initialValues?.category ?? resolvedCategoryOptions[0]?.value ?? "",
      dueDate: initialValues?.dueDate ?? new Date().toISOString().slice(0, 10),
      paymentMethod: initialValues?.paymentMethod ?? "",
      status: initialValues?.status ?? "pending",
      notes: initialValues?.notes ?? "",
    });
    router.push("/despesas");
    router.refresh();
  }

  return (
    <Card className="border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Nova despesa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field>
              <Label htmlFor="title">Descricao</Label>
              <Input id="title" placeholder="Ex.: Mercado da semana" {...form.register("title")} />
              <FieldError message={form.formState.errors.title?.message} />
            </Field>
            <Field>
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                {...form.register("amount", { valueAsNumber: true })}
              />
              <FieldError message={form.formState.errors.amount?.message} />
            </Field>
            <Field>
              <Label>Categoria</Label>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {resolvedCategoryOptions.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={form.formState.errors.category?.message} />
            </Field>
            <Field>
              <Label htmlFor="paymentMethod">Pagamento</Label>
              <Input id="paymentMethod" placeholder="Pix, debito, boleto..." {...form.register("paymentMethod")} />
              <FieldError message={form.formState.errors.paymentMethod?.message} />
            </Field>
            <Field className="md:col-span-2">
              <Label htmlFor="dueDate">Data de vencimento</Label>
              <Input id="dueDate" type="date" {...form.register("dueDate")} />
              <FieldError message={form.formState.errors.dueDate?.message} />
            </Field>
            <Field className="md:col-span-2">
              <Label>Status inicial</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={form.formState.errors.status?.message} />
            </Field>
            <Field className="md:col-span-2">
              <Label htmlFor="notes">Observacoes</Label>
              <Textarea
                id="notes"
                placeholder="Contexto adicional, recorrencia, meta ou lembrete."
                {...form.register("notes")}
              />
              <FieldError message={form.formState.errors.notes?.message} />
            </Field>
          </div>
          <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : initialValues?.id
                  ? "Salvar alteracoes"
                  : "Salvar despesa"}
            </Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Limpar campos
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={className ? `space-y-2 ${className}` : "space-y-2"}>{children}</div>;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}
