"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  signInSchema,
  signUpSchema,
  type AuthFormValues,
} from "@/lib/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(mode === "login" ? signInSchema : signUpSchema),
    defaultValues: {
      name: undefined,
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: AuthFormValues) {
    setIsSubmitting(true);
    setServerMessage(null);

    if (mode === "login") {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok) {
        const message = payload.error ?? "Nao foi possivel entrar.";
        setServerMessage(message);
        toast.error("Nao foi possivel entrar.", {
          description: message,
        });
        setIsSubmitting(false);
        return;
      }

      toast.success("Login realizado com sucesso.");
      router.push("/dashboard");
      router.refresh();
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      autoConfirmed?: boolean;
      requiresEmailConfirmation?: boolean;
      error?: string;
    };

    if (!response.ok) {
      const message = payload.error ?? "Nao foi possivel criar a conta.";
      setServerMessage(message);
      toast.error("Nao foi possivel criar a conta.", {
        description: message,
      });
      setIsSubmitting(false);
      return;
    }

    if (payload.autoConfirmed) {
      toast.success("Conta criada e sessao iniciada.");
      router.push("/dashboard");
      router.refresh();
      setIsSubmitting(false);
      return;
    }

    if (payload.requiresEmailConfirmation) {
      setServerMessage(
        "Seu projeto Supabase ainda exige confirmacao por e-mail. Se o e-mail nao chegar, revise as configuracoes de Auth do projeto.",
      );
    }

    toast.success("Conta criada com sucesso.", {
      description:
        "Se a confirmacao por e-mail estiver ativa no Supabase, verifique a caixa de entrada e o spam.",
    });
    setIsSubmitting(false);
  }

  return (
    <Card className="w-full max-w-md border-white/70 bg-white/92 shadow-2xl shadow-slate-200/60 backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="font-heading text-3xl font-semibold">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          {mode === "login"
            ? "Acesse sua area financeira e acompanhe seu painel em tempo real."
            : "Comece com uma base pronta para autenticar usuarios via Supabase."}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {mode === "register" ? (
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Seu nome" {...form.register("name")} />
              <FieldError message={form.formState.errors.name?.message} />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="voce@email.com" {...form.register("email")} />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="******" {...form.register("password")} />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? "Validando..."
              : mode === "login"
                ? "Entrar na plataforma"
                : "Criar conta no MoneyControl"}
          </Button>
          {serverMessage ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {serverMessage}
            </p>
          ) : null}
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "Ainda nao tem conta?" : "Ja possui uma conta?"}{" "}
            <Link
              href={mode === "login" ? "/cadastro" : "/login"}
              className="font-medium text-primary hover:text-primary/80"
            >
              {mode === "login" ? "Cadastre-se" : "Fazer login"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}
