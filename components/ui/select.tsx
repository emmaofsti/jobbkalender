import * as React from "react";
import { cn } from "@/utils/cn";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-text shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-accent",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = "Select";
