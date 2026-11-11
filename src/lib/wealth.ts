export const assetTypes = [
  {
    type: "BANKING",
    slug: "banking",
    label: "Comptes & épargne",
    hint: "Comptes courants, dépôts et liquidités",
    color: "#34d399",
  },
  {
    type: "INVESTMENT",
    slug: "investment",
    label: "Actions & fonds",
    hint: "Actions cotées et fonds de placement",
    color: "#a78bfa",
  },
  {
    type: "ETF",
    slug: "etf",
    label: "ETF",
    hint: "Fonds indiciels et trackers",
    color: "#818cf8",
  },
  {
    type: "BOND",
    slug: "bond",
    label: "Obligations",
    hint: "Obligations d’État et d’entreprise",
    color: "#60a5fa",
  },
  {
    type: "CRYPTO",
    slug: "crypto",
    label: "Cryptomonnaies",
    hint: "Bitcoin, Ethereum et autres tokens",
    color: "#fbbf24",
  },
  {
    type: "REAL_ESTATE",
    slug: "real-estate",
    label: "Immobilier",
    hint: "Valeur de votre part, avant hypothèque",
    color: "#fb923c",
  },
  {
    type: "PENSION_3A",
    slug: "pillar-3a",
    label: "Pilier 3a",
    hint: "Prévoyance liée, fonds ou compte",
    color: "#2dd4bf",
  },
  {
    type: "PENSION_2",
    slug: "pillar-2",
    label: "2e pilier / LPP",
    hint: "Avoir de prévoyance et libre passage",
    color: "#22d3ee",
  },
  {
    type: "LIFE_INSURANCE",
    slug: "insurance",
    label: "Assurance-vie",
    hint: "Valeur de rachat de votre contrat",
    color: "#c084fc",
  },
  {
    type: "COMMODITY",
    slug: "commodity",
    label: "Or & métaux",
    hint: "Lingots, pièces et matières premières",
    color: "#eab308",
  },
  {
    type: "STARTUP",
    slug: "startup",
    label: "Private equity",
    hint: "Startups et participations non cotées",
    color: "#f472b6",
  },
  {
    type: "DEBT",
    slug: "debt",
    label: "Crédits & hypothèques",
    hint: "Capital restant dû, déduit du patrimoine",
    color: "#f87171",
  },
  {
    type: "OTHER",
    slug: "other",
    label: "Autres actifs",
    hint: "Collections, véhicules et objets de valeur",
    color: "#94a3b8",
  },
] as const;
export const currencies = [
  "CHF",
  "EUR",
  "USD",
  "GBP",
  "CAD",
  "JPY",
  "AUD",
] as const;
export type WealthAsset = {
  id: string;
  name: string;
  type: string;
  category: string;
  institution?: string | null;
  value: number;
  quantity: number;
  buyingPrice: number | null;
  currency: string;
  fxRate?: number | null;
  annualFeePercent?: number;
  monthlyIncome?: number;
  notes?: string | null;
  updatedAt?: string;
  createdAt?: string;
};
export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlySaving: number;
  deadline: string;
};
export type Snapshot = {
  day: string;
  gross: number;
  debt: number;
  net: number;
};
export type WealthData = {
  assets: WealthAsset[];
  goals: Goal[];
  snapshots: Snapshot[];
  monthlyIncome: number;
  monthlyExpenses: number;
};
export const money = (n: number, currency = "CHF") =>
  new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
