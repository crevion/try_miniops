import { useState, type ReactNode } from "react";
import { ArrowRight, ArrowUp, Repeat, TrendingDown, AlertTriangle, Upload } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { PageHeader } from "@/components/miniops/core";
import { money } from "@/data/mock";
import { cn } from "@/lib/utils";
import { useMiniOps } from "./store";
import {
  SAMPLE_HOME_CLIENTS,
  SAMPLE_HOME_PROJECTS,
  SAMPLE_TREND,
  kmoney,
  type HomeProject,
} from "./preview/data";
import { Chip, SampleDataBadge, Segmented } from "./preview/ui";

/*
 * Home answers one question for the owner: "how is the business doing?"
 * Four numbers, one trend, one goal, things to act on, then projects and clients ranked.
 * Project and client figures are real; the monthly trend and revenue goal use sample
 * data until the backend reports them. A workspace with no projects yet shows samples.
 */

type Health = "good" | "risk" | "loss";
const HEALTH: Record<Health, [string, "ok" | "warn" | "bad"]> = {
  good: ["On track", "ok"],
  risk: ["At risk", "warn"],
  loss: ["Losing money", "bad"],
};
const marginOf = (revenue: number, cost: number) =>
  revenue ? Math.round(((revenue - cost) / revenue) * 100) : 0;
const healthOf = (p: HomeProject): Health => {
  const m = marginOf(p.revenue, p.cost);
  if (m < 0) return "loss";
  if (m < 12 || p.budgetUsed >= 90 || p.budgetUsed > p.progress + 30) return "risk";
  return "good";
};
type Grade = "great" | "ok" | "watch";
const GRADE: Record<Grade, [string, "ok" | "info" | "bad"]> = {
  great: ["Great client", "ok"],
  ok: ["Healthy", "info"],
  watch: ["Needs attention", "bad"],
};
const gradeOf = (margin: number, payDays?: number): Grade =>
  margin >= 30 && (payDays ?? 0) <= 15
    ? "great"
    : margin >= 15 && (payDays ?? 0) <= 30
      ? "ok"
      : "watch";

function Card({
  title,
  aside,
  className,
  children,
}: {
  title: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("min-w-0 rounded-2xl border bg-card", className)}>
      <div className="flex items-center justify-between gap-3 px-6 pt-5">
        <h2 className="font-sans text-base font-semibold">{title}</h2>
        {aside}
      </div>
      <div className="px-6 pb-6 pt-4">{children}</div>
    </section>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: ReactNode;
  tone?: "pos" | "neg";
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-2xl border bg-card px-5 py-4 md:px-6 md:py-5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-display text-[26px] font-semibold leading-tight tabular-nums md:text-[30px]",
          tone === "pos" && "text-positive",
          tone === "neg" && "text-destructive",
        )}
      >
        {value}
      </span>
      <span className="flex flex-wrap items-center gap-1.5 text-[13px] text-subtle-foreground">
        {hint}
      </span>
    </div>
  );
}

function Delta({
  value,
  suffix = "%",
  good = true,
}: {
  value: number;
  suffix?: string;
  good?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium",
        good ? "text-positive" : "text-muted-foreground",
      )}
    >
      <ArrowUp className={cn("size-3", value < 0 && "rotate-180")} />
      {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}

function MoreLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to as never}
      className="inline-flex items-center gap-1 text-sm font-semibold text-accent-foreground hover:underline"
    >
      {children}
      <ArrowRight className="size-3.5" />
    </Link>
  );
}

