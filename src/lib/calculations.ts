/**
 * Calculation utilities for P&L (Profit & Loss) and portfolio metrics
 */

export interface AssetWithMetrics {
  id: string;
  name: string;
  type: string;
  category: string;
  value: number;
  quantity: number | null;
  buyingPrice: number | null;
  currency: string;
  createdAt: Date;
}

/**
 * Calculate unrealized gain/loss for a single asset
 */
export function calculateUnrealizedGain(
  currentValue: number,
  buyingPrice: number | null,
  quantity: number | null
): number {
  if (buyingPrice == null || quantity == null) {
    // If no buying price/quantity, we can't calculate unrealized gains
    return 0;
  }

  const totalCost = buyingPrice * quantity;
  return currentValue - totalCost;
}

/**
 * Calculate unrealized gain/loss percentage for a single asset
 */
export function calculateGainPercentage(
  currentValue: number,
  buyingPrice: number | null,
  quantity: number | null
): number {
  if (buyingPrice == null || quantity == null) {
    return 0;
  }

  const totalCost = buyingPrice * quantity;
  if (totalCost === 0) return 0;

  return ((currentValue - totalCost) / totalCost) * 100;
}

/**
 * Calculate portfolia metrics across all assets
 */
export function calculatePortfolioMetrics(assets: AssetWithMetrics[]) {
  let totalValue = 0;
  let totalInvested = 0;
  let totalGain = 0;
  const assetsByCategory: Record<string, number> = {};
  const assetsByType: Record<string, number> = {};

  assets.forEach((asset) => {
    // Total value
    totalValue += asset.value;

    // Total invested
    if (asset.buyingPrice != null && asset.quantity != null) {
      const cost = asset.buyingPrice * asset.quantity;
      totalInvested += cost;
      totalGain += calculateUnrealizedGain(asset.value, asset.buyingPrice, asset.quantity);
    } else {
      totalInvested += asset.value;
    }

    // By category
    assetsByCategory[asset.category] = (assetsByCategory[asset.category] || 0) + asset.value;

    // By type
    assetsByType[asset.type] = (assetsByType[asset.type] || 0) + asset.value;
  });

  const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalInvested,
    totalGain,
    gainPercentage,
    assetsByCategory,
    assetsByType,
  };
}

/**
 * Calculate allocation percentages by category
 */
export function calculateAllocationByCategory(
  assets: AssetWithMetrics[]
): Record<string, { value: number; percentage: number }> {
  const result: Record<string, { value: number; percentage: number }> = {};
  let totalValue = 0;

  // First pass: calculate total value
  assets.forEach((asset) => {
    totalValue += asset.value;
  });

  // Second pass: calculate percentages and group by category
  assets.forEach((asset) => {
    if (!result[asset.category]) {
      result[asset.category] = { value: 0, percentage: 0 };
    }
    result[asset.category].value += asset.value;
  });

  // Third pass: calculate percentages
  Object.keys(result).forEach((category) => {
    result[category].percentage = totalValue > 0 
      ? (result[category].value / totalValue) * 100 
      : 0;
  });

  return result;
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency: string = "CHF"): string {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value).toFixed(decimals)}%`;
}

/**
 * Get color for gain/loss (green if positive, red if negative)
 */
export function getGainLossColor(gain: number): "green" | "red" | "gray" {
  if (gain > 0) return "green";
  if (gain < 0) return "red";
  return "gray";
}

/**
 * Get color class for Tailwind (green if positive, red if negative)
 */
export function getGainLossColorClass(gain: number): string {
  if (gain > 0) return "text-green-500";
  if (gain < 0) return "text-red-500";
  return "text-zinc-400";
}

/**
 * Get background color class for Tailwind (green if positive, red if negative)
 */
export function getGainLossBgClass(gain: number): string {
  if (gain > 0) return "bg-green-500/10";
  if (gain < 0) return "bg-red-500/10";
  return "bg-zinc-500/10";
}

/**
 * Group assets by type
 */
export function groupAssetsByType(assets: AssetWithMetrics[]): Record<string, AssetWithMetrics[]> {
  const grouped: Record<string, AssetWithMetrics[]> = {};

  assets.forEach((asset) => {
    if (!grouped[asset.type]) {
      grouped[asset.type] = [];
    }
    grouped[asset.type].push(asset);
  });

  return grouped;
}
