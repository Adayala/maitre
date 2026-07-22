/**
 * Strips keys whose value is `undefined` (as Zod's `.optional()` produces
 * `key?: T | undefined` on parsed objects). Needed because domain types use
 * `exactOptionalPropertyTypes` — spreading a Zod-parsed partial directly onto
 * them would type-error or write `undefined` fields that violate the schema.
 */
type WithoutUndefined<T> = { [K in keyof T]-?: Exclude<T[K], undefined> };

export function omitUndefined<T extends object>(obj: T): WithoutUndefined<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[key] = value;
  }
  return result as WithoutUndefined<T>;
}
