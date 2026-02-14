import * as React from "react";
import { cn } from "@/utils/cn";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-accent placeholder:text-muted",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
