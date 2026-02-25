import type React from "react";
import { cn } from "@/lib/utils";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps) {
  return (
    <div className={cn("border-b border-slate-100 px-6 py-4", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: DivProps) {
  return (
    <div className={cn("text-lg font-semibold text-slate-900", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}
