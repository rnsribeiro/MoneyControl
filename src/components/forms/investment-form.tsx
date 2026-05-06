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
  investmentSchema,
  type InvestmentFormInput,
  type InvestmentFormValues,
} from "@/lib/validations/investment.schema";
import type { MoneyControlInvestmentInsert } from "@/types/database";
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

export function InvestmentForm({
  typeOptions,
  initialValues,
}: {
  typeOptions: CategoryOption[];
  initialValues?: {
    id: string;
    name: string;
    type: string;
    amount: number;
    broker: string;
    goal: string;
    date: string;
    notes?: string;
  };
}) {
  const resolvedTypeOptions = typeOptions;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<InvestmentFormInput, unknown, InvestmentFormValues>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      type: initialValues?.type ?? resolvedTypeOptions[0]?.value ?? "",
      amount: initialValues?.amount ?? 0,
      broker: initialValues?.broker ?? "",
      goal: initialValues?.goal ?? "",
      date: initialValues?.date ?? new Date().toISOString().slice(0, 10),
      notes: initialValues?.notes ?? "",
    },
  });

  if (!resolvedTypeOptions.length) {
    return <CategoryRequiredState kindLabel="investimentos" />;
  }

  async function onSubmit(values: InvestmentFormValues) {
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
        description: "Faca login para salvar seus investimentos.",
      });
      setIsSubmitting(false);
      return;
    }

    const payload: MoneyControlInvestmentInsert = {
      user_id: user.id,
      name: values.name,
      type: values.type,
      amount: values.amount,
      broker: values.broker,
      goal: values.goal,
      investment_date: values.date,
      notes: values.notes,
    };

    const { error } = initialValues?.id
      ? await supabase
          .from(MC_TABLES.investments)
          .update(payload)
          .eq("id", initialValues.id)
      : await supabase.from(MC_TABLES.investments).insert(payload);

    if (error) {
      toast.error("Nao foi possivel salvar o aporte.", {
        description: error.message,
      });
      setIsSubmitting(false);
      return;
    }

    toast.success(
      initialValues?.id
        ? "Investimento atualizado com sucesso."
        : "Aporte salvo com sucesso.",
      {
        description: initialValues?.id
          ? `"${values.name}" foi atualizado na carteira.`
          : `"${values.name}" foi adicionado a carteira.`,
      },
    );
    setIsSubmitting(false);
    form.reset({
      name: initialValues?.name ?? "",
      type: initialValues?.type ?? resolvedTypeOptions[0]?.value ?? "",
      amount: initialValues?.amount ?? 0,
      broker: initialValues?.broker ?? "",
      goal: initialValues?.goal ?? "",
      date: initialValues?.date ?? new Date().toISOString().slice(0, 10),
      notes: initialValues?.notes ?? "",
    });
    router.push("/investimentos");
    router.refresh();
  }

  return (
    <Card className="border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Novo investimento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field>
              <Label htmlFor="name">Ativo / aporte</Label>
              <Input id="name" placeholder="Ex.: Tesouro Selic 2029" {...form.register("name")} />
              <FieldError message={form.formState.errors.name?.message} />
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
              <Label>Tipo</Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {resolvedTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={form.formState.errors.type?.message} />
            </Field>
            <Field>
              <Label htmlFor="broker">Corretora</Label>
              <Input id="broker" placeholder="Ex.: XP, NuInvest..." {...form.register("broker")} />
              <FieldError message={form.formState.errors.broker?.message} />
            </Field>
            <Field>
              <Label htmlFor="goal">Objetivo</Label>
              <Input id="goal" placeholder="Ex.: reserva, aposentadoria..." {...form.register("goal")} />
              <FieldError message={form.formState.errors.goal?.message} />
            </Field>
            <Field>
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...form.register("date")} />
              <FieldError message={form.formState.errors.date?.message} />
            </Field>
            <Field className="md:col-span-2">
              <Label htmlFor="notes">Observacoes</Label>
              <Textarea
                id="notes"
                placeholder="Observacoes sobre o aporte, estrategia ou regra de recorrencia."
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
                  : "Salvar investimento"}
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
