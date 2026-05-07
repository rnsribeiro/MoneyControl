"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ptBR}
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row sm:gap-6",
        month: "space-y-4",
        month_caption: "relative flex items-center justify-center pt-1",
        caption_label: "text-base font-semibold text-foreground",
        nav: "absolute inset-x-0 top-1 z-10 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "size-8 rounded-xl text-muted-foreground hover:text-foreground"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "size-8 rounded-xl text-muted-foreground hover:text-foreground"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 rounded-md text-[0.8rem] font-medium text-muted-foreground",
        week: "mt-2 flex w-full",
        day: "relative size-9 p-0 text-center text-sm [&:first-child[data-selected=true]]:rounded-l-xl [&:last-child[data-selected=true]]:rounded-r-xl",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "size-9 rounded-xl p-0 font-normal aria-selected:opacity-100"
        ),
        today: "text-foreground",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        range_start:
          "rounded-l-xl bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        range_end:
          "rounded-r-xl bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        range_middle:
          "rounded-none bg-primary/18 text-foreground hover:bg-primary/20",
        outside: "text-muted-foreground/40 aria-selected:text-primary-foreground/60",
        disabled: "text-muted-foreground/40 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", className)} {...chevronProps} />
          ) : (
            <ChevronRight className={cn("size-4", className)} {...chevronProps} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
