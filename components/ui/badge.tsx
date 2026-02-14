import * as React from "react";
import { cn } from "@/utils/cn";

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "muted" | "success" | "warning" | "danger" | "accent";
};

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-text/10 text-text",
  muted: "bg-muted/15 text-muted",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  accent: "bg-accent/15 text-accent"
};

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => (
  <div
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
      variants[variant],
      className
    )}
    {...props}
  />
);
