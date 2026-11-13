import { useState } from "react";
import { AlertTriangle, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/miniops/core";
import { SAMPLE_SUBSCRIPTIONS, money } from "./data";
import { Kpi, SampleDataBadge } from "./ui";

export function SubscriptionsPage() {
  const [toCancel, setToCancel] = useState<Set<string>>(() => new Set());
  const subs = SAMPLE_SUBSCRIPTIONS;
  const total = subs.reduce((a, s) => a + s.amount, 0);
  const software = subs.filter((s) => s.category === "Software").reduce((a, s) => a + s.amount, 0);
  const unused = subs.filter((s) => s.flag === "unused");
  const unusedTotal = unused.reduce((a, s) => a + s.amount, 0);
  const toggle = (name: string) =>
    setToCancel((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
        toast(`${name} no longer marked to cancel`);
      } else {
        next.add(name);
        toast(`${name} marked to cancel`);
      }
      return next;
    });
  return (
    <>
      <PageHeader
        title="Subscriptions & bills"
        description="Found automatically in your bank transactions."
        action={<SampleDataBadge />}
      />
      <div className="mb-5 grid grid-cols-2 gap-5 xl:grid-cols-4">
        <Kpi
          label="Recurring per month"
          value={money(total, true)}
          hint={`${subs.length} subscriptions and bills`}
        />
        <Kpi label="Software & tools" value={money(software, true)} hint="6-month goal: $900" />
        <Kpi
          label="Possibly unused"
          value={money(unusedTotal)}
          tone="warn"
          hint={`${unused.length} tools · ${money(unusedTotal * 12)} a year`}
        />
        <Kpi label="Due in 7 days" value={money(645)} hint="Loan EMI and internet" />
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="text-left text-[13px] text-subtle-foreground">
            <tr className="border-b">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="py-3 font-medium">Category</th>
              <th className="py-3 font-medium">Usage</th>
              <th className="py-3 font-medium">Next charge</th>
              <th className="py-3 text-right font-medium">Per month</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.name} className="border-b last:border-0">
                <td className="px-5 py-3.5">
                  <b className="block font-semibold">{s.name}</b>
                  <span className="text-[12.5px] text-subtle-foreground">{s.cycle}</span>
                </td>
                <td className="py-3.5 text-muted-foreground">{s.category}</td>
                <td className="py-3.5">
                  {s.flag === "unused" ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-warning">
                      <AlertTriangle className="size-3.5" />
                      {s.usage}
                    </span>
                  ) : s.flag === "seats" ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-info">
                      <UsersRound className="size-3.5" />
                      {s.usage}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{s.usage}</span>
                  )}
                </td>
                <td className="py-3.5 tabular-nums">{s.next}</td>
                <td className="py-3.5 text-right font-semibold tabular-nums">
                  {money(s.amount, true)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {s.flag && (
                    <Button
                      size="sm"
                      variant={toCancel.has(s.name) ? "default" : "outline"}
                      onClick={() => toggle(s.name)}
                    >
                      {toCancel.has(s.name) ? "Marked to cancel" : "Mark to cancel"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
