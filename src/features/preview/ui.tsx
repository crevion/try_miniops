import type { ReactNode } from "react";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Marks a screen that runs on sample data until the backend supports it. */
export function SampleDataBadge() {
  return (
    <span
      title="This screen shows sample data until the backend supports it"
      className="inline-flex h-6 items-center gap-1.5 rounded-full bg-warning-soft px-2.5 text-xs font-medium text-warning"
    >
      <FlaskConical className="size-3.5" />
      Sample data
    </span>
  );
}

export function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "pos" | "neg" | "warn";
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-2xl border bg-card px-5 py-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-display text-[28px] font-semibold leading-tight tabular-nums",
          tone === "pos" && "text-positive",
          tone === "neg" && "text-destructive",
          tone === "warn" && "text-warning",
        )}
      >
        {value}
      </span>
      {hint && <span className="text-[13px] text-subtle-foreground">{hint}</span>}
    </div>
  );
}

export function Chip({
  tone = "neutral",
  children,
}: {
  tone?: "ok" | "warn" | "bad" | "info" | "neutral";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12.5px] font-medium",
        tone === "ok" && "bg-positive-soft text-positive",
        tone === "warn" && "bg-warning-soft text-warning",
        tone === "bad" && "bg-danger-soft text-destructive",
        tone === "info" && "bg-info-soft text-info",
        tone === "neutral" && "bg-secondary text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="inline-flex rounded-[10px] bg-muted p-[3px]">
      {options.map(([k, label]) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          aria-pressed={value === k}
          className={cn(
            "h-8 rounded-lg px-3 text-sm",
            value === k
              ? "bg-card font-semibold text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
