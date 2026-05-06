import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="flex items-start gap-3 px-5 py-4 text-sm text-destructive">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>{message}</p>
      </CardContent>
    </Card>
  );
}
