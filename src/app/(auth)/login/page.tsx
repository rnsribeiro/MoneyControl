import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { BrandLogo } from "@/components/shared/brand-logo";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(12,148,136,0.15),_transparent_28%),linear-gradient(180deg,_#f5fbfa_0%,_#eef4ff_100%)] px-6 py-12">
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-5">
          <Link href="/" className="inline-flex">
            <BrandLogo className="h-20" priority />
          </Link>
          <h1 className="font-heading text-5xl font-bold tracking-tight text-balance">
            Seu dinheiro com mais visibilidade, ritmo e contexto.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            Uma base moderna com Next.js, Tailwind, shadcn/ui e Supabase pronta para
            evoluir de landing page para um produto financeiro completo.
          </p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <AuthForm mode="login" />
        </div>
      </div>
    </main>
  );
}
