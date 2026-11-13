import { useState } from "react";
import { Check, Plus } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/miniops/core";
import { cn } from "@/lib/utils";
import { GOAL_PERIODS, MONTHLY_REVENUE, MONTHS, kmoney, money, type Goal } from "./data";
import { Chip, SampleDataBadge, Segmented } from "./ui";

const YEAR_GOAL = 480000;

function revenueSeries() {
  const avg3 = MONTHLY_REVENUE.slice(-3).reduce((a, b) => a + b, 0) / 3;
  let cum = 0;
  const actual = MONTHLY_REVENUE.map((v) => (cum += v));
  const today = actual[actual.length - 1] ?? 0;
  return {
    today,
    projected: today + avg3 * (12 - MONTHLY_REVENUE.length),
    data: MONTHS.map((month, i) => ({
      month,
      actual: actual[i] ?? null,
      pace: Math.round((YEAR_GOAL / 12) * (i + 1)),
      projection:
        i >= actual.length - 1 ? Math.round(today + avg3 * (i - actual.length + 1)) : null,
    })),
  };
}

function fmtGoal(v: number, unit: Goal["unit"]) {
  if (unit === "%") return `${v}%`;
  if (unit === "#") return String(v);
  if (unit === "$/mo") return `${money(v)}/mo`;
  return v >= 10000 ? kmoney(v) : money(v);
}

function GoalCard({ goal, elapsed }: { goal: Goal; elapsed: number }) {
  const pct = goal.inverse
    ? Math.min(goal.target / Math.max(goal.actual, 1), 1)
    : Math.min(goal.actual / goal.target, 1);
  const status: "ok" | "warn" | "neutral" = goal.inverse
    ? goal.actual <= goal.target
      ? "ok"
      : "warn"
    : elapsed === 0
      ? "neutral"
      : pct >= elapsed - 0.02
        ? "ok"
        : "warn";
  const label = {
    ok: goal.inverse ? "Under target" : "On pace",
    warn: goal.inverse ? "Over target" : "Behind",
    neutral: "Just started",
  }[status];
  const remaining = goal.target - goal.actual;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-sans text-base font-semibold">{goal.name}</h3>
        <Chip tone={status}>
          <span className="size-1.5 rounded-full bg-current" />
          {label}
        </Chip>
      </div>
      <p className="font-display text-[28px] font-semibold leading-none">
        {fmtGoal(goal.actual, goal.unit)}{" "}
        <span className="font-sans text-sm font-normal text-subtle-foreground">
          of {fmtGoal(goal.target, goal.unit)}
        </span>
      </p>
      <div>
        <div className="relative h-2.5 rounded-full bg-secondary">
          <div
            className={cn("h-full rounded-full", status === "warn" ? "bg-warning" : "bg-primary")}
            style={{ width: `${pct * 100}%` }}
          />
          {elapsed > 0 && !goal.inverse && (
            <span
              className="absolute -top-1 h-[18px] w-0.5 rounded bg-foreground"
              style={{ left: `${elapsed * 100}%` }}
              title="Where you should be today"
            />
          )}
        </div>
        <div className="mt-2 flex justify-between text-xs text-subtle-foreground">
          {[0, 25, 50, 75, 100].map((m) => {
            const hit = m > 0 && m < 100 && pct * 100 >= m;
            return (
              <span
                key={m}
                className={cn(
                  "inline-flex items-center gap-0.5",
                  hit && "font-semibold text-positive",
                )}
              >
                {m}%{hit && <Check className="size-3" />}
              </span>
            );
          })}
        </div>
      </div>
      {goal.monthsLeft && remaining > 0 ? (
        <p className="text-sm text-muted-foreground">
          Needed per month <b className="text-foreground">{kmoney(remaining / goal.monthsLeft)}</b>
          <span className="ml-4">
            Per week <b className="text-foreground">{kmoney(remaining / goal.monthsLeft / 4.33)}</b>
          </span>
        </p>
      ) : null}
      <p className="text-sm text-muted-foreground">{goal.note}</p>
    </div>
  );
}

export function GoalsPage() {
  const [period, setPeriod] = useState<"y12" | "m6">("y12");
  const p = GOAL_PERIODS[period];
  const s = revenueSeries();
  const ahead = s.today - (YEAR_GOAL / 12) * MONTHLY_REVENUE.length;
  return (
    <>
      <PageHeader
        title="Goals"
        description={p.range}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <SampleDataBadge />
            <Segmented
              value={period}
              onChange={setPeriod}
              options={[
                ["y12", GOAL_PERIODS.y12.label],
                ["m6", GOAL_PERIODS.m6.label],
              ]}
            />
            <Button onClick={() => toast("Goal setup opens here")}>
              <Plus /> New goal
            </Button>
          </div>
        }
      />
      {period === "y12" && (
        <div className="mb-5 rounded-2xl border bg-card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-sans text-base font-semibold">Revenue so far vs goal</h2>
            <div className="flex gap-4 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <i className="h-0.5 w-3 rounded bg-primary" />
                Actual
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="h-0.5 w-3 rounded bg-subtle-foreground" />
                Goal pace
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="h-0.5 w-3 rounded bg-primary-light" />
                Projection
              </span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={s.data} margin={{ left: 0, right: 16, top: 24, bottom: 0 }}>
                <defs>
                  <linearGradient id="goalActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-revenue)" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="var(--chart-revenue)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--subtle-foreground)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={56}
                  tick={{ fontSize: 12, fill: "var(--subtle-foreground)" }}
                  tickFormatter={(v: number) => (v ? `$${v / 1000}k` : "0")}
                />
                <Tooltip
                  formatter={(v: number) => kmoney(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                  }}
                />
                <Line
                  dataKey="pace"
                  name="Goal pace"
                  stroke="var(--subtle-foreground)"
                  strokeDasharray="6 5"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="projection"
                  name="Projection"
                  stroke="var(--chart-revenue)"
                  strokeDasharray="3 4"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Area
                  dataKey="actual"
                  name="Actual"
                  stroke="var(--chart-revenue)"
                  strokeWidth={3}
                  fill="url(#goalActual)"
                  dot={false}
                />
                <ReferenceDot
                  x="Oct"
                  y={s.today}
                  r={7}
                  fill="var(--card)"
                  stroke="var(--chart-revenue)"
                  strokeWidth={3}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            You're{" "}
            <b className={ahead >= 0 ? "text-positive" : "text-warning"}>
              {kmoney(Math.abs(ahead))} {ahead >= 0 ? "ahead" : "behind"}
            </b>{" "}
            of where you need to be. If November and December match your 3-month average, you'll
            finish at <b className="text-foreground">{kmoney(s.projected)}</b>.
          </p>
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        {p.goals.map((g) => (
          <GoalCard key={g.name} goal={g} elapsed={p.elapsed} />
        ))}
      </div>
    </>
  );
}
