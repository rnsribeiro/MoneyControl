"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MC_TABLES } from "@/lib/supabase/tables";
import {
  goalSchema,
  type GoalFormInput,
  type GoalFormValues,
} from "@/lib/validations/goal.schema";
import type { MoneyControlGoalInsert } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function GoalForm({
  initialValues,
}: {
  initialValues?: {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string;
    notes?: string;
  };
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<GoalFormInput, unknown, GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      targetAmount: initialValues?.targetAmount ?? 0,
      currentAmount: initialValues?.currentAmount ?? 0,
      targetDate: initialValues?.targetDate ?? "",
      notes: initialValues?.notes ?? "",
    },
  });

  async function onSubmit(values: GoalFormValues) {
    setIsSubmitting(true);
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      toast.error("Supabase não configurado.");
      setIsSubmitting(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Sessão não encontrada.", {
        description: "Faça login para salvar suas metas.",
      });
      setIsSubmitting(false);
      return;
    }

    const payload: MoneyControlGoalInsert = {
      user_id: user.id,
      title: values.title,
      target_amount: values.targetAmount,
      current_amount: values.currentAmount,
      target_date: values.targetDate || undefined,
      notes: values.notes,
    };

    const { error } = initialValues?.id
      ? await supabase.from(MC_TABLES.goals).update(payload).eq("id", initialValues.id)
      : await supabase.from(MC_TABLES.goals).insert(payload);

    if (error) {
      toast.error("Não foi possível salvar a meta.", {
        description: error.message,
      });
      setIsSubmitting(false);
      return;
    }

    toast.success(initialValues?.id ? "Meta atualizada com sucesso." : "Meta criada com sucesso.");
    setIsSubmitting(false);
    router.push("/metas");
    router.refresh();
  }

  return (
    <Card className="border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          {initialValues?.id ? "Editar meta" : "Nova meta"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field className="md:col-span-2">
              <Label htmlFor="title">Nome da meta</Label>
              <Input
                id="title"
                placeholder="Ex.: Comprar um carro"
                {...form.register("title")}
              />
              <FieldError message={form.formState.errors.title?.message} />
            </Field>
            <Field>
              <Label htmlFor="targetAmount">Valor estimado</Label>
              <Input
                id="targetAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                {...form.register("targetAmount", { valueAsNumber: true })}
              />
              <FieldError message={form.formState.errors.targetAmount?.message} />
            </Field>
            <Field>
              <Label htmlFor="currentAmount">Valor já reservado</Label>
              <Input
                id="currentAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                {...form.register("currentAmount", { valueAsNumber: true })}
              />
              <FieldError message={form.formState.errors.currentAmount?.message} />
            </Field>
            <Field className="md:col-span-2">
              <Label htmlFor="targetDate">Data limite</Label>
              <Input id="targetDate" type="date" {...form.register("targetDate")} />
              <p className="text-xs leading-5 text-muted-foreground">
                Esse campo é opcional. Use quando quiser acompanhar também o prazo da meta.
              </p>
              <FieldError message={form.formState.errors.targetDate?.message} />
            </Field>
            <Field className="md:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Detalhes do objetivo, estratégia ou lembretes."
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
                  ? "Salvar alterações"
                  : "Salvar meta"}
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
