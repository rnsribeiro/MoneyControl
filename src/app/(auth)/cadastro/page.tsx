import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { BrandLogo } from "@/components/shared/brand-logo";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(180deg,_#f6fbff_0%,_#f8fafc_100%)] px-6 py-12">
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <div className="space-y-5">
          <Link href="/" className="inline-flex">
            <BrandLogo className="h-20" priority />
          </Link>
          <h1 className="font-heading text-5xl font-bold tracking-tight text-balance">
            Comece seu painel financeiro com uma estrutura pronta para crescer.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            Cadastro, lancamentos, dashboards e investimentos ja organizados para um
            MVP de financas pessoais com base segura.
          </p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <AuthForm mode="register" />
        </div>
      </div>
    </main>
  );
}
