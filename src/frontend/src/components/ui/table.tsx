import type React from "react";
import { cn } from "@/lib/utils";

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;
type SectionProps = React.HTMLAttributes<HTMLTableSectionElement>;
type RowProps = React.HTMLAttributes<HTMLTableRowElement>;
type CellProps = React.TdHTMLAttributes<HTMLTableCellElement>;
type HeaderCellProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHead({ className, ...props }: SectionProps) {
  return <thead className={cn("bg-slate-50", className)} {...props} />;
}

export function TableBody({ className, ...props }: SectionProps) {
  return <tbody className={cn("bg-white", className)} {...props} />;
}

export function TableRow({ className, ...props }: RowProps) {
  return (
    <tr
      className={cn("border-b border-slate-100 hover:bg-slate-50", className)}
      {...props}
    />
  );
}

export function TableHeaderCell({ className, ...props }: HeaderCellProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left font-semibold text-slate-600",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: CellProps) {
  return (
    <td className={cn("px-4 py-3 text-slate-700", className)} {...props} />
  );
}
