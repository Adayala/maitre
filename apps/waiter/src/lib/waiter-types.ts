// Client-side mirrors of the API shapes the Waiter app consumes. Only the
// fields the UI reads are declared. Kept in sync by hand with the domain
// modules (@maitre/floor, @maitre/ordering, @maitre/catalog, @maitre/organization).

export interface ApiData<T> {
  data: T;
}

// ---- Organization (Salon / Table) — SPEC-005/006 ----------------------
export interface Salon {
  id: string;
  name: string;
  branchId: string;
}

export interface Table {
  id: string;
  salonId: string;
  branchId: string;
  number: string;
  name?: string;
  capacity: number;
}

// ---- Floor: TableStatus projection — SPEC-051/057 ---------------------
export type TableStatusValue =
  | "BLOCKED"
  | "OCCUPIED"
  | "PAYING"
  | "CLEANING"
  | "RESERVED"
  | "AVAILABLE";

export interface TableStatusProjection {
  tableId: string;
  status: TableStatusValue;
  relatedVisitId?: string;
  relatedReservationId?: string;
  asOf: string;
}

// ---- Floor: Visit — SPEC-049 ------------------------------------------
export type VisitStatus = "OPEN" | "CLOSING" | "CLOSED" | "CANCELLED";

export interface Visit {
  id: string;
  tenantId: string;
  branchId: string;
  tableIds: string[];
  guestCount: number;
  reservationId?: string;
  status: VisitStatus;
  revision: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Floor: Check — SPEC-052/058 --------------------------------------
export type CheckStatus = "OPEN" | "PAYMENT_PENDING" | "SETTLED" | "VOID";

export interface CheckLine {
  id: string;
  description: string;
  amountMinorUnits: number;
}

export interface CheckTotals {
  gross: number;
  discounts: number;
  estimatedTax: number;
  serviceCharges: number;
  netDue: number;
  paid: number;
  balance: number;
}

export interface Check {
  id: string;
  tenantId: string;
  visitId: string;
  currency: string;
  lines: CheckLine[];
  status: CheckStatus;
  revision: number;
  totals: CheckTotals;
  paymentsSummary: {
    count: number;
    capturedCount: number;
    refundCount: number;
    paidMinorUnits: number;
  };
}

// ---- Ordering: Order / OrderItem — SPEC-081/082 -----------------------
export type OrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_PREP"
  | "READY"
  | "PARTIALLY_DELIVERED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderItemStatus = "QUEUED" | "IN_PREP" | "READY" | "DELIVERED" | "CANCELLED";

export interface OrderModifier {
  id: string;
  label: string;
  priceDeltaMinorUnits: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPriceMinorUnits: number;
  currency: string;
  modifiers: OrderModifier[];
  allergens: string[];
  notes?: string;
  status: OrderItemStatus;
}

export interface Order {
  id: string;
  tenantId: string;
  branchId: string;
  visitId: string;
  currency: string;
  items: OrderItem[];
  status: OrderStatus;
  notes?: string;
  subtotalMinorUnits: number;
  grandTotalMinorUnits: number;
  revision: number;
  createdAt: string;
}

// ---- Catalog: Menu / Category / Product — SPEC-037/038/039 ------------
export type ProductStatus = "AVAILABLE" | "UNAVAILABLE" | "ARCHIVED";

export interface Menu {
  id: string;
  brandId: string;
  name: string;
  isDefault: boolean;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

export interface Category {
  id: string;
  menuId: string;
  name: string;
  displayOrder: number;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  priceMinorUnits: number;
  currency: string;
  status: ProductStatus;
  allergens: string[];
  displayOrder: number;
}

export interface Branch {
  id: string;
  brandId: string;
  name: string;
  code: string;
}
