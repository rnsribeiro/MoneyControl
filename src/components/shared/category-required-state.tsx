import Link from "next/link";
import { FolderPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CategoryRequiredState({
  kindLabel,
}: {
  kindLabel: string;
}) {
  return (
    <Card className="border-dashed border-border/80 bg-white/90 shadow-sm shadow-slate-200/50">
      <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FolderPlus className="size-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">
            Crie uma categoria antes de continuar
          </h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Para cadastrar {kindLabel}, o MoneyControl agora usa apenas categorias reais
            salvas no seu banco. Crie a primeira categoria para seguir.
          </p>
        </div>
        <Link href="/categorias/nova" className={buttonVariants()}>
          Criar categoria
        </Link>
      </CardContent>
    </Card>
  );
}
