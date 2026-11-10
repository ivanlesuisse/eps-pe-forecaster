export class InvalidAssetInput extends Error {}

export function finiteNumber(value: unknown, field: string): number {
  if ((typeof value !== "number" && typeof value !== "string") ||
      (typeof value === "string" && value.trim() === "")) {
    throw new InvalidAssetInput(`${field} must be a finite number`);
  }
  const number = Number(value);
  if (!Number.isFinite(number)) throw new InvalidAssetInput(`${field} must be a finite number`);
  return number;
}

export function optionalNumber(value: unknown, field: string): number | null {
  return value === undefined || value === null || value === "" ? null : finiteNumber(value, field);
}

export function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) throw new InvalidAssetInput(`${field} is required`);
  return value.trim();
}
