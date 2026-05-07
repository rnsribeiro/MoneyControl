"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverPortal({ ...props }: PopoverPrimitive.Portal.Props) {
  return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />
}

function PopoverPositioner({ ...props }: PopoverPrimitive.Positioner.Props) {
  return <PopoverPrimitive.Positioner data-slot="popover-positioner" {...props} />
}

function PopoverContent({
  className,
  sideOffset = 8,
  ...props
}: PopoverPrimitive.Popup.Props & {
  sideOffset?: number
}) {
  return (
    <PopoverPortal>
      <PopoverPositioner sideOffset={sideOffset}>
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "z-50 w-72 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-none data-[ending-style]:animate-out data-[starting-style]:animate-in data-[ending-style]:fade-out-0 data-[starting-style]:fade-in-0",
            className
          )}
          {...props}
        />
      </PopoverPositioner>
    </PopoverPortal>
  )
}

export { Popover, PopoverContent, PopoverPortal, PopoverPositioner, PopoverTrigger }
