// Sample data for redesign v2 screens that miniops-backend does not serve yet
// (Goals, Bank & statements, Subscriptions & bills, Ask MiniOps).
// Replace these with API calls once the endpoints exist.

export const money = (n: number, cents = false) =>
  (n < 0 ? "−$" : "$") +
  Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: cents && n % 1 ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
export const kmoney = (n: number) => (n < 0 ? "−$" : "$") + (Math.abs(n) / 1000).toFixed(1) + "k";

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
/** Monthly revenue so far this year (Jan–Oct). */
export const MONTHLY_REVENUE = [
  36700, 33400, 35100, 36800, 38200, 41500, 39800, 44100, 47600, 52400,
];

export type Goal = {
  name: string;
  target: number;
  actual: number;
  unit: "$" | "%" | "#" | "$/mo";
  monthsLeft?: number;
  inverse?: boolean;
  note: string;
};
export const GOAL_PERIODS: Record<
  "y12" | "m6",
  { label: string; range: string; elapsed: number; goals: Goal[] }
> = {
  y12: {
    label: "12 months",
    range: "January – December 2026",
    elapsed: 0.833,
    goals: [
      {
        name: "Revenue",
        target: 480000,
        actual: 405600,
        unit: "$",
        monthsLeft: 2,
        note: "Your last 3 months averaged $48.0k.",
      },
      {
        name: "Profit",
        target: 72000,
        actual: 54700,
        unit: "$",
        monthsLeft: 2,
        note: "Your last 3 months averaged $8.9k.",
      },
      {
        name: "Profit margin",
        target: 20,
        actual: 13.5,
        unit: "%",
        note: "Year to date. October alone was 21.8%.",
      },
      {
        name: "New retainer clients",
        target: 4,
        actual: 3,
        unit: "#",
        note: "Nimbus Health, Kora Foods, Brightline.",
      },
    ],
  },
  m6: {
    label: "6 months",
    range: "November 2026 – April 2027",
    elapsed: 0,
    goals: [
      {
        name: "Revenue",
        target: 330000,
        actual: 0,
        unit: "$",
        monthsLeft: 6,
        note: "About 5% more per month than October.",
      },
      {
        name: "Profit margin",
        target: 22,
        actual: 21.8,
        unit: "%",
        note: "Starting from October's 21.8%.",
      },
      {
        name: "Software & tools spend",
        target: 900,
        actual: 1140,
        unit: "$/mo",
        inverse: true,
        note: "Cut $240 a month. 3 tools look unused.",
      },
      {
        name: "New retainer clients",
        target: 3,
        actual: 0,
        unit: "#",
        note: "1 proposal out to Ostro Bikes.",
      },
    ],
  },
};

export const BANK_ACCOUNTS = [
  {
    name: "City Bank · Business",
    number: "•••• 4821",
    balance: 28450,
    initials: "CB",
    color: "#B91C1C",
    sync: "Synced 2 hours ago",
    how: "Connected",
  },
  {
    name: "Payoneer · USD",
    number: "•••• 0193",
    balance: 12380,
    initials: "PY",
    color: "#E25B0E",
    sync: "Statement uploaded Oct 31",
    how: "Statement",
  },
  {
    name: "BRAC Bank · Credit card",
    number: "•••• 7710",
    balance: -2140,
    initials: "BB",
    color: "#1D4ED8",
    sync: "Statement uploaded Oct 30",
    how: "Statement",
  },
];

