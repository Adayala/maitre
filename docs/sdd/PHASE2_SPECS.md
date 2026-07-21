# Phase 2 Specs — Operational Domains (SPEC-049 to SPEC-136)

**Total Phase 2 Specs:** 88 specs across 8 operational domains

---

## Domain Structure

### 1. Floor Domain (SPEC-049 to SPEC-065) — 17 specs

**Entities (6):**
- SPEC-049: Visit Entity
- SPEC-050: Occupancy Entity
- SPEC-051: Table Status (derived)
- SPEC-052: Check/Bill Entity
- SPEC-053: Payment Entity
- SPEC-054: Service Entity

**APIs (6):**
- SPEC-055: Visits API
- SPEC-056: Occupancy API
- SPEC-057: Table Status API
- SPEC-058: Checks API
- SPEC-059: Payments API
- SPEC-060: Services API

**Events (4):**
- SPEC-061: VisitOpened Event
- SPEC-062: VisitClosed Event
- SPEC-063: PaymentProcessed Event
- SPEC-064: CheckGenerated Event

**Authorization (1):**
- SPEC-065: Floor RBAC

---

### 2. Reservations Domain (SPEC-066 to SPEC-080) — 15 specs

**Entities (5):**
- SPEC-066: Reservation Entity
- SPEC-067: Guest Entity
- SPEC-068: WaitList Entity
- SPEC-069: ReservationPreference Entity
- SPEC-070: CancellationPolicy Entity

**APIs (5):**
- SPEC-071: Reservations API
- SPEC-072: Guests API
- SPEC-073: WaitList API
- SPEC-074: Availability API
- SPEC-075: ReservationNotifications API

**Events (3):**
- SPEC-076: ReservationCreated Event
- SPEC-077: ReservationConfirmed Event
- SPEC-078: ReservationCancelled Event

**Business Logic (1):**
- SPEC-079: Capacity Calculator

**Authorization (1):**
- SPEC-080: Reservations RBAC

---

### 3. Ordering Domain (SPEC-081 to SPEC-097) — 17 specs

**Entities (6):**
- SPEC-081: Order Entity
- SPEC-082: OrderItem Entity
- SPEC-083: OrderModifier Entity
- SPEC-084: QRMenu Entity
- SPEC-085: DigitalBill Entity
- SPEC-086: KitchenTicket Entity

**APIs (7):**
- SPEC-087: Orders API
- SPEC-088: QRMenu API
- SPEC-089: OrderModifications API
- SPEC-090: DigitalBill API
- SPEC-091: OrderTracking API
- SPEC-092: MenuRecommendations API
- SPEC-093: SpecialRequests API

**Events (3):**
- SPEC-094: OrderPlaced Event
- SPEC-095: OrderReady Event
- SPEC-096: OrderDelivered Event

**Authorization (1):**
- SPEC-097: Ordering RBAC

---

### 4. Kitchen Domain (SPEC-098 to SPEC-110) — 13 specs

**Entities (4):**
- SPEC-098: Command Entity (Comanda)
- SPEC-099: Station Entity
- SPEC-100: ProductionQueue Entity
- SPEC-101: KitchenAlert Entity

**APIs (4):**
- SPEC-102: Commands API
- SPEC-103: Stations API
- SPEC-104: Production API
- SPEC-105: KitchenAlerts API

**Events (3):**
- SPEC-106: CommandReceived Event
- SPEC-107: CommandInProgress Event
- SPEC-108: CommandCompleted Event

**Authorization (1):**
- SPEC-109: Kitchen RBAC

**Workflow (1):**
- SPEC-110: Kitchen Workflow State Machine

---

### 5. Shifts Domain (SPEC-111 to SPEC-123) — 13 specs

**Entities (4):**
- SPEC-111: Shift Entity
- SPEC-112: ShiftAssignment Entity
- SPEC-113: TimeEntry Entity
- SPEC-114: BreakLog Entity

**APIs (4):**
- SPEC-115: Shifts API
- SPEC-116: ShiftAssignments API
- SPEC-117: TimeTracking API
- SPEC-118: BreakManagement API

**Events (2):**
- SPEC-119: ShiftStarted Event
- SPEC-120: ShiftEnded Event

**Calculations (1):**
- SPEC-121: Payroll Calculator

**Authorization (1):**
- SPEC-122: Shifts RBAC

**Rules (1):**
- SPEC-123: Labor Rules & Compliance

---

### 6. Cash Domain (SPEC-124 to SPEC-136) — 13 specs

**Entities (4):**
- SPEC-124: CashRegister Entity
- SPEC-125: CashMovement Entity
- SPEC-126: CashReconciliation Entity
- SPEC-127: Discount Entity

**APIs (4):**
- SPEC-128: CashRegister API
- SPEC-129: CashMovement API
- SPEC-130: Reconciliation API
- SPEC-131: Discounts API

**Events (2):**
- SPEC-132: CashRegistered Event
- SPEC-133: CashReconciled Event

**Calculations (1):**
- SPEC-134: Daily Settlement Calculator

**Authorization (1):**
- SPEC-135: Cash RBAC

**Compliance (1):**
- SPEC-136: Cash Compliance Rules

---

## Phase 3 Preview (SPEC-137+)

**Billing & Fiscal (20+ specs)**
- Invoice generation
- ARCA integration
- Fiscal printers
- Tax compliance

**Feedback & Reputation (15+ specs)**
- Guest feedback
- Review aggregation
- External platforms (Google, Yelp)

**Integrations (15+ specs)**
- Payment providers
- Accounting software
- POS systems

**Analytics & BI (20+ specs)**
- Data warehouse
- Dashboards
- Predictive models
- AI/ML features

**Total remaining: ~70+ specs for Phases 3-4**

---

## Implementation Sequence

**Phase 2 can run parallel to Phase 1 implementation or immediately after.**

### Critical Path:
1. Floor (foundation for all operations)
2. Reservations (depends on Floor)
3. Ordering (depends on Floor, Catalog)
4. Kitchen (depends on Ordering)
5. Shifts (depends on Organization)
6. Cash (depends on Floor, Ordering)

### Estimated Phase 2 Implementation:
- **Total specs:** 88
- **Total docs:** 704 (88 × 8)
- **Estimated hours:** ~400-500
- **Duration:** ~8-10 weeks serial

---

## Next: Begin writing Phase 2 specs

Ready to proceed with SPEC-049 onwards.
