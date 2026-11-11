"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  FormEvent,
  ReactNode,
} from "react";
import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Upload,
  Search,
  Pencil,
  Trash2,
  X,
  Camera,
  Eye,
  EyeOff,
  Layers,
  Target,
  TrendingUp,
  Wallet,
  ArrowRight,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useWealth } from "./WealthProvider";
import {
  assetTypes,
  currencies,
  WealthAsset,
  Goal,
  money,
  summarize,
  rate,
  goalPlan,
  project,
  monteCarlo,
  exportCsv,
} from "@/lib/wealth";
import { assetInput, goalInput } from "@/lib/wealth-validation";
import { parseCsv } from "@/lib/csv";
export type View =
  "overview" | "portfolio" | "goals" | "insights" | "budget" | "tools" | "add";
const tooltipStyle = {
  background: "#171d27",
  border: "1px solid #303a47",
  borderRadius: 12,
  color: "#fff",
};
function download(content: string, name: string) {
  const u = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 500);
}
function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`wealth-panel ${className}`}>{children}</section>;
}
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const el = ref.current;
    el?.querySelector<HTMLElement>("button,input")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && el) {
        const focusable = Array.from(
          el.querySelectorAll<HTMLElement>(
            "button:not(:disabled),input:not(:disabled),select,textarea,a[href]",
          ),
        );
        const first = focusable[0],
          last = focusable.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-shade"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="wealth-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="section-top">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function AssetForm({
  asset,
  type,
  onDone,
}: {
  asset?: WealthAsset;
  type?: string;
  onDone: () => void;
}) {
  const { mutate } = useWealth();
  const [kind, setKind] = useState(asset?.type || type || "BANKING");
  const [currency, setCurrency] = useState(asset?.currency || "CHF");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const data = assetInput({
        ...form,
        type: kind,
        currency,
        category: assetTypes.find((t) => t.type === kind)?.label,
      });
      setBusy(true);
      await mutate(
        asset ? `/api/assets/${asset.id}` : "/api/assets",
        asset ? "PUT" : "POST",
        data,
      );
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d’enregistrement.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="form-stack">
      <div className="form-grid">
        <Field label="Type d’actif">
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            {assetTypes.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nom">
          <input
            name="name"
            defaultValue={asset?.name}
            required
            maxLength={160}
            placeholder="Ex. ETF Monde, compte épargne…"
          />
        </Field>
        <Field label="Établissement / compte">
          <input
            name="institution"
            defaultValue={asset?.institution || ""}
            maxLength={160}
            placeholder="Ex. IBKR, UBS, VIAC"
          />
        </Field>
        <Field label="Devise de saisie">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field
          label={
            kind === "DEBT" ? "Capital restant dû" : "Valeur actuelle totale"
          }
          hint={
            kind === "DEBT"
              ? "Saisir un montant positif. Il sera déduit du patrimoine."
              : kind === "REAL_ESTATE"
                ? "Valeur de votre part. Ajoutez l’hypothèque séparément dans Crédits."
                : "Valeur de toute la position, dans la devise choisie."
          }
        >
          <input
            name="value"
            type="number"
            step="any"
            min="0"
            max="1000000000000"
            defaultValue={asset?.value}
            required
          />
        </Field>
        {currency !== "CHF" && (
          <Field
            label={`1 ${currency} = combien de CHF ?`}
            hint="Taux manuel, utilisé pour consolider le patrimoine. Pas de cours en direct."
          >
            <input
              name="fxRate"
              type="number"
              step="any"
              min="0.000001"
              max="1000000"
              defaultValue={asset?.fxRate ?? ""}
              required
            />
          </Field>
        )}
        <Field
          label="Quantité"
          hint="Laissez 1 pour un compte, un bien ou un crédit."
        >
          <input
            name="quantity"
            type="number"
            step="any"
            min="0"
            defaultValue={asset?.quantity ?? 1}
            required
          />
        </Field>
        {kind !== "DEBT" && (
          <>
            <Field
              label="Prix de revient unitaire (facultatif)"
              hint="Dans la devise de saisie ; hors frais et fiscalité."
            >
              <input
                name="buyingPrice"
                type="number"
                step="any"
                min="0"
                defaultValue={asset?.buyingPrice ?? ""}
              />
            </Field>
            <Field label="Frais annuels estimés (%)">
              <input
                name="annualFeePercent"
                type="number"
                step="any"
                min="0"
                max="20"
                defaultValue={asset?.annualFeePercent ?? 0}
              />
            </Field>
            <Field
              label="Revenus mensuels bruts estimés"
              hint="Loyers, intérêts ou dividendes moyens, dans la devise de saisie."
            >
              <input
                name="monthlyIncome"
                type="number"
                step="any"
                min="0"
                defaultValue={asset?.monthlyIncome ?? 0}
              />
            </Field>
          </>
        )}
      </div>
      <Field label="Notes (facultatif)">
        <textarea
          name="notes"
          maxLength={2000}
          defaultValue={asset?.notes || ""}
          placeholder="Votre méthode de valorisation, une échéance…"
        />
      </Field>
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
      <button className="primary-button" disabled={busy}>
        {busy
          ? "Enregistrement…"
          : asset
            ? "Enregistrer les modifications"
            : "Ajouter à mon patrimoine"}
      </button>
      <p className="fine-print">
        Valorisation manuelle. Vos données sont enregistrées uniquement dans
        votre compte.
      </p>
    </form>
  );
}
function GoalForm({ goal, onDone }: { goal?: Goal; onDone: () => void }) {
  const { mutate } = useWealth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const data = goalInput(Object.fromEntries(new FormData(e.currentTarget)));
      setBusy(true);
      await mutate(
        goal ? `/api/goals/${goal.id}` : "/api/goals",
        goal ? "PUT" : "POST",
        data,
      );
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="form-stack" onSubmit={submit}>
      <Field label="Votre projet">
        <input
          name="name"
          defaultValue={goal?.name}
          required
          maxLength={160}
          placeholder="Apport immobilier, retraite, voyage…"
        />
      </Field>
      <div className="form-grid">
        <Field label="Objectif en CHF">
          <input
            name="targetAmount"
            type="number"
            min="1"
            step="any"
            defaultValue={goal?.targetAmount}
            required
          />
        </Field>
        <Field label="Déjà épargné en CHF">
          <input
            name="currentAmount"
            type="number"
            min="0"
            step="any"
            defaultValue={goal?.currentAmount ?? 0}
            required
          />
        </Field>
        <Field label="Épargne mensuelle en CHF">
          <input
            name="monthlySaving"
            type="number"
            min="0"
            step="any"
            defaultValue={goal?.monthlySaving ?? 0}
            required
          />
        </Field>
        <Field label="Échéance">
          <input
            name="deadline"
            type="date"
            min="2000-01-01"
            max="2200-12-31"
            defaultValue={goal?.deadline.slice(0, 10)}
            required
          />
        </Field>
      </div>
      <p className="fine-print">
        Suivi manuel, sans rendement supposé. L’épargne déclarée ici n’ajoute
        aucun actif à votre patrimoine.
      </p>
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
      <button className="primary-button" disabled={busy}>
        {busy ? "Enregistrement…" : "Enregistrer l’objectif"}
      </button>
    </form>
  );
}
function ImportForm({ onDone }: { onDone: () => void }) {
  const { mutate } = useWealth();
  const [rows, setRows] = useState<ReturnType<typeof assetInput>[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="form-stack">
      <p className="muted">
        Importez jusqu’à 200 actifs. Chaque ligne ajoute un nouvel actif :
        réimporter le même fichier crée des doublons.
      </p>
      <button
        className="secondary-button"
        onClick={() =>
          download(
            "name,type,value,currency,quantity,buyingPrice,fxRate,annualFeePercent,monthlyIncome,institution\nETF Monde,ETF,10000,CHF,100,80,1,0.2,0,Courtier",
            "modele-actifs.csv",
          )
        }
      >
        Télécharger le modèle CSV
      </button>
      <Field label="Fichier CSV (séparateur virgule)">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={async (e) => {
            setError("");
            setRows([]);
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              if (f.size > 500000) throw new Error("Fichier trop volumineux.");
              const parsed = parseCsv(await f.text());
              setRows(
                parsed.map((r, i) => {
                  try {
                    return assetInput(r);
                  } catch (e) {
                    throw new Error(
                      `Ligne ${i + 2} : ${e instanceof Error ? e.message : "invalide"}`,
                    );
                  }
                }),
              );
            } catch (e) {
              setError(e instanceof Error ? e.message : "CSV invalide.");
            }
          }}
        />
      </Field>
      {rows.length > 0 && (
        <>
          <p>
            <strong>{rows.length} actifs validés</strong> — aperçu
          </p>
          <div className="import-preview">
            {rows.slice(0, 10).map((r, i) => (
              <div key={i}>
                {r.name}
                <span>{money(r.value, r.currency)}</span>
              </div>
            ))}
          </div>
          <button
            className="primary-button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await mutate("/api/assets/import", "POST", { rows });
                onDone();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Import impossible.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy
              ? "Import en cours…"
              : `Confirmer l’import de ${rows.length} actifs`}
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
    </div>
  );
}
export default function WealthApp({
  view = "overview",
  initialType,
  category,
}: {
  view?: View;
  initialType?: string;
  category?: string;
}) {
  const { data, loading, error, refresh, mutate, demo } = useWealth();
  const [modal, setModal] = useState<"asset" | "goal" | "import" | null>(null);
  const [editAsset, setEditAsset] = useState<WealthAsset>();
  const [editGoal, setEditGoal] = useState<Goal>();
  const [selectedType, setSelectedType] = useState(initialType);
  const [filter, setFilter] = useState(category || "ALL");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [period, setPeriod] = useState(0);
  const [now] = useState(() => Date.now());
  const sum = useMemo(() => summarize(data.assets), [data.assets]);
  const fmt = (n: number) => (hidden ? "••••••" : money(n));
  const openAsset = (a?: WealthAsset, type?: string) => {
    setEditAsset(a);
    setSelectedType(type);
    setModal("asset");
  };
  const openGoal = (g?: Goal) => {
    setEditGoal(g);
    setModal("goal");
  };
  const close = () => setModal(null);
  const done = () => {
    setModal(null);
    setNotice("Enregistré.");
  };
  const remove = async (kind: "assets" | "goals", id: string) => {
    if (!window.confirm("Supprimer cet élément ? Cette action est définitive."))
      return;
    setBusy(true);
    try {
      await mutate(`/api/${kind}/${id}`, "DELETE");
      setNotice("Élément supprimé.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };
  const title = {
    overview: "Votre patrimoine, en clair.",
    portfolio: "Tous vos actifs.",
    goals: "Donnez un cap à votre épargne.",
    insights: "Comprendre votre patrimoine.",
    budget: "Votre capacité d’épargne.",
    tools: "Dessinez votre avenir.",
    add: "Complétez votre patrimoine.",
  }[view];
  const filtered = data.assets.filter(
    (a) =>
      (filter === "ALL" || a.type === filter) &&
      (a.name + " " + a.institution)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const chart = data.snapshots.filter(
    (s) => !period || new Date(s.day).getTime() >= now - period * 86400000,
  );
  const allocation = Object.entries(sum.allocation).map(([type, value]) => ({
    name: assetTypes.find((t) => t.type === type)?.label || type,
    value,
    color: assetTypes.find((t) => t.type === type)?.color || "#94a3b8",
  }));
  if (loading)
    return (
      <div className="wealth-page">
        <p className="eyebrow">VOTRE ESPACE PERSONNEL</p>
        <h1>Chargement du patrimoine…</h1>
        <div className="skeleton-grid">
          {[1, 2, 3].map((i) => (
            <div className="skeleton" key={i} />
          ))}
        </div>
      </div>
    );
  if (error)
    return (
      <div className="wealth-page">
        <Panel>
          <AlertCircle />
          <h1>Impossible de charger vos données</h1>
          <p role="alert" className="error-box">
            {error}
          </p>
          <button className="primary-button" onClick={() => void refresh()}>
            Réessayer
          </button>
          <Link className="text-link" href="/sign-in">
            Se reconnecter
          </Link>
        </Panel>
      </div>
    );
  return (
    <div className={`wealth-page ${hidden ? "amounts-hidden" : ""}`}>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            FINTRACK / {demo ? "DÉMONSTRATION" : "ESPACE PERSONNEL"}
          </p>
          <h1>{title}</h1>
          <p className="muted">
            {view === "overview"
              ? "Une vue d’ensemble pour prendre vos prochaines décisions."
              : view === "tools"
                ? "Explorez des hypothèses, pas des promesses de rendement."
                : "Vos chiffres, vos projets, votre rythme."}
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="icon-button"
            title={hidden ? "Afficher les montants" : "Masquer les montants"}
            aria-label={
              hidden ? "Afficher les montants" : "Masquer les montants"
            }
            onClick={() => setHidden(!hidden)}
          >
            {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            className="primary-button"
            onClick={() => (view === "goals" ? openGoal() : openAsset())}
          >
            <Plus size={17} />
            {view === "goals" ? "Nouvel objectif" : "Ajouter un actif"}
          </button>
        </div>
      </div>
      {notice && (
        <div className="notice" role="status">
          <Check size={16} />
          {notice}
          <button aria-label="Fermer le message" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {sum.missing > 0 && (
        <p className="error-box">
          {sum.missing} actif(s) sans taux de change : ils sont exclus des
          totaux CHF. Modifiez-les pour compléter la conversion.
        </p>
      )}
      {view === "overview" && (
        <>
          {data.assets.length === 0 && (
            <Panel className="onboarding">
              <div>
                <span className="eyebrow">BIENVENUE CHEZ VOUS</span>
                <h2>Votre histoire financière commence ici.</h2>
                <p className="muted">
                  Ajoutez un compte, vos investissements ou votre prévoyance.
                  Chaque nouvel utilisateur démarre avec un patrimoine vide.
                </p>
              </div>
              <button className="primary-button" onClick={() => openAsset()}>
                Ajouter mon premier actif <ArrowRight size={16} />
              </button>
            </Panel>
          )}
          <div className="metric-grid">
            <Panel className="hero-metric">
              <p className="metric-label">
                Patrimoine net <span>CHF</span>
              </p>
              <div className="metric-value sensitive">{fmt(sum.net)}</div>
              <p className="muted">Actifs moins capital restant dû</p>
              <span className="metric-decoration" />
            </Panel>
            <Panel>
              <p className="metric-label">
                Patrimoine brut <Layers size={17} />
              </p>
              <div className="metric-value sensitive">{fmt(sum.gross)}</div>
              <p className="muted">
                {data.assets.filter((a) => a.type !== "DEBT").length} actifs
                suivis
              </p>
            </Panel>
            <Panel>
              <p className="metric-label">
                Dettes & hypothèques <ArrowDownRight size={17} />
              </p>
              <div className="metric-value sensitive">{fmt(sum.debt)}</div>
              <p className="muted">Capital restant à rembourser</p>
            </Panel>
          </div>
          <div className="chart-grid">
            <Panel>
              <div className="section-top">
                <div>
                  <p className="eyebrow">PRENDRE DU RECUL</p>
                  <h2>Évolution du patrimoine net</h2>
                </div>
                <div className="segmented">
                  {[
                    [30, "1M"],
                    [90, "3M"],
                    [0, "Tout"],
                  ].map(([p, label]) => (
                    <button
                      key={p}
                      className={period === p ? "selected" : ""}
                      onClick={() => setPeriod(Number(p))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`chart-area ${hidden ? "blurred" : ""}`}>
                {chart.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chart}>
                      <defs>
                        <linearGradient
                          id="netGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#6ee7b7"
                            stopOpacity={0.28}
                          />
                          <stop
                            offset="100%"
                            stopColor="#6ee7b7"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#252e39" />
                      <XAxis
                        dataKey="day"
                        tickFormatter={(s) => s.slice(5)}
                        stroke="#83909e"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#83909e"
                        fontSize={11}
                        tickFormatter={(n) => `${Math.round(n / 1000)}k`}
                        width={45}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v) => money(Number(v))}
                      />
                      <Area
                        type="monotone"
                        dataKey="net"
                        name="Patrimoine net"
                        stroke="#6ee7b7"
                        fill="url(#netGradient)"
                        strokeWidth={2.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-chart">
                    <TrendingUp size={32} />
                    <p>Votre historique se construit au fil du temps.</p>
                    <small>
                      Enregistrez un relevé aujourd’hui, puis revenez un autre
                      jour.
                    </small>
                  </div>
                )}
              </div>
              <div className="panel-footer">
                <span className="fine-print">
                  Relevés manuels, un par jour UTC. Variation de patrimoine ≠
                  performance.
                </span>
                <button
                  className="secondary-button"
                  disabled={busy || sum.missing > 0}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await mutate("/api/snapshots", "POST");
                      setNotice(
                        "Relevé du jour enregistré. Un relevé existant du même jour est actualisé.",
                      );
                    } catch (e) {
                      setNotice(e instanceof Error ? e.message : "Erreur");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <Camera size={15} />
                  Enregistrer un relevé
                </button>
              </div>
            </Panel>
            <Panel>
              <p className="eyebrow">VOTRE ÉQUILIBRE</p>
              <h2>Répartition des actifs</h2>
              {sum.gross > 0 ? (
                <>
                  <div className={`donut-wrap ${hidden ? "blurred" : ""}`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocation}
                          dataKey="value"
                          innerRadius={65}
                          outerRadius={88}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {allocation.map((a) => (
                            <Cell key={a.name} fill={a.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(v) => money(Number(v))}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-label">
                      <strong>{allocation.length}</strong>
                      <span>classes d’actifs</span>
                    </div>
                  </div>
                  <div className="allocation-legend">
                    {allocation.map((a) => (
                      <div key={a.name}>
                        <span>
                          <i style={{ background: a.color }} />
                          {a.name}
                        </span>
                        <strong>
                          {((a.value / sum.gross) * 100).toFixed(1)}%
                        </strong>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-chart">
                  <Layers />
                  <p>Aucun actif pour le moment.</p>
                </div>
              )}
            </Panel>
          </div>
          <div className="metric-grid">
            <Panel>
              <p className="metric-label">Plus-value latente connue</p>
              <h2
                className={`sensitive ${sum.gain >= 0 ? "positive" : "negative"}`}
              >
                {fmt(sum.gain)}
              </h2>
              <p className="fine-print">
                Uniquement les prix de revient renseignés. Conversion au taux
                manuel actuel ; hors effet de change historique.
              </p>
            </Panel>
            <Panel>
              <p className="metric-label">Revenus mensuels estimés</p>
              <h2 className="sensitive">{fmt(sum.income)}</h2>
              <p className="fine-print">
                Revenus bruts déclarés, avant frais et impôts.
              </p>
            </Panel>
            <Panel>
              <p className="metric-label">Frais annuels estimés</p>
              <h2 className="sensitive">{fmt(sum.fees)}</h2>
              <p className="fine-print">
                Valeur actuelle × taux de frais renseigné.
              </p>
            </Panel>
          </div>
        </>
      )}
      {(view === "portfolio" || view === "overview") && (
        <Panel>
          <div className="section-top">
            <div>
              <p className="eyebrow">INVENTAIRE</p>
              <h2>
                {view === "overview"
                  ? "Vos actifs & passifs"
                  : "Votre portefeuille"}
              </h2>
            </div>
            <div className="heading-actions">
              <button
                className="secondary-button"
                onClick={() => setModal("import")}
              >
                <Upload size={15} />
                Importer
              </button>
              <button
                className="secondary-button"
                disabled={!data.assets.length}
                onClick={() =>
                  download(exportCsv(data.assets), "fintrack-actifs.csv")
                }
              >
                <Download size={15} />
                Exporter
              </button>
            </div>
          </div>
          <div className="table-tools">
            <div className="search-field">
              <Search size={16} />
              <input
                aria-label="Rechercher un actif"
                placeholder="Rechercher un actif ou un établissement"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Filtrer par type"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">Tous les types</option>
              {assetTypes.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="asset-table">
            <div className="asset-table-head">
              <span>Actif / établissement</span>
              <span>Valeur d’origine</span>
              <span>Valeur en CHF</span>
              <span>Actions</span>
            </div>
            {filtered.map((a) => {
              const type = assetTypes.find((t) => t.type === a.type);
              const fx = rate(a);
              return (
                <div key={a.id} className="asset-row">
                  <div className="asset-identity">
                    <div
                      className="asset-monogram"
                      style={{
                        color: type?.color,
                        background: `${type?.color || "#94a3b8"}18`,
                      }}
                    >
                      {a.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong>{a.name}</strong>
                      <small>
                        {type?.label || a.type} · {a.institution || "Manuel"}
                      </small>
                    </div>
                  </div>
                  <div className="sensitive asset-native">
                    {hidden ? "••••" : money(a.value, a.currency)}
                  </div>
                  <div
                    className={`sensitive asset-base ${a.type === "DEBT" ? "negative" : ""}`}
                  >
                    {fx === null
                      ? "Taux manquant"
                      : fmt(a.value * fx * (a.type === "DEBT" ? -1 : 1))}
                    <small>
                      {a.updatedAt
                        ? new Date(a.updatedAt).toLocaleDateString("fr-CH")
                        : ""}
                    </small>
                  </div>
                  <div className="asset-actions">
                    <button
                      className="icon-button"
                      aria-label={`Modifier ${a.name}`}
                      onClick={() => openAsset(a)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-button danger"
                      aria-label={`Supprimer ${a.name}`}
                      disabled={busy}
                      onClick={() => void remove("assets", a.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="empty-chart">
                <Layers />
                <p>
                  {data.assets.length
                    ? "Aucun actif ne correspond à votre recherche."
                    : "Ajoutez votre premier actif pour commencer."}
                </p>
              </div>
            )}
          </div>
          <p className="fine-print mt-4">
            Les valorisations et taux de change sont renseignés manuellement.
            Aucun cours en temps réel n’est simulé.
          </p>
        </Panel>
      )}
      {view === "add" && (
        <>
          <div className="category-grid">
            {assetTypes.map((t) => (
              <button
                key={t.type}
                className="category-card"
                onClick={() => openAsset(undefined, t.type)}
              >
                <span
                  className="category-dot"
                  style={{ background: t.color }}
                />
                <h2>{t.label}</h2>
                <p className="muted">{t.hint}</p>
                <ArrowUpRight size={18} />
              </button>
            ))}
          </div>
          <Panel>
            <h2>Vous avez déjà un fichier ?</h2>
            <p className="muted">
              Importez vos positions depuis un CSV et vérifiez l’aperçu avant de
              confirmer.
            </p>
            <button
              className="secondary-button"
              onClick={() => setModal("import")}
            >
              <Upload size={16} />
              Importer un fichier CSV
            </button>
          </Panel>
          {initialType && (
            <Panel>
              <AssetForm
                type={initialType}
                onDone={() =>
                  setNotice("Actif ajouté. Retrouvez-le dans Mes actifs.")
                }
              />
            </Panel>
          )}
        </>
      )}
      {view === "goals" && (
        <>
          <p className="info-line">
            <Target size={17} />
            Les objectifs sont suivis séparément. Ils ne modifient pas les
            actifs et ne réservent pas automatiquement une somme.
          </p>
          <div className="goal-grid">
            {data.goals.map((g) => {
              const plan = goalPlan(g);
              return (
                <Panel key={g.id}>
                  <div className="section-top">
                    <span className="goal-icon">
                      <Target size={24} />
                    </span>
                    <div className="heading-actions">
                      <button
                        className="icon-button"
                        aria-label={`Modifier ${g.name}`}
                        onClick={() => openGoal(g)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        aria-label={`Supprimer ${g.name}`}
                        disabled={busy}
                        onClick={() => void remove("goals", g.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h2>{g.name}</h2>
                  <p className="muted">
                    Échéance :{" "}
                    {new Date(g.deadline).toLocaleDateString("fr-CH")}
                  </p>
                  <div className="goal-amount sensitive">
                    {fmt(g.currentAmount)}{" "}
                    <small>/ {fmt(g.targetAmount)}</small>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${plan.progress}%` }} />
                  </div>
                  <div className="section-top">
                    <strong>{plan.progress.toFixed(0)}%</strong>
                    <span className={plan.onTrack ? "positive" : "warning"}>
                      {plan.remaining === 0
                        ? "Objectif atteint"
                        : plan.months === 0
                          ? "Échéance dépassée"
                          : plan.onTrack
                            ? "Sur la trajectoire"
                            : "Effort à ajuster"}
                    </span>
                  </div>
                  <p className="fine-print">
                    {plan.months > 0
                      ? `${money(plan.required)} / mois nécessaires sans rendement, contre ${money(g.monthlySaving)} prévus.`
                      : `Reste à financer : ${money(plan.remaining)}.`}
                  </p>
                </Panel>
              );
            })}
            <button className="add-goal" onClick={() => openGoal()}>
              <Plus size={26} />
              <strong>Un nouveau projet</strong>
              <span>Voyage, logement, indépendance…</span>
            </button>
          </div>
        </>
      )}
      {view === "insights" && <Insights hidden={hidden} />}
      {view === "budget" && <Budget />}
      {view === "tools" && <Simulator />}
      {modal && (
        <Modal
          title={
            modal === "asset"
              ? editAsset
                ? "Modifier un actif"
                : "Ajouter un actif"
              : modal === "goal"
                ? editGoal
                  ? "Modifier un objectif"
                  : "Créer un objectif"
                : "Importer des actifs"
          }
          onClose={close}
        >
          {modal === "asset" ? (
            <AssetForm asset={editAsset} type={selectedType} onDone={done} />
          ) : modal === "goal" ? (
            <GoalForm goal={editGoal} onDone={done} />
          ) : (
            <ImportForm onDone={done} />
          )}
        </Modal>
      )}
    </div>
  );
}
function Insights({ hidden }: { hidden: boolean }) {
  const { data } = useWealth();
  const [now] = useState(() => Date.now());
  const s = summarize(data.assets);
  const largest = [...data.assets]
    .filter((a) => a.type !== "DEBT" && rate(a) !== null)
    .sort((a, b) => b.value * rate(b)! - a.value * rate(a)!)[0];
  const weight =
    largest && s.gross ? ((largest.value * rate(largest)!) / s.gross) * 100 : 0;
  const stale = data.assets.filter(
    (a) => a.updatedAt && now - new Date(a.updatedAt).getTime() > 90 * 86400000,
  );
  const cash = data.assets
    .filter((a) => a.type === "BANKING")
    .reduce((n, a) => n + (rate(a) === null ? 0 : a.value * rate(a)!), 0);
  return (
    <>
      <div className="metric-grid">
        <Panel>
          <p className="metric-label">Actifs financiers mobilisables</p>
          <h2 className={hidden ? "blurred" : ""}>{money(s.liquid)}</h2>
          <p className="fine-print">
            Comptes, titres cotés, crypto et métaux. La liquidité réelle dépend
            du produit.
          </p>
        </Panel>
        <Panel>
          <p className="metric-label">Poids de la première position</p>
          <h2>{weight.toFixed(1)}%</h2>
          <p className="muted">{largest?.name || "Aucun actif"}</p>
        </Panel>
        <Panel>
          <p className="metric-label">Mois de dépenses en liquidités</p>
          <h2>
            {data.monthlyExpenses > 0
              ? (cash / data.monthlyExpenses).toFixed(1)
              : "—"}
          </h2>
          <p className="fine-print">
            Comptes bancaires ÷ dépenses mensuelles déclarées.
          </p>
        </Panel>
      </div>
      <Panel>
        <h2>Points à examiner</h2>
        <div className="insight-list">
          <div>
            <AlertCircle />
            <span>
              <strong>Concentration</strong>
              <p>
                {weight > 30
                  ? `Votre première position représente ${weight.toFixed(1)} % des actifs connus. Vérifiez si cela correspond à votre stratégie.`
                  : "Aucune position ne dépasse 30 % des actifs connus. Cela ne mesure pas les expositions internes des fonds."}
              </p>
            </span>
          </div>
          <div>
            <Camera />
            <span>
              <strong>Qualité des valorisations</strong>
              <p>
                {stale.length
                  ? `${stale.length} actif(s) n’ont pas été actualisés depuis plus de 90 jours.`
                  : "Aucune valorisation connue ne date de plus de 90 jours."}
              </p>
            </span>
          </div>
          <div>
            <Wallet />
            <span>
              <strong>Coût du portefeuille</strong>
              <p className={hidden ? "blurred" : ""}>
                {money(s.fees)} de frais annuels estimés. Les frais non
                renseignés ne sont pas inclus.
              </p>
            </span>
          </div>
        </div>
      </Panel>
      <Panel>
        <h2>Exposition par établissement</h2>
        <div className="allocation-legend">
          {Object.entries(s.institutions)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => (
              <div key={name}>
                <span>{name}</span>
                <strong>
                  {s.gross ? ((value / s.gross) * 100).toFixed(1) : 0}%
                </strong>
              </div>
            ))}
        </div>
        <p className="fine-print mt-4">
          Indicateurs descriptifs, sans recommandation d’achat ou de vente.
        </p>
      </Panel>
    </>
  );
}
function Budget() {
  const { data, mutate } = useWealth();
  const [income, setIncome] = useState(data.monthlyIncome);
  const [expenses, setExpenses] = useState(data.monthlyExpenses);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = income - expenses;
  return (
    <div className="chart-grid">
      <Panel>
        <h2>Un budget mensuel simple</h2>
        <p className="muted">
          Saisissez vos revenus nets et dépenses habituelles. Ces montants ne
          créent pas d’opérations bancaires.
        </p>
        <form
          className="form-stack mt-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await mutate("/api/wealth", "PATCH", {
                monthlyIncome: income,
                monthlyExpenses: expenses,
              });
              setMessage("Budget enregistré.");
            } catch (e) {
              setMessage(e instanceof Error ? e.message : "Erreur");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="Revenus nets mensuels (CHF)">
            <input
              type="number"
              min="0"
              max="1000000000000"
              step="any"
              required
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
            />
          </Field>
          <Field label="Dépenses mensuelles (CHF)">
            <input
              type="number"
              min="0"
              max="1000000000000"
              step="any"
              required
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
            />
          </Field>
          <button className="primary-button" disabled={busy}>
            {busy ? "Enregistrement…" : "Enregistrer le budget"}
          </button>
          {message && <p role="status">{message}</p>}
        </form>
      </Panel>
      <Panel className="hero-metric">
        <p className="eyebrow">VOTRE MARGE DE MANŒUVRE</p>
        <h2 className={`budget-total ${saving < 0 ? "negative" : "positive"}`}>
          {money(saving)}
        </h2>
        <p className="muted">Capacité d’épargne mensuelle</p>
        <div className="budget-stat">
          <span>Taux d’épargne</span>
          <strong>
            {income > 0 ? ((saving / income) * 100).toFixed(1) + " %" : "—"}
          </strong>
        </div>
        <div className="budget-stat">
          <span>Sur une année, à rythme constant</span>
          <strong>{money(saving * 12)}</strong>
        </div>
        <div className="budget-stat">
          <span>Versements prévus dans vos objectifs</span>
          <strong>
            {money(data.goals.reduce((n, g) => n + g.monthlySaving, 0))}
          </strong>
        </div>
        {data.goals.reduce((n, g) => n + g.monthlySaving, 0) > saving && (
          <p className="warning">
            Vos objectifs prévoient plus d’épargne que votre budget disponible.
          </p>
        )}
      </Panel>
    </div>
  );
}
function Simulator() {
  const { data } = useWealth();
  const s = summarize(data.assets);
  const [initial, setInitial] = useState(Math.max(0, s.liquid));
  const [monthly, setMonthly] = useState(
    Math.max(0, data.monthlyIncome - data.monthlyExpenses),
  );
  const [years, setYears] = useState(20);
  const [annual, setAnnual] = useState(5);
  const [fees, setFees] = useState(0.3);
  const [inflation, setInflation] = useState(2);
  const [volatility, setVolatility] = useState(15);
  const [mode, setMode] = useState("deterministic");
  const rows = useMemo(
    () => project(initial, monthly, years, annual, fees, inflation),
    [initial, monthly, years, annual, fees, inflation],
  );
  const monte = useMemo(
    () => monteCarlo(initial, monthly, years, annual, volatility, fees),
    [initial, monthly, years, annual, volatility, fees],
  );
  const last = rows.at(-1)!;
  return (
    <>
      <div className="simulation-layout">
        <Panel>
          <p className="eyebrow">VOS HYPOTHÈSES</p>
          <h2>Les leviers de votre trajectoire</h2>
          <div className="form-stack mt-6">
            <Field label="Capital de départ (CHF)">
              <input
                type="number"
                value={initial}
                min="0"
                max="1000000000"
                onChange={(e) =>
                  setInitial(Math.min(1e9, Math.max(0, Number(e.target.value))))
                }
              />
            </Field>
            <Field label="Versement en fin de mois (CHF)">
              <input
                type="number"
                value={monthly}
                min="0"
                max="1000000"
                onChange={(e) =>
                  setMonthly(Math.min(1e6, Math.max(0, Number(e.target.value))))
                }
              />
            </Field>
            {[
              {
                label: "Horizon",
                value: years,
                set: setYears,
                min: 1,
                max: 50,
                step: 1,
                unit: "ans",
              },
              {
                label: "Rendement annuel brut",
                value: annual,
                set: setAnnual,
                min: -10,
                max: 20,
                step: 0.5,
                unit: "%",
              },
              {
                label: "Frais annuels",
                value: fees,
                set: setFees,
                min: 0,
                max: 5,
                step: 0.1,
                unit: "%",
              },
              {
                label: "Inflation annuelle",
                value: inflation,
                set: setInflation,
                min: 0,
                max: 10,
                step: 0.5,
                unit: "%",
              },
            ].map((f) => (
              <Field key={f.label} label={`${f.label} : ${f.value} ${f.unit}`}>
                <input
                  aria-label={f.label}
                  type="range"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={f.value}
                  onChange={(e) => f.set(Number(e.target.value))}
                />
              </Field>
            ))}
            {mode === "monte" && (
              <Field label={`Volatilité annuelle : ${volatility} %`}>
                <input
                  aria-label="Volatilité"
                  type="range"
                  min="0"
                  max="50"
                  value={volatility}
                  onChange={(e) => setVolatility(Number(e.target.value))}
                />
              </Field>
            )}
          </div>
        </Panel>
        <Panel>
          <div className="section-top">
            <div>
              <p className="eyebrow">LE TEMPS FAIT SON ŒUVRE</p>
              <h2>Projection sur {years} ans</h2>
            </div>
            <div className="segmented">
              <button
                className={mode === "deterministic" ? "selected" : ""}
                onClick={() => setMode("deterministic")}
              >
                Trajectoire
              </button>
              <button
                className={mode === "monte" ? "selected" : ""}
                onClick={() => setMode("monte")}
              >
                Monte Carlo
              </button>
            </div>
          </div>
          <div className="projection-total">
            {money(mode === "monte" ? monte.at(-1)!.median : last.value)}
          </div>
          <p className="muted">
            {mode === "monte"
              ? "Médiane des 400 simulations"
              : "Capital final nominal estimé"}
          </p>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mode === "monte" ? monte : rows}>
                <CartesianGrid stroke="#252e39" vertical={false} />
                <XAxis dataKey="year" stroke="#83909e" fontSize={11} />
                <YAxis
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  stroke="#83909e"
                  fontSize={11}
                  width={45}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => money(Number(v))}
                />
                {mode === "monte" ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="high"
                      name="90e percentile"
                      stroke="#a78bfa"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="median"
                      name="Médiane"
                      stroke="#6ee7b7"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="low"
                      name="10e percentile"
                      stroke="#fb923c"
                      dot={false}
                    />
                  </>
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Capital nominal"
                      stroke="#6ee7b7"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="invested"
                      name="Capital versé"
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="real"
                      name="Pouvoir d’achat actuel"
                      stroke="#a78bfa"
                      dot={false}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="projection-legend">
            <span>
              <i style={{ background: "#6ee7b7" }} />
              {mode === "monte" ? "Médiane" : "Capital nominal"}
            </span>
            <span>
              <i style={{ background: "#a78bfa" }} />
              {mode === "monte" ? "90e percentile" : "Pouvoir d’achat"}
            </span>
            <span>
              <i style={{ background: "#fb923c" }} />
              {mode === "monte"
                ? "10e percentile"
                : "Versements : " + money(last.invested)}
            </span>
          </div>
          <p className="fine-print mt-6">
            {mode === "monte"
              ? "400 trajectoires lognormales à volatilité constante, versements mensuels et frais inclus. Percentiles nominaux ; inflation non appliquée dans ce mode. Le modèle ne représente pas tous les risques ni les pertes extrêmes."
              : "Capitalisation mensuelle, versements en fin de mois, frais déduits. La courbe de pouvoir d’achat tient compte de l’inflation choisie."}{" "}
            Hypothèses libres, sans fiscalité ni garantie. Aucun ordre
            d’investissement n’est passé.
          </p>
        </Panel>
      </div>
    </>
  );
}