export const TX_CATEGORIES = [
  "Revenue",
  "Software",
  "Hosting",
  "Contractors",
  "Rent & office",
  "Ad spend (rebillable)",
  "Loan payment",
  "Transfer (not counted)",
  "Other",
];
export type Transaction = {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  confident: boolean;
  project: string;
  recurring?: boolean;
};
export const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    date: "Oct 28",
    description: "FIGMA INC SAN FRANCISCO",
    amount: -75,
    category: "Software",
    confident: true,
    project: "",
    recurring: true,
  },
  {
    id: 2,
    date: "Oct 27",
    description: "TALLYO LTD INV-0412",
    amount: 8000,
    category: "Revenue",
    confident: true,
    project: "Mobile app MVP",
  },
  {
    id: 3,
    date: "Oct 26",
    description: "AMAZON WEB SERVICES",
    amount: -312,
    category: "Hosting",
    confident: true,
    project: "Mobile app MVP",
    recurring: true,
  },
  {
    id: 4,
    date: "Oct 25",
    description: "TRANSFER TO SAVINGS ••2290",
    amount: -5000,
    category: "Transfer (not counted)",
    confident: true,
    project: "",
  },
  {
    id: 5,
    date: "Oct 24",
    description: "GOOGLE *WORKSPACE",
    amount: -84,
    category: "Software",
    confident: true,
    project: "",
    recurring: true,
  },
  {
    id: 6,
    date: "Oct 22",
    description: "BKASH PAYMENT AYON R.",
    amount: -650,
    category: "Contractors",
    confident: false,
    project: "",
  },
  {
    id: 7,
    date: "Oct 20",
    description: "RENT GULSHAN OFFICE",
    amount: -1200,
    category: "Rent & office",
    confident: true,
    project: "",
    recurring: true,
  },
  {
    id: 8,
    date: "Oct 18",
    description: "ADOBE *CREATIVE CLOUD",
    amount: -180,
    category: "Software",
    confident: true,
    project: "",
    recurring: true,
  },
  {
    id: 9,
    date: "Oct 15",
    description: "KORA FOODS PLC",
    amount: 4800,
    category: "Revenue",
    confident: true,
    project: "Brand refresh",
  },
  {
    id: 10,
    date: "Oct 12",
    description: "FACEBK *ADS 8HJ2K",
    amount: -900,
    category: "Ad spend (rebillable)",
    confident: false,
    project: "Social content retainer",
  },
  {
    id: 11,
    date: "Oct 10",
    description: "POS 4421 STAR KABAB",
    amount: -46,
    category: "Other",
    confident: false,
    project: "",
  },
  {
    id: 12,
    date: "Oct 05",
    description: "IDLC FINANCE EMI",
    amount: -600,
    category: "Loan payment",
    confident: true,
    project: "",
    recurring: true,
  },
];

export type Subscription = {
  name: string;
  category: string;
  amount: number;
  cycle: string;
  next: string;
  usage: string;
  flag?: "unused" | "seats";
};
export const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    name: "Adobe Creative Cloud",
    category: "Software",
    amount: 180,
    cycle: "Monthly",
    next: "Nov 18",
    usage: "Last used 47 days ago",
    flag: "unused",
  },
  {
    name: "Webflow",
    category: "Software",
    amount: 39,
    cycle: "Monthly",
    next: "Nov 12",
    usage: "Not linked to any project",
    flag: "unused",
  },
  {
    name: "Loom",
    category: "Software",
    amount: 15,
    cycle: "Monthly",
    next: "Nov 21",
    usage: "No activity in 60 days",
    flag: "unused",
  },
  {
    name: "Figma",
    category: "Software",
    amount: 75,
    cycle: "Monthly",
    next: "Nov 28",
    usage: "6 seats, 4 active",
    flag: "seats",
  },
  {
    name: "Google Workspace",
    category: "Software",
    amount: 84,
    cycle: "Monthly",
    next: "Nov 24",
    usage: "Used daily",
  },
  {
    name: "Slack",
    category: "Software",
    amount: 52.5,
    cycle: "Monthly",
    next: "Nov 15",
    usage: "Used daily",
  },
  {
    name: "Notion",
    category: "Software",
    amount: 40,
    cycle: "Monthly",
    next: "Nov 12",
    usage: "Used weekly",
  },
  {
    name: "Amazon Web Services",
    category: "Hosting",
    amount: 312,
    cycle: "Monthly, varies",
    next: "Nov 26",
    usage: "Billed to Mobile app MVP",
  },
  {
    name: "Gulshan office rent",
    category: "Rent & office",
    amount: 1200,
    cycle: "Monthly",
    next: "Nov 20",
    usage: "Bill",
  },
  {
    name: "IDLC Finance EMI",
    category: "Loan payment",
    amount: 600,
    cycle: "Monthly",
    next: "Nov 5",
    usage: "Loan, 14 of 24 paid",
  },
  {
    name: "Internet (Link3)",
    category: "Rent & office",
    amount: 45,
    cycle: "Monthly",
    next: "Nov 7",
    usage: "Bill",
  },
];

