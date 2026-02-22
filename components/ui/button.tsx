import * as React from "react";
import { cn } from "@/utils/cn";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "subtle";
  size?: "sm" | "md" | "lg" | "icon";
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-accent text-white shadow-soft hover:bg-accent/90",
  ghost: "bg-transparent text-text hover:bg-accent/10",
  outline: "border border-border bg-transparent text-text hover:bg-accent/10",
  subtle: "bg-accent/10 text-accent hover:bg-accent/20"
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10 text-sm"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
);

Button.displayName = "Button";