function TrendChart({
  data,
}: {
  data: { month: string; revenue: number; cost: number; profit: number }[];
}) {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ left: -8, right: 4, top: 8, bottom: 0 }} barGap={6}>
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
            width={52}
            tick={{ fontSize: 12, fill: "var(--subtle-foreground)" }}
            tickFormatter={(v: number) => (v ? `$${Math.round(v / 1000)}k` : "0")}
          />
          <Tooltip
            cursor={{ fill: "var(--secondary)", opacity: 0.6 }}
            formatter={(v: number) => money(v)}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--popover)",
            }}
          />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill="var(--chart-revenue)"
            radius={[5, 5, 0, 0]}
            maxBarSize={22}
          />
          <Bar
            dataKey="cost"
            name="Expenses"
            fill="var(--chart-cost)"
            radius={[5, 5, 0, 0]}
            maxBarSize={22}
          />
          <Line
            dataKey="profit"
            name="Profit"
            stroke="var(--chart-profit)"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "var(--card)", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function GoalRing({ pct, pace, size = 132 }: { pct: number; pace: number; size?: number }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const a = pace * 2 * Math.PI - Math.PI / 2;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${Math.round(pct * 100)}% of goal`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={12}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${c * Math.min(pct, 1)} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <circle
          cx={size / 2 + r * Math.cos(a)}
          cy={size / 2 + r * Math.sin(a)}
          r={5}
          fill="var(--foreground)"
          stroke="var(--card)"
          strokeWidth={2}
        >
          <title>Where you should be today</title>
        </circle>
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <b className="font-display text-2xl font-semibold">{Math.round(pct * 100)}%</b>
        <span className="text-[11px] text-subtle-foreground">of goal</span>
      </div>
    </div>
  );
}

function Attention({
  icon,
  tone,
  title,
  body,
  to,
  cta,
}: {
  icon: ReactNode;
  tone: "bad" | "warn" | "info";
  title: string;
  body: string;
  to: string;
  cta: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border bg-card p-5 md:p-6">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          tone === "bad" && "bg-danger-soft text-destructive",
          tone === "warn" && "bg-warning-soft text-warning",
          tone === "info" && "bg-info-soft text-info",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <b className="block font-semibold">{title}</b>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
        <div className="mt-3">
          <MoreLink to={to}>{cta}</MoreLink>
        </div>
      </div>
    </div>
  );
}

function ListRow({
  to,
  title,
  sub,
  chip,
  value,
  negative,
}: {
  to: string;
  title: string;
  sub: string;
  chip: ReactNode;
  value: string;
  negative?: boolean;
}) {
  return (
    <Link
      to={to as never}
      className="-mx-3 grid grid-cols-[minmax(0,1fr)_auto_64px] items-center gap-3 rounded-lg px-3 py-3 hover:bg-secondary/70"
    >
      <span className="min-w-0">
        <b className="block truncate font-semibold">{title}</b>
        <small className="block truncate text-[13px] text-subtle-foreground">{sub}</small>
      </span>
      <span className="hidden sm:block">{chip}</span>
      <span className={cn("text-right font-semibold tabular-nums", negative && "text-destructive")}>
        {value}
      </span>
    </Link>
  );
}

export function Dashboard() {
  const { projects, clients, tasks, subscriptions, activeWorkspace, profile } = useMiniOps();
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const sample = projects.length === 0;

  const homeProjects: HomeProject[] = sample
    ? SAMPLE_HOME_PROJECTS
    : projects
        .filter((p) => p.status !== "Completed")
        .map((p) => ({
          id: p.id,
          name: p.name,
          client: p.client,
          revenue: p.revenue,
          cost: p.cost,
          budgetUsed: p.budgetUsed,
          progress: p.progress,
        }));
  const homeClients = sample
    ? SAMPLE_HOME_CLIENTS.map((c) => ({
        name: c.name,
        profit: c.revenue - c.cost,
        margin: marginOf(c.revenue, c.cost),
        payDays: c.payDays as number | undefined,
      }))
    : clients.map((c) => ({
        name: c[1],
        profit: Math.round((c[3] * c[4]) / 100),
        margin: Math.round(c[4]),
        payDays: undefined as number | undefined,
      }));

  // Headline numbers: from the trend in sample mode, from projects otherwise.
  const last = SAMPLE_TREND[SAMPLE_TREND.length - 1]!;
  const prev = SAMPLE_TREND[SAMPLE_TREND.length - 2]!;
  const revenue = sample ? last.revenue : homeProjects.reduce((s, p) => s + p.revenue, 0);
  const cost = sample ? last.cost : homeProjects.reduce((s, p) => s + p.cost, 0);
  const profit = revenue - cost;
  const margin = revenue ? (profit / revenue) * 100 : 0;
  const target = activeWorkspace.targetMargin ?? 20;
  const pct = (a: number, b: number) => ((a - b) / b) * 100;
  const prevMargin = (prev.profit / prev.revenue) * 100;

  const ranked = [...homeProjects].sort(
    (a, b) => marginOf(a.revenue, a.cost) - marginOf(b.revenue, b.cost),
  );
  const worst = ranked.find((p) => healthOf(p) !== "good");

  // Things to act on.
  const attention: ReactNode[] = [];
  if (worst) {
    const over = worst.cost - worst.revenue;
    attention.push(
      <Attention
        key="project"
        icon={<TrendingDown className="size-[18px]" />}
        tone={healthOf(worst) === "loss" ? "bad" : "warn"}
        title={`${worst.name} ${healthOf(worst) === "loss" ? "is losing money" : "is at risk"}`}
        body={
          over > 0
            ? `Costs are ${money(over)} over the fee with ${Math.max(0, 100 - worst.progress)}% of the work left.`
            : `${worst.budgetUsed}% of the budget is used with ${worst.progress}% of the work done.`
        }
        to={sample ? "/projects" : `/projects/${worst.id}`}
        cta="Review project"
      />,
    );
  }
  if (sample) {
    attention.push(
      <Attention
        key="subs"
        icon={<Repeat className="size-[18px]" />}
        tone="warn"
        title="$234 a month on unused tools"
        body="Adobe CC, Webflow and Loom haven't been used in over 45 days."
        to="/subscriptions"
        cta="See subscriptions"
      />,
      <Attention
        key="bank"
        icon={<Upload className="size-[18px]" />}
        tone="info"
        title="3 transactions need a category"
        body="From your Payoneer statement uploaded on Oct 31."
        to="/bank"
        cta="Review now"
      />,
    );
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueTime = (d: string) => new Date(`${d} ${today.getFullYear()}`).getTime();
    const overdue = tasks
      .filter((t) => t[5] !== "Done" && dueTime(t[4]) < today.getTime())
      .sort((a, b) => dueTime(a[4]) - dueTime(b[4]));
    if (overdue.length)
      attention.push(
        <Attention
          key="overdue"
          icon={<AlertTriangle className="size-[18px]" />}
          tone="warn"
          title={`${overdue.length} ${overdue.length === 1 ? "task is" : "tasks are"} overdue`}
          body={`Oldest: ${overdue[0]![0]} on ${overdue[0]![1]}.`}
          to="/tasks"
          cta="See tasks"
        />,
      );
    const monthly = subscriptions
      .filter((s) => s.status === "Active")
      .reduce(
        (sum, s) =>
          sum +
          (s.billingCycle === "Yearly"
            ? s.amount / 12
            : s.billingCycle === "Quarterly"
              ? s.amount / 3
              : s.billingCycle === "Monthly"
                ? s.amount
                : 0),
        0,
      );
    if (monthly > 0)
      attention.push(
        <Attention
          key="subs"
          icon={<Repeat className="size-[18px]" />}
          tone="info"
          title={`${money(monthly)} a month on subscriptions`}
          body="Check for tools nobody uses any more."
          to="/subscriptions"
          cta="See subscriptions"
        />,
      );
  }

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const goalPct = 0.845;
  const goalPace = 0.833;

  return (
    <>
      <PageHeader
        title={`${greet}, ${profile.name.split(" ")[0]}`}
        description={
          sample
            ? `Here's how a business like ${activeWorkspace.name} looks once projects are in.`
            : `Here's how ${activeWorkspace.name} is doing across ${homeProjects.length} active projects.`
        }
        action={
          <div className="flex flex-wrap items-center gap-3">
            {sample && <SampleDataBadge />}
            <Segmented
              value={period}
              onChange={(v) => {
                if (v !== "month")
                  toast("Quarter and year views arrive once the backend reports monthly totals");
                setPeriod("month");
              }}
              options={[
                ["month", sample ? "October" : "Now"],
                ["quarter", "This quarter"],
                ["year", "This year"],
              ]}
            />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-5">
        <Kpi
          label="Revenue"
          value={money(revenue)}
          hint={
            sample ? (
              <>
                <Delta value={pct(last.revenue, prev.revenue)} /> vs September
              </>
            ) : (
              "Fees on active projects"
            )
          }
        />
        <Kpi
          label="Expenses"
          value={money(cost)}
          hint={
            sample ? (
              <>
                <Delta value={pct(last.cost, prev.cost)} good={false} /> vs September
              </>
            ) : (
              "Costs so far"
            )
          }
        />
        <Kpi
          label="Profit"
          value={money(profit)}
          tone={profit >= 0 ? "pos" : "neg"}
          hint={
            sample ? (
              <>
                <Delta value={pct(last.profit, prev.profit)} /> vs September
              </>
            ) : (
              "Fees minus costs"
            )
          }
        />
        <Kpi
          label="Profit margin"
          value={`${margin.toFixed(1)}%`}
          hint={
            <>
              {sample && <Delta value={margin - prevMargin} suffix=" pts" />}
              goal {target}%
            </>
          }
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card
          title="Revenue, expenses and profit"
          aside={
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground">
              {!sample && <SampleDataBadge />}
              <span className="inline-flex items-center gap-1.5">
                <i className="size-2.5 rounded-sm bg-[var(--chart-revenue)]" />
                Revenue
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="size-2.5 rounded-sm bg-[var(--chart-cost)]" />
                Expenses
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="h-0.5 w-3 rounded bg-[var(--chart-profit)]" />
                Profit
              </span>
            </div>
          }
        >
          <TrendChart data={SAMPLE_TREND} />
        </Card>
        <Card title="2026 revenue goal" aside={<MoreLink to="/goals">Goals</MoreLink>}>
          <div className="flex flex-wrap items-center gap-5">
            <GoalRing pct={goalPct} pace={goalPace} />
            <div className="min-w-0 flex-1">
              <Chip tone="ok">
                <span className="size-1.5 rounded-full bg-current" />
                On pace
              </Chip>
              <p className="mt-2.5 font-display text-[26px] font-semibold leading-none">
                $405.6k{" "}
                <span className="font-sans text-sm font-normal text-subtle-foreground">
                  of $480k
                </span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                83% of the year has passed and you've reached 84.5% of your goal.
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary p-4">
              <span className="text-[13px] text-subtle-foreground">Needed per month</span>
              <b className="mt-2 block text-lg font-semibold tabular-nums">{kmoney(37200)}</b>
            </div>
            <div className="rounded-xl bg-secondary p-4">
              <span className="text-[13px] text-subtle-foreground">Your 3-month average</span>
              <b className="mt-2 block text-lg font-semibold tabular-nums text-positive">
                {kmoney(48000)}
              </b>
            </div>
          </div>
        </Card>
      </div>

      {attention.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3.5 font-sans text-lg font-semibold">Needs your attention</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">{attention}</div>
        </div>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card
          title="Projects"
          aside={<span className="text-[13px] text-subtle-foreground">Margin, lowest first</span>}
        >
          {ranked.slice(0, 5).map((p) => {
            const m = marginOf(p.revenue, p.cost);
            const [label, tone] = HEALTH[healthOf(p)];
            return (
              <ListRow
                key={p.id}
                to={sample ? "/projects" : `/projects/${p.id}`}
                title={p.name}
                sub={`${p.client} · ${p.budgetUsed}% of budget used`}
                chip={<Chip tone={tone}>{label}</Chip>}
                value={`${m}%`}
                negative={m < 0}
              />
            );
          })}
          {!ranked.length && (
            <p className="py-6 text-sm text-muted-foreground">No active projects yet.</p>
          )}
          <div className="mt-2">
            <MoreLink to="/projects">All projects</MoreLink>
          </div>
        </Card>
        <Card
          title="Clients"
          aside={<span className="text-[13px] text-subtle-foreground">Profit this year</span>}
        >
          {[...homeClients]
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 5)
            .map((c) => {
              const [label, tone] = GRADE[gradeOf(c.margin, c.payDays)];
              return (
                <ListRow
                  key={c.name}
                  to="/clients"
                  title={c.name}
                  sub={`${c.margin}% margin${c.payDays ? ` · pays in ${c.payDays} days` : ""}`}
                  chip={<Chip tone={tone}>{label}</Chip>}
                  value={kmoney(c.profit)}
                  negative={c.profit < 0}
                />
              );
            })}
          {!homeClients.length && (
            <p className="py-6 text-sm text-muted-foreground">No clients yet.</p>
          )}
          <div className="mt-2">
            <MoreLink to="/clients">All clients</MoreLink>
          </div>
        </Card>
      </div>
    </>
  );
}