export const AI_SAMPLE_ANSWERS: Record<string, string> = {
  "Are we on track for this year's goal?":
    "Yes. You've earned $405.6k of $480k (84.5%) and 83% of the year has passed. You need $37.2k a month for November and December; your last three months averaged $48.0k.",
  "Which project should I worry about?":
    "Mobile app MVP for Tallyo. Costs are $1,300 over the fee with 30% of the work left, and Tallyo pays in 45 days on average. Consider milestone billing for the next phase.",
  "Where can I cut costs this month?":
    "Three tools look unused: Adobe Creative Cloud ($180), Webflow ($39) and Loom ($15). Cancelling them saves $234 a month, or $2,808 a year. Figma also has 2 unused seats.",
};

// Home (business health) samples, used when a workspace has no projects yet
// and for the monthly trend, which the backend does not report yet.
export const SAMPLE_TREND = [
  { month: "May", revenue: 38200, cost: 33900 },
  { month: "Jun", revenue: 41500, cost: 35200 },
  { month: "Jul", revenue: 39800, cost: 36800 },
  { month: "Aug", revenue: 44100, cost: 37400 },
  { month: "Sep", revenue: 47600, cost: 39100 },
  { month: "Oct", revenue: 52400, cost: 41000 },
].map((m) => ({ ...m, profit: m.revenue - m.cost }));

export type HomeProject = {
  id: string;
  name: string;
  client: string;
  revenue: number;
  cost: number;
  budgetUsed: number;
  progress: number;
};
export const SAMPLE_HOME_PROJECTS: HomeProject[] = [
  {
    id: "brightline",
    name: "Website redesign",
    client: "Brightline",
    revenue: 18400,
    cost: 11900,
    budgetUsed: 65,
    progress: 25,
  },
  {
    id: "kora-brand",
    name: "Brand refresh",
    client: "Kora Foods",
    revenue: 9600,
    cost: 7870,
    budgetUsed: 85,
    progress: 60,
  },
  {
    id: "nimbus-seo",
    name: "Q4 SEO retainer",
    client: "Nimbus Health",
    revenue: 4500,
    cost: 2250,
    budgetUsed: 50,
    progress: 55,
  },
  {
    id: "tallyo-app",
    name: "Mobile app MVP",
    client: "Tallyo",
    revenue: 26000,
    cost: 27300,
    budgetUsed: 105,
    progress: 70,
  },
  {
    id: "kora-social",
    name: "Social content retainer",
    client: "Kora Foods",
    revenue: 3200,
    cost: 2100,
    budgetUsed: 66,
    progress: 66,
  },
  {
    id: "ostro-video",
    name: "Brand video",
    client: "Ostro Bikes",
    revenue: 6800,
    cost: 6450,
    budgetUsed: 95,
    progress: 80,
  },
];
export const SAMPLE_HOME_CLIENTS = [
  { name: "Nimbus Health", revenue: 31500, cost: 16100, payDays: 6 },
  { name: "Brightline", revenue: 42600, cost: 28200, payDays: 12 },
  { name: "Kora Foods", revenue: 51800, cost: 39700, payDays: 21 },
  { name: "Ostro Bikes", revenue: 14200, cost: 12900, payDays: 34 },
  { name: "Tallyo", revenue: 44000, cost: 46100, payDays: 45 },
];
