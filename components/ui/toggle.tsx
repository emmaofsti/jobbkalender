import * as React from "react";
import { cn } from "@/utils/cn";

export type ToggleProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed: boolean;
};

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-full border border-border bg-white transition",
        pressed && "bg-accent/20",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 translate-x-1 rounded-full bg-text/70 shadow-sm transition",
          pressed && "translate-x-6 bg-accent"
        )}
      />
    </button>
  )
);

Toggle.displayName = "Toggle";
