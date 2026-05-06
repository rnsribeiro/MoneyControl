import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  variant?: "full" | "mark";
}

export function BrandLogo({
  className,
  imageClassName,
  priority = false,
  variant = "full",
}: BrandLogoProps) {
  const isMark = variant === "mark";
  const dimensions = isMark
    ? { width: 504, height: 361 }
    : { width: 973, height: 531 };

  return (
    <Image
      src={isMark ? "/moneycontrol-mark.png" : "/moneycontrol-logo.png"}
      alt="Logo do MoneyControl"
      width={dimensions.width}
      height={dimensions.height}
      priority={priority}
      className={cn(
        "w-auto object-contain",
        isMark ? "h-12" : "h-16",
        className,
        imageClassName,
      )}
    />
  );
}
