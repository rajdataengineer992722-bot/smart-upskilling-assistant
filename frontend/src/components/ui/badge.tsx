import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
