// Money is stored in minor units (SPEC-215); the API's currencies are 2-decimal
// (ARS). Format for the es-AR locale, degrading gracefully if the currency code
// is unknown.
export function formatMoney(minorUnits: number, currency: string): string {
  const major = minorUnits / 100;
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${major.toFixed(2)} ${currency}`;
  }
}

// "Hace 12 min" style elapsed label from an ISO timestamp.
export function elapsedLabel(iso: string, now: number): string {
  const started = new Date(iso).getTime();
  const mins = Math.max(0, Math.floor((now - started) / 60000));
  if (mins < 1) return "recién";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `hace ${hours} h` : `hace ${hours} h ${rem} min`;
}
