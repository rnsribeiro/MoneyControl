"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNavigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/shared/brand-logo";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex xl:w-[248px]">
      <div className="mb-8 space-y-4 px-2">
        <Link
          href="/"
          className="flex min-h-24 items-center justify-center rounded-[28px] border border-white/10 bg-white/5 px-4 py-4"
        >
          <BrandLogo className="h-16 xl:h-[4.5rem]" />
        </Link>
        <p className="text-sm leading-6 text-sidebar-foreground/70">
          Um painel financeiro para transformar rotina em clareza.
        </p>
      </div>
      <nav className="space-y-2">
        {appNavigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20"
                  : "text-sidebar-foreground/78 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-3xl border border-sidebar-border bg-sidebar-accent/65 p-4">
        <p className="font-medium">Modo demonstração</p>
        <p className="mt-2 text-sm leading-6 text-sidebar-foreground/70">
          Configure o Supabase para ativar autenticação real e persistência.
        </p>
      </div>
    </aside>
  );
}

