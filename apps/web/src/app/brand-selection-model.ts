export function brandSelectionStorageKey(tenantId: string): string {
  return `maitre.selectedBrandId.${tenantId}`;
}

export function resolveSelectedBrandId(
  selectedBrandId: string | null,
  availableBrandIds: readonly string[],
): string | null {
  return selectedBrandId && availableBrandIds.includes(selectedBrandId)
    ? selectedBrandId
    : null;
}
