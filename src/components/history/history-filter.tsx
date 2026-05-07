"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Search, SlidersHorizontal } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { HistoryFilters } from "@/lib/services/history.service";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPE_OPTIONS: Array<{
  value: HistoryFilters["type"];
  label: string;
}> = [
  { value: "all", label: "Todos os lançamentos" },
  { value: "income", label: "Somente entradas" },
  { value: "expense", label: "Somente saídas" },
  { value: "investment", label: "Somente investimentos" },
];

export function HistoryFilter({ filters }: { filters: HistoryFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [type, setType] = useState<HistoryFilters["type"]>(filters.type);
  const [term, setTerm] = useState(filters.term);
  const [isRangeDialogOpen, setIsRangeDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
    from: parseDateValue(filters.startDate),
    to: parseDateValue(filters.endDate),
  }));

  const startDate = dateRange?.from ? formatDateValue(dateRange.from) : "";
  const endDate = dateRange?.to ? formatDateValue(dateRange.to) : "";

  const rangeLabel = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "dd MMM, yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd MMM, yyyy", { locale: ptBR })}`;
    }

    if (dateRange?.from) {
      return format(dateRange.from, "dd MMM, yyyy", { locale: ptBR });
    }

    return "Selecionar período";
  }, [dateRange]);

  function updateParams() {
    const params = new URLSearchParams(searchParams.toString());
    const trimmedTerm = term.trim();

    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }

    if (trimmedTerm) {
      params.set("term", trimmedTerm);
    } else {
      params.delete("term");
    }

    if (startDate) {
      params.set("startDate", startDate);
    } else {
      params.delete("startDate");
    }

    if (endDate) {
      params.set("endDate", endDate);
    } else {
      params.delete("endDate");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function clearFilters() {
    setType("all");
    setTerm("");
    setDateRange(undefined);
    router.push(pathname);
  }

  function selectToday() {
    const today = new Date();
    setDateRange({ from: today, to: today });
  }

  return (
    <Card className="border-border/70 bg-white/90 shadow-sm shadow-slate-200/50">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <SlidersHorizontal className="size-4" />
              Filtro completo do histórico
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Filtre por tipo de lançamento, intervalo de datas e termo para localizar
              rapidamente qualquer entrada, saída ou investimento.
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>

        <form
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.1fr_1.5fr_1.55fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            updateParams();
          }}
        >
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tipo
            </label>
            <Select value={type} onValueChange={(value) => setType(value as HistoryFilters["type"])}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Buscar por termo
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Descrição, categoria, status ou observação"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2 xl:col-span-1">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Período
            </label>
            <Dialog open={isRangeDialogOpen} onOpenChange={setIsRangeDialogOpen}>
              <DialogTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-start px-3 font-normal"
                  />
                }
              >
                <CalendarIcon className="size-4" />
                <span className="truncate">{rangeLabel}</span>
              </DialogTrigger>
              <DialogContent
                showCloseButton={false}
                className="w-fit max-w-[min(94vw,44rem)] border-border/70 bg-card p-0 sm:max-w-[44rem]"
              >
                <DialogHeader className="border-b border-border/70 px-5 py-5">
                  <DialogTitle>Selecionar período</DialogTitle>
                  <DialogDescription>
                    Escolha um intervalo único para consultar o histórico sem sair da tela.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center px-5 py-4">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="mx-auto w-fit rounded-xl"
                  />
                </div>
                <DialogFooter className="border-t border-border/70 bg-muted/35">
                  <Button type="button" variant="ghost" size="sm" onClick={selectToday}>
                    Hoje
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateRange(undefined)}
                  >
                    Limpar período
                  </Button>
                  <DialogClose render={<Button size="sm" />}>Concluir</DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-end">
            <Button type="submit" className="w-full xl:w-auto">
              Aplicar filtros
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function parseDateValue(value?: string) {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00`);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
