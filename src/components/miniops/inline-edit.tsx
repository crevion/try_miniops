import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUpRight, Check, Pencil, Search } from "lucide-react";
import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/*
 * Edit in place, taken from the redesign: change a field where it is shown
 * instead of opening a form. Pickers (status, priority, person, date) open on
 * one click; names change with a double-click. Every change can be undone
 * from the toast that confirms it.
 */

const errorText = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong.");

/** Saves a change and offers Undo, which saves the old value back. */
export function saveWithUndo(
  message: string,
  apply: () => Promise<unknown>,
  undo: () => Promise<unknown>,
) {
  apply().then(
    () =>
      toast(message, {
        action: {
          label: "Undo",
          onClick: () =>
            undo().then(
              () => toast("Change undone"),
              (e) => toast.error(errorText(e)),
            ),
        },
      }),
    (e) => toast.error(errorText(e)),
  );
}

/** The look of something you can edit in place: a soft dashed box on hover. */
const editable =
  "relative -mx-1.5 rounded-lg px-1.5 py-0.5 text-left outline-1 outline-offset-0 outline-dashed outline-transparent transition-colors hover:bg-secondary hover:outline-input focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring data-[state=open]:bg-secondary data-[state=open]:outline-solid data-[state=open]:outline-primary";

export type PickOption<V extends string> = {
  value: V;
  label: string;
  /** Shown in place of the label, e.g. a status pill. */
  render?: ReactNode;
  hint?: string;
  section?: string;
};

