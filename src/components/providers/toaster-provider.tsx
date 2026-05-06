"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast: "font-sans",
          title: "font-medium",
          description: "text-sm",
        },
      }}
    />
  );
}
