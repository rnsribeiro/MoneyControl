"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { categoryKinds } from "@/constants/categories";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MC_TABLES } from "@/lib/supabase/tables";
import { slugify } from "@/lib/utils/slug";
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

const categorySchema = z.object({
  name: z.string().min(2, "Informe o nome da categoria."),
  kind: z.enum(["expense", "income", "investment"]),
  color: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoryForm({
  initialValues,
}: {
  initialValues?: {
    id?: string;
    name: string;
    kind: "expense" | "income" | "investment";
    color?: string;
  };
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      kind: initialValues?.kind ?? "expense",
      color: initialValues?.color ?? "#0f766e",
    },
  });

  async function onSubmit(values: CategoryFormValues) {
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
      toast.error("Sessao nao encontrada.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: values.name,
      slug: slugify(values.name),
      kind: values.kind,
      color: values.color,
    };

    const { error } = initialValues?.id
      ? await supabase
          .from(MC_TABLES.categories)
          .update(payload)
          .eq("id", initialValues.id)
          .eq("user_id", user.id)
      : await supabase.from(MC_TABLES.categories).insert({
          user_id: user.id,
          ...payload,
        });

    if (error) {
      toast.error("Nao foi possivel salvar a categoria.", {
        description: error.message,
      });
      setIsSubmitting(false);
      return;
    }

    toast.success(
      initialValues?.id
        ? "Categoria atualizada com sucesso."
        : "Categoria salva com sucesso.",
    );
    router.push("/categorias");
    router.refresh();
    setIsSubmitting(false);
  }

  return (
    <Card className="border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          {initialValues?.id ? "Editar categoria" : "Nova categoria"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Ex.: Assinaturas" {...form.register("name")} />
              <FieldError message={form.formState.errors.name?.message} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Controller
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryKinds.map((kind) => (
                        <SelectItem key={kind.value} value={kind.value}>
                          {kind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Input id="color" type="color" {...form.register("color")} />
            </div>
          </div>
          <div className="flex gap-3 border-t border-border/70 pt-5">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : initialValues?.id
                  ? "Salvar alteracoes"
                  : "Salvar categoria"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}