export function rate(a: WealthAsset) {
  return a.currency === "CHF" ? 1 : (a.fxRate ?? 0) > 0 ? a.fxRate! : null;
}
export function summarize(assets: WealthAsset[]) {
  let gross = 0,
    debt = 0,
    gain = 0,
    basis = 0,
    fees = 0,
    income = 0,
    liquid = 0;
  let missing = 0;
  const allocation: Record<string, number> = {};
  const institutions: Record<string, number> = {};
  for (const a of assets) {
    const fx = rate(a);
    if (fx === null) {
      missing++;
      continue;
    }
    const v = a.value * fx;
    if (a.type === "DEBT") {
      debt += v;
      continue;
    }
    gross += v;
    allocation[a.type] = (allocation[a.type] ?? 0) + v;
    institutions[a.institution || "Sans établissement"] =
      (institutions[a.institution || "Sans établissement"] ?? 0) + v;
    fees += (v * (a.annualFeePercent ?? 0)) / 100;
    income += (a.monthlyIncome ?? 0) * fx;
    if (
      ["BANKING", "INVESTMENT", "ETF", "BOND", "CRYPTO", "COMMODITY"].includes(
        a.type,
      )
    )
      liquid += v;
    if (a.buyingPrice !== null && a.quantity > 0) {
      const cost = a.buyingPrice * a.quantity * fx;
      basis += cost;
      gain += v - cost;
    }
  }
  return {
    gross,
    debt,
    net: gross - debt,
    gain,
    basis,
    fees,
    income,
    liquid,
    missing,
    allocation,
    institutions,
  };
}
export function project(
  initial: number,
  monthly: number,
  years: number,
  annualReturn: number,
  fee = 0,
  inflation = 0,
) {
  const rows = [];
  let value = initial;
  const r =
    Math.pow(1 + annualReturn / 100, 1 / 12) * Math.pow(1 - fee / 100, 1 / 12) -
    1;
  for (let month = 0; month <= years * 12; month++) {
    if (month > 0) value = value * (1 + r) + monthly;
    if (month % 12 === 0)
      rows.push({
        year: month / 12,
        value,
        invested: initial + monthly * month,
        real: value / Math.pow(1 + inflation / 100, month / 12),
      });
  }
  return rows;
}
export function monteCarlo(
  initial: number,
  monthly: number,
  years: number,
  expected: number,
  volatility: number,
  fee: number,
  seed = 42,
) {
  let state = seed >>> 0;
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return (state + 1) / 4294967297;
  };
  const values = Array.from({ length: years + 1 }, () => [] as number[]);
  const sigma = volatility / 100;
  const mu = Math.log(1 + expected / 100) + Math.log(1 - fee / 100);
  for (let path = 0; path < 400; path++) {
    let v = initial;
    values[0].push(v);
    for (let m = 1; m <= years * 12; m++) {
      const z =
        Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
      v =
        v *
          Math.exp(
            (mu - (sigma * sigma) / 2) / 12 + (sigma / Math.sqrt(12)) * z,
          ) +
        monthly;
      if (m % 12 === 0) values[m / 12].push(v);
    }
  }
  return values.map((v, year) => {
    v.sort((a, b) => a - b);
    return { year, low: v[39], median: v[199], high: v[359] };
  });
}
export function goalPlan(goal: Goal, now = new Date()) {
  const months = Math.max(
    0,
    (new Date(goal.deadline).getTime() - now.getTime()) /
      ((1000 * 60 * 60 * 24 * 365.25) / 12),
  );
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  return {
    progress: Math.min(100, (goal.currentAmount / goal.targetAmount) * 100),
    remaining,
    months,
    required: months > 0 ? remaining / months : remaining,
    onTrack:
      remaining === 0 ||
      (months > 0 && goal.monthlySaving * months >= remaining),
  };
}
export function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export function exportCsv(assets: WealthAsset[]) {
  return (
    "\uFEFF" +
    [
      [
        "name",
        "type",
        "category",
        "institution",
        "value",
        "quantity",
        "buyingPrice",
        "currency",
        "fxRate",
        "annualFeePercent",
        "monthlyIncome",
        "notes",
      ].join(","),
      ...assets.map((a) =>
        [
          a.name,
          a.type,
          a.category,
          a.institution,
          a.value,
          a.quantity,
          a.buyingPrice,
          a.currency,
          a.fxRate,
          a.annualFeePercent ?? 0,
          a.monthlyIncome ?? 0,
          a.notes,
        ]
          .map(csvCell)
          .join(","),
      ),
    ].join("\r\n")
  );
}
