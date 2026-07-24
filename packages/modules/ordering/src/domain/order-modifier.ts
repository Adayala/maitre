// SPEC-083 — OrderModifier value object, embedded in an OrderItem snapshot.
//
// SCOPE NOTE (approved "CRUD simple + invariantes clave"): this captures the
// minimum needed to reconstruct the guest's intention and price it. The full
// SPEC-083 model (group min/max/exclusivity validation against the catalog
// revision at submit, boolean-vs-explicit quantity rules, typed kitchen
// routing metadata, sanitized free-text kitchen instructions) is deferred —
// modifiers are captured as already-validated snapshots supplied by the route
// layer (which reads Catalog), the same decoupling used for the item snapshot.

export interface OrderModifier {
  id: string;
  groupCode: string;
  optionId: string;
  label: string;
  quantity: number;
  priceDeltaMinorUnits: number; // signed net delta, same currency as the item
}

export function modifierDeltaTotal(modifier: OrderModifier): number {
  return modifier.priceDeltaMinorUnits * modifier.quantity;
}
