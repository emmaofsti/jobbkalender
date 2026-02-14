import * as React from "react";
import { cn } from "@/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-accent placeholder:text-muted",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