/** A value that changes with one click: opens a short list right where it is. */
export function InlinePick<V extends string>({
  value,
  options,
  onPick,
  children,
  label,
  disabled,
  search,
  className,
  align = "start",
}: {
  value: V;
  options: PickOption<V>[];
  onPick: (value: V) => void;
  children: ReactNode;
  /** What is being changed, for screen readers: "Status", "Assignee". */
  label: string;
  disabled?: boolean;
  /** Adds a filter box, for long lists like people. */
  search?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!open) setQ("");
    setActive(0);
  }, [open]);
  if (disabled) return <span className={className}>{children}</span>;
  const shown = options.filter((o) => o.label.toLowerCase().includes(q.trim().toLowerCase()));
  const pick = (v: V) => {
    setOpen(false);
    if (v !== value) onPick(v);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + shown.length) % shown.length);
    } else if (e.key === "Enter" && shown[active]) {
      e.preventDefault();
      pick(shown[active].value);
    }
  };
  let lastSection: string | undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(editable, "inline-flex max-w-full items-center", className)}
        aria-label={`${label}: change`}
        title={`Click to change ${label.toLowerCase()}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-60 rounded-xl p-1.5"
        onKeyDown={onKey}
        onClick={(e) => e.stopPropagation()}
      >
        {search && (
          <div className="mb-1 flex items-center gap-2 border-b px-2 pb-1.5">
            <Search className="size-3.5 text-subtle-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              placeholder={`Find ${label.toLowerCase()}…`}
              className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-subtle-foreground"
            />
          </div>
        )}
        <div role="listbox" aria-label={label} className="max-h-72 overflow-y-auto">
          {shown.map((o, i) => {
            const head = o.section && o.section !== lastSection ? o.section : null;
            lastSection = o.section;
            return (
              <div key={o.value}>
                {head && (
                  <p className="px-2.5 pb-1 pt-2 text-xs font-semibold text-subtle-foreground">
                    {head}
                  </p>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  autoFocus={!search && o.value === value}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(o.value)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm outline-none",
                    i === active && "bg-secondary",
                    o.value === value && "font-semibold text-primary",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{o.render ?? o.label}</span>
                  {o.hint && (
                    <span className="shrink-0 text-xs font-normal text-subtle-foreground">
                      {o.hint}
                    </span>
                  )}
                  {o.value === value && <Check className="size-3.5 shrink-0" />}
                </button>
              </div>
            );
          })}
          {!shown.length && (
            <p className="px-2.5 py-2 text-sm text-muted-foreground">Nothing matches.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const shortDay = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short" });
const shortDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

function quickDates() {
  const add = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
  };
  const friday = add((5 - new Date().getDay() + 7) % 7 || 7);
  const monday = add((1 - new Date().getDay() + 7) % 7 || 7);
  return [
    ["Today", add(0)],
    ["Tomorrow", add(1)],
    [new Date().getDay() === 5 ? "Next Friday" : "This Friday", friday],
    ["Next Monday", monday],
    ["In 2 weeks", add(14)],
  ] as const;
}

/** A date that changes with one click: quick picks, a calendar, or no date. */
export function InlineDate({
  value,
  onPick,
  children,
  label = "Due date",
  disabled,
  clearable = true,
  className,
}: {
  value: string | null;
  onPick: (value: string | null) => void;
  children: ReactNode;
  label?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (disabled) return <span className={className}>{children}</span>;
  const pick = (v: string | null) => {
    setOpen(false);
    if (v !== value) onPick(v);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(editable, "inline-flex items-center whitespace-nowrap", className)}
        aria-label={`${label}: change`}
        title={`Click to change ${label.toLowerCase()}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-60 rounded-xl p-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="px-2.5 pb-1 pt-1.5 text-xs font-semibold text-subtle-foreground">
          Quick dates
        </p>
        {quickDates().map(([name, d]) => (
          <button
            key={name}
            type="button"
            onClick={() => pick(iso(d))}
            className={cn(
              "flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none",
              iso(d) === value && "font-semibold text-primary",
            )}
          >
            {name}
            <span className="ml-auto text-xs font-normal text-subtle-foreground">
              {shortDay(d)}, {shortDate(d)}
            </span>
          </button>
        ))}
        <p className="px-2.5 pb-1 pt-2 text-xs font-semibold text-subtle-foreground">Pick a date</p>
        <div className="px-2 pb-1.5">
          <input
            type="date"
            defaultValue={value ?? ""}
            onChange={(e) => e.target.value && pick(e.target.value)}
            className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
            aria-label={label}
          />
        </div>
        {clearable && value && (
          <button
            type="button"
            onClick={() => pick(null)}
            className="w-full rounded-lg border-t px-2.5 py-1.5 text-left text-sm text-muted-foreground hover:bg-secondary"
          >
            Remove date
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Text that turns into a box on double-click (or F2, or the pencil on touch).
 * Enter saves, Esc cancels. Opening the item is a separate, always-there
 * button (`open`), so a double-click never lands you on another page.
 */
export function InlineText({
  value,
  onSave,
  children,
  label = "Name",
  disabled,
  open,
  className,
  inputClassName,
}: {
  value: string;
  onSave: (value: string) => void;
  children: ReactNode;
  label?: string;
  disabled?: boolean;
  /** A link that opens the item, shown as an "Open" button beside the name. */
  open?: ReactNode;
  className?: string;
  inputClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const done = useRef(false);
  const start = () => {
    window.getSelection()?.removeAllRanges();
    done.current = false;
    setEditing(true);
  };
  const finish = (save: boolean, text: string) => {
    if (done.current) return;
    done.current = true;
    setEditing(false);
    const v = text.trim();
    if (save && v && v !== value) onSave(v);
  };
  if (editing)
    return (
      <input
        autoFocus
        defaultValue={value}
        aria-label={label}
        onFocus={(e) => e.target.select()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") finish(true, e.currentTarget.value);
          if (e.key === "Escape") finish(false, "");
        }}
        onBlur={(e) => finish(true, e.target.value)}
        className={cn(
          "-mx-1.5 h-8 w-full min-w-[12rem] rounded-lg border border-primary bg-card px-1.5 text-sm font-medium shadow-[0_0_0_3px_var(--primary-soft)] outline-none",
          inputClassName,
        )}
      />
    );
  if (disabled)
    return (
      <span className={cn("inline-flex max-w-full items-center gap-2", className)}>
        <span className="min-w-0">{children}</span>
        {open}
      </span>
    );
  return (
    <span className={cn("group/name inline-flex max-w-full items-center gap-1.5", className)}>
      <span
        role="button"
        tabIndex={0}
        aria-label={`${label}: ${value}. Double-click or press Enter to rename`}
        title="Double-click to rename"
        className={cn(editable, "min-w-0 cursor-text select-none")}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          start();
        }}
        onKeyDown={(e) => {
          if (e.key === "F2" || e.key === "Enter") {
            e.preventDefault();
            start();
          }
        }}
      >
        {children}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          start();
        }}
        aria-label={`Rename ${value}`}
        className="grid size-6 shrink-0 place-items-center rounded-md text-subtle-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground focus-visible:opacity-100 group-hover/name:opacity-100 pointer-coarse:opacity-100"
      >
        <Pencil className="size-3.5" />
      </button>
      {open}
    </span>
  );
}

/** The "Open" button beside an editable name: the one way into the item's page. */
export function OpenLink({ iconOnly, ...props }: LinkComponentProps & { iconOnly?: boolean }) {
  return (
    <Link
      {...props}
      onClick={(e) => e.stopPropagation()}
      title="Open"
      className="ml-auto inline-flex h-6 shrink-0 items-center gap-0.5 rounded-md px-1.5 text-xs font-medium text-subtle-foreground transition-colors hover:bg-primary-soft hover:text-primary group-hover/name:text-primary"
    >
      {!iconOnly && "Open"}
      <ArrowUpRight className="size-3.5" />
    </Link>
  );
}
