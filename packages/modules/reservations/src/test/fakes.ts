import type { Reservation } from "../domain/reservation.js";
import type { Guest } from "../domain/guest.js";
import type { WaitlistEntry } from "../domain/waitlist-entry.js";
import type { ReservationPreference } from "../domain/reservation-preference.js";
import type { CancellationPolicy } from "../domain/cancellation-policy.js";
import type { NotificationIntent } from "../domain/notification-intent.js";
import type {
  ReservationRepositoryPort,
  GuestRepositoryPort,
  WaitlistEntryRepositoryPort,
  ReservationPreferenceRepositoryPort,
  CancellationPolicyRepositoryPort,
  NotificationIntentRepositoryPort,
} from "../application/ports.js";
import type { OutboxPort, OutboxRecord } from "../application/outbox.js";

export class FakeReservationRepository implements ReservationRepositoryPort {
  private readonly items: Reservation[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((r) => r.tenantId === tenantId && r.id === id) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string, filter?: { status?: string }) {
    return this.items.filter(
      (r) =>
        r.tenantId === tenantId &&
        r.branchId === branchId &&
        (!filter?.status || r.status === filter.status),
    );
  }
  async listByGuest(tenantId: string, guestId: string) {
    return this.items.filter((r) => r.tenantId === tenantId && r.guestId === guestId);
  }
  async listActiveByBranchWindow(tenantId: string, branchId: string) {
    return this.items.filter((r) => r.tenantId === tenantId && r.branchId === branchId);
  }
  async save(reservation: Reservation) {
    const i = this.items.findIndex((r) => r.id === reservation.id);
    if (i >= 0) this.items[i] = reservation;
    else this.items.push(reservation);
  }
}

export class FakeGuestRepository implements GuestRepositoryPort {
  private readonly items: Guest[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((g) => g.tenantId === tenantId && g.id === id) ?? null;
  }
  async lookupByContact(tenantId: string, email?: string, phone?: string) {
    return (
      this.items.find(
        (g) =>
          g.tenantId === tenantId &&
          ((email && g.email === email) || (phone && g.phone === phone)),
      ) ?? null
    );
  }
  async save(guest: Guest) {
    const i = this.items.findIndex((g) => g.id === guest.id);
    if (i >= 0) this.items[i] = guest;
    else this.items.push(guest);
  }
}

export class FakeWaitlistEntryRepository implements WaitlistEntryRepositoryPort {
  private readonly items: WaitlistEntry[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((w) => w.tenantId === tenantId && w.id === id) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.items.filter((w) => w.tenantId === tenantId && w.branchId === branchId);
  }
  async save(entry: WaitlistEntry) {
    const i = this.items.findIndex((w) => w.id === entry.id);
    if (i >= 0) this.items[i] = entry;
    else this.items.push(entry);
  }
}

export class FakeReservationPreferenceRepository implements ReservationPreferenceRepositoryPort {
  private readonly items: ReservationPreference[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((p) => p.tenantId === tenantId && p.id === id) ?? null;
  }
  async listBySubject(tenantId: string, subjectType: string, subjectId: string) {
    return this.items.filter(
      (p) => p.tenantId === tenantId && p.subjectType === subjectType && p.subjectId === subjectId,
    );
  }
  async save(preference: ReservationPreference) {
    const i = this.items.findIndex((p) => p.id === preference.id);
    if (i >= 0) this.items[i] = preference;
    else this.items.push(preference);
  }
}

export class FakeCancellationPolicyRepository implements CancellationPolicyRepositoryPort {
  private readonly items: CancellationPolicy[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((p) => p.tenantId === tenantId && p.id === id) ?? null;
  }
  async findByTenant(tenantId: string) {
    return this.items.find((p) => p.tenantId === tenantId) ?? null;
  }
  async save(policy: CancellationPolicy) {
    const i = this.items.findIndex((p) => p.id === policy.id);
    if (i >= 0) this.items[i] = policy;
    else this.items.push(policy);
  }
}

export class FakeNotificationIntentRepository implements NotificationIntentRepositoryPort {
  private readonly items: NotificationIntent[] = [];
  async findById(tenantId: string, id: string) {
    return this.items.find((n) => n.tenantId === tenantId && n.id === id) ?? null;
  }
  async save(intent: NotificationIntent) {
    const i = this.items.findIndex((n) => n.id === intent.id);
    if (i >= 0) this.items[i] = intent;
    else this.items.push(intent);
  }
}

export class FakeOutboxRepository implements OutboxPort {
  readonly records: OutboxRecord[] = [];
  async append(record: OutboxRecord) {
    this.records.push(record);
  }
}
