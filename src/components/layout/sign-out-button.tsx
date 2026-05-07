"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const response = await fetch("/api/auth/sign-out", {
      method: "POST",
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      error?: string;
    };

    if (!response.ok) {
      toast.error("Não foi possível sair.", {
        description: payload.error ?? "Erro ao encerrar a sessão.",
      });
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleSignOut}>
      <LogOut className="size-4" />
      Sair
    </Button>
  );
}

