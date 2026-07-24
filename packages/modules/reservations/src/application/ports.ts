import type { Reservation } from "../domain/reservation.js";
import type { Guest } from "../domain/guest.js";
import type { WaitlistEntry } from "../domain/waitlist-entry.js";
import type { ReservationPreference } from "../domain/reservation-preference.js";
import type { CancellationPolicy } from "../domain/cancellation-policy.js";
import type { NotificationIntent } from "../domain/notification-intent.js";

export interface ReservationRepositoryPort {
  findById(tenantId: string, id: string): Promise<Reservation | null>;
  listByBranch(
    tenantId: string,
    branchId: string,
    filter?: { status?: string; from?: Date; to?: Date },
  ): Promise<Reservation[]>;
  listActiveByBranchWindow(
    tenantId: string,
    branchId: string,
    from: Date,
    to: Date,
  ): Promise<Reservation[]>;
  save(reservation: Reservation): Promise<void>;
}

export interface GuestRepositoryPort {
  findById(tenantId: string, id: string): Promise<Guest | null>;
  lookupByContact(tenantId: string, email?: string, phone?: string): Promise<Guest | null>;
  save(guest: Guest): Promise<void>;
}

export interface WaitlistEntryRepositoryPort {
  findById(tenantId: string, id: string): Promise<WaitlistEntry | null>;
  listByBranch(tenantId: string, branchId: string): Promise<WaitlistEntry[]>;
  save(entry: WaitlistEntry): Promise<void>;
}

export interface ReservationPreferenceRepositoryPort {
  findById(tenantId: string, id: string): Promise<ReservationPreference | null>;
  listBySubject(
    tenantId: string,
    subjectType: string,
    subjectId: string,
  ): Promise<ReservationPreference[]>;
  save(preference: ReservationPreference): Promise<void>;
}

export interface CancellationPolicyRepositoryPort {
  findById(tenantId: string, id: string): Promise<CancellationPolicy | null>;
  findByTenant(tenantId: string): Promise<CancellationPolicy | null>;
  save(policy: CancellationPolicy): Promise<void>;
}

export interface NotificationIntentRepositoryPort {
  findById(tenantId: string, id: string): Promise<NotificationIntent | null>;
  save(intent: NotificationIntent): Promise<void>;
}
