import { useRef, useState } from "react";
import { Check, Link2, Repeat, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/miniops/core";
import { cn } from "@/lib/utils";
import { BANK_ACCOUNTS, SAMPLE_TRANSACTIONS, TX_CATEGORIES, money, type Transaction } from "./data";
import { SampleDataBadge } from "./ui";

const STEPS = ["Upload", "Read", "Review", "Done"];

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2.5">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-2.5">
          <span
            className={cn(
              "grid size-6 place-items-center rounded-full border text-xs font-semibold",
              i < current && "border-positive bg-positive text-white",
              i === current && "border-primary text-primary",
              i > current && "border-input text-subtle-foreground",
            )}
          >
            {i < current ? <Check className="size-3.5" /> : i + 1}
          </span>
          <span
            className={cn(
              "text-sm",
              i === current ? "font-semibold text-foreground" : "text-subtle-foreground",
            )}
          >
            {s}
          </span>
          {i < STEPS.length - 1 && <span className="h-px w-8 bg-border" />}
        </li>
      ))}
    </ol>
  );
}

export function BankPage() {
  const [rows, setRows] = useState<(Transaction & { ok: boolean })[]>(() =>
    SAMPLE_TRANSACTIONS.map((t) => ({ ...t, ok: t.confident })),
  );
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const ready = rows.filter((r) => r.ok).length;
  const update = (id: number, patch: Partial<Transaction & { ok: boolean }>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const pickFile = () => fileRef.current?.click();

  return (
    <>
      <PageHeader
        title="Bank & statements"
        description="Read-only. MiniOps can see transactions but can never move money."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <SampleDataBadge />
            <Button variant="outline" onClick={() => toast("Bank connection opens here")}>
              <Link2 /> Connect a bank
            </Button>
            <Button onClick={pickFile}>
              <Upload /> Upload statement
            </Button>
          </div>
        }
      />
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) toast(`${f.name} would be read here. This preview uses a sample statement.`);
          e.target.value = "";
        }}
      />
      <div className="mb-5 grid gap-5 md:grid-cols-3">
        {BANK_ACCOUNTS.map((a) => (
          <div key={a.name} className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <span
                className="grid size-10 shrink-0 place-items-center rounded-[10px] text-sm font-bold text-white"
                style={{ background: a.color }}
              >
                {a.initials}
              </span>
              <div className="min-w-0">
                <b className="block truncate font-semibold">{a.name}</b>
                <span className="text-[13px] text-subtle-foreground">
                  {a.number} ·{" "}
                  <span className={a.how === "Connected" ? "text-positive" : ""}>{a.how}</span>
                </span>
              </div>
            </div>
            <p
              className={cn(
                "mt-5 font-display text-[26px] font-semibold tabular-nums",
                a.balance < 0 && "text-destructive",
              )}
            >
              {money(a.balance)}
            </p>
            <p className="mt-1 text-[13px] text-subtle-foreground">{a.sync}</p>
          </div>
        ))}
      </div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) toast(`${f.name} would be read here. This preview uses a sample statement.`);
        }}
        className="mb-5 flex flex-wrap items-center gap-4 rounded-2xl border-2 border-dashed border-primary-light bg-primary-soft p-5"
      >
        <span className="grid size-12 place-items-center rounded-xl bg-card text-primary shadow-sm">
          <Upload className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <b className="font-semibold">Drop a bank statement here</b>
          <p className="text-sm text-muted-foreground">
            CSV or PDF from any bank, bKash or Payoneer. You'll check everything before it's saved.
          </p>
        </div>
        <Button variant="outline" onClick={pickFile}>
          Choose file
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex flex-wrap items-end justify-between gap-3 px-6 pb-4 pt-5">
          <div>
            <h2 className="mb-3 font-sans text-base font-semibold">
              Payoneer statement · Oct 1 – 31
            </h2>
            <Stepper current={done ? 3 : 2} />
          </div>
          <span className="text-[13px] text-subtle-foreground">
            {rows.length} transactions · {rows.filter((r) => !r.confident).length} need checking
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="text-left text-[13px] text-subtle-foreground">
              <tr className="border-y">
                <th className="w-12 py-3 pl-6" />
                <th className="py-3 font-medium">Date</th>
                <th className="py-3 font-medium">Description</th>
                <th className="py-3 font-medium">Category</th>
                <th className="py-3 font-medium">Project</th>
                <th className="py-3 pr-6 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr
                  key={t.id}
                  className={cn(
                    "border-b last:border-0",
                    !t.confident && !t.ok && "bg-warning-soft/50",
                  )}
                >
                  <td className="py-2.5 pl-6">
                    <Checkbox
                      checked={t.ok}
                      onCheckedChange={(v) => update(t.id, { ok: v === true })}
                      aria-label={`Include ${t.description}`}
                    />
                  </td>
                  <td className="py-2.5 tabular-nums text-muted-foreground">{t.date}</td>
                  <td className="py-2.5">
                    <span className="font-medium">{t.description}</span>
                    {t.recurring && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs text-accent-foreground">
                        <Repeat className="size-3" />
                        Recurring
                      </span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <Select
                      value={t.category}
                      onValueChange={(v) => update(t.id, { category: v, ok: true })}
                    >
                      <SelectTrigger className="h-8 w-[210px] border-transparent bg-secondary text-[13px] shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TX_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2.5 text-[13px]">
                    <span
                      className={cn(
                        "inline-flex rounded-md bg-secondary px-2 py-1",
                        !t.project && "text-subtle-foreground",
                      )}
                    >
                      {t.project || "No project"}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "py-2.5 pr-6 text-right font-semibold tabular-nums",
                      t.amount > 0 && "text-positive",
                    )}
                  >
                    {t.amount > 0 ? "+" : ""}
                    {money(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="sticky bottom-4 z-10 mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-foreground px-5 py-3 text-background shadow-lg">
        <Check className="size-4" />
        <span className="text-sm font-medium">
          {done
            ? "Added to expenses and revenue"
            : `${ready} of ${rows.length} ready · transfers are not counted`}
        </span>
        <Button
          variant="outline"
          className="ml-auto border-transparent text-foreground"
          disabled={done}
          onClick={() => {
            setDone(true);
            toast(`${ready} transactions added (sample only, nothing was saved)`);
          }}
        >
          Add to expenses &amp; revenue
        </Button>
      </div>
    </>
  );
}
