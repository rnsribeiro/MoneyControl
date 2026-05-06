import Link from "next/link";
import { FolderSearch } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FolderSearch className="size-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">{title}</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {ctaLabel && ctaHref ? (
          <Link href={ctaHref} className={buttonVariants()}>
            {ctaLabel}
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
