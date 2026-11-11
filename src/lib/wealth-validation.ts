import { assetTypes, currencies } from "./wealth";
import {
  InvalidAssetInput,
  finiteNumber,
  optionalNumber,
  requiredText,
} from "./asset-input";
export function bounded(v: unknown, field: string, min = 0, max = 1e12) {
  const n = finiteNumber(v, field);
  if (n < min || n > max)
    throw new InvalidAssetInput(
      `${field} doit être compris entre ${min} et ${max}.`,
    );
  return n;
}
export function text(v: unknown, field: string, max = 160) {
  const s = requiredText(v, field);
  if (s.length > max) throw new InvalidAssetInput(`${field} est trop long.`);
  return s;
}
export function assetInput(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new InvalidAssetInput("Formulaire invalide.");
  const b = body as Record<string, unknown>;
  const type = text(b.type, "Type");
  if (!assetTypes.some((t) => t.type === type))
    throw new InvalidAssetInput("Type d’actif inconnu.");
  const currency = text(b.currency ?? "CHF", "Devise").toUpperCase();
  if (!(currencies as readonly string[]).includes(currency))
    throw new InvalidAssetInput("Devise non prise en charge.");
  const fx = optionalNumber(b.fxRate, "Taux de change");
  if (currency !== "CHF" && (fx === null || fx <= 0 || fx > 1e6))
    throw new InvalidAssetInput(
      "Indiquez un taux de conversion vers CHF supérieur à zéro.",
    );
  const buyingPrice = optionalNumber(b.buyingPrice, "Prix de revient");
  if (buyingPrice !== null && (buyingPrice < 0 || buyingPrice > 1e12))
    throw new InvalidAssetInput("Prix de revient invalide.");
  return {
    name: text(b.name, "Nom"),
    type,
    category: text(b.category || type, "Catégorie"),
    institution:
      typeof b.institution === "string"
        ? b.institution.trim().slice(0, 160)
        : "",
    value: bounded(b.value, "Valeur"),
    quantity: bounded(b.quantity ?? 1, "Quantité", 0, 1e12),
    buyingPrice,
    currency,
    fxRate: currency === "CHF" ? 1 : fx,
    annualFeePercent: bounded(b.annualFeePercent ?? 0, "Frais annuels", 0, 20),
    monthlyIncome: bounded(b.monthlyIncome ?? 0, "Revenus mensuels"),
    notes: typeof b.notes === "string" ? b.notes.slice(0, 2000) : null,
  };
}
export function goalInput(body: Record<string, unknown>) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new InvalidAssetInput("Objectif invalide.");
  const deadline = new Date(String(body.deadline));
  if (
    !Number.isFinite(deadline.getTime()) ||
    deadline.getUTCFullYear() < 2000 ||
    deadline.getUTCFullYear() > 2200
  )
    throw new InvalidAssetInput("Date invalide.");
  return {
    name: text(body.name, "Nom"),
    targetAmount: bounded(body.targetAmount, "Objectif", 1),
    currentAmount: bounded(body.currentAmount ?? 0, "Montant actuel"),
    monthlySaving: bounded(body.monthlySaving ?? 0, "Épargne mensuelle"),
    deadline,
  };
}
