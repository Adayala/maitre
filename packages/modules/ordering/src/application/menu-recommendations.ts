// Menu recommendations (SPEC-092). Deterministic fallback ONLY — there is no ML
// ranking. Documented deferral: `policyVersion` is always "fallback-v1" and the
// response declares the degraded mode. Sensitive dietary restrictions are
// processed ephemerally here (never persisted, never profiled) — this pure
// function takes already-read published products from the route layer (Catalog
// stays decoupled) and returns a stable, deterministic ordering.

export interface RecommendationCandidate {
  productId: string;
  name: string;
  priceMinorUnits: number;
  categoryId: string;
  available: boolean;
}

export interface RecommendationFilters {
  categoryId?: string;
  maxBudgetMinorUnits?: number;
  sortBy?: "name" | "price";
}

export interface RecommendationItem {
  productId: string;
  name: string;
  priceMinorUnits: number;
  rank: number;
  reasonCodes: string[];
}

export interface RecommendationResult {
  policyVersion: "fallback-v1";
  degraded: true;
  note: string;
  items: RecommendationItem[];
}

export function recommendMenuItems(
  candidates: RecommendationCandidate[],
  filters: RecommendationFilters = {},
): RecommendationResult {
  const filtered = candidates.filter(
    (c) =>
      c.available &&
      (!filters.categoryId || c.categoryId === filters.categoryId) &&
      (filters.maxBudgetMinorUnits === undefined || c.priceMinorUnits <= filters.maxBudgetMinorUnits),
  );

  const sortBy = filters.sortBy ?? "name";
  const sorted = [...filtered].sort((a, b) =>
    sortBy === "price"
      ? a.priceMinorUnits - b.priceMinorUnits || a.name.localeCompare(b.name)
      : a.name.localeCompare(b.name),
  );

  const items: RecommendationItem[] = sorted.map((c, index) => {
    const reasonCodes = ["AVAILABLE"];
    if (filters.categoryId) reasonCodes.push("MATCHES_CATEGORY");
    if (filters.maxBudgetMinorUnits !== undefined) reasonCodes.push("WITHIN_BUDGET");
    return { productId: c.productId, name: c.name, priceMinorUnits: c.priceMinorUnits, rank: index + 1, reasonCodes };
  });

  return {
    policyVersion: "fallback-v1",
    degraded: true,
    note: "Deterministic catalog-order fallback; no ML ranking is available.",
    items,
  };
}
