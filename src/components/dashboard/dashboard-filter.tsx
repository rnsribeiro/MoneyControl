"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  DashboardFilter as DashboardFilterValue,
  DashboardMonthOption,
} from "@/lib/services/dashboard.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FILTER_OPTIONS: Array<{
  value: DashboardFilterValue["mode"];
  label: string;
}> = [
  { value: "all", label: "Tudo" },
  { value: "current-year", label: "Ano atual" },
  { value: "current-month", label: "Mês atual" },
  { value: "specific-month", label: "Mês específico" },
];

export function DashboardFilter({
  filter,
  monthOptions,
}: {
  filter: DashboardFilterValue;
  monthOptions: DashboardMonthOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(nextFilter: DashboardFilterValue) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextFilter.mode === "all") {
      params.delete("filter");
      params.delete("month");
    } else {
      params.set("filter", nextFilter.mode);

      if (nextFilter.mode === "specific-month" && nextFilter.month) {
        params.set("month", nextFilter.month);
      } else {
        params.delete("month");
      }
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Card className="border-border/70 bg-white/85 shadow-sm shadow-slate-200/50">
      <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Filtro do dashboard</p>
          <p className="text-sm text-muted-foreground">
            O padrão é mostrar tudo, mas você pode focar no ano atual, no mês atual
            ou em um mês específico.
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={filter.mode === option.value ? "default" : "outline"}
                onClick={() =>
                  updateFilter({
                    mode: option.value,
                    month:
                      option.value === "specific-month"
                        ? filter.month ?? monthOptions[0]?.value
                        : undefined,
                  })
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
          {filter.mode === "specific-month" ? (
            <div className="flex w-full flex-col gap-2 sm:w-[220px]">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Mês selecionado
              </span>
              <Select
                value={filter.month ?? monthOptions[0]?.value}
                onValueChange={(month) =>
                  updateFilter({
                    mode: "specific-month",
                    month: month ?? monthOptions[0]?.value,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
