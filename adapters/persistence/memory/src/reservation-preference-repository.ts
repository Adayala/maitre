import type { ReservationPreference, ReservationPreferenceRepositoryPort } from "@maitre/reservations";

export class InMemoryReservationPreferenceRepository implements ReservationPreferenceRepositoryPort {
  private readonly byId = new Map<string, ReservationPreference>();

  async findById(tenantId: string, id: string): Promise<ReservationPreference | null> {
    const pref = this.byId.get(id);
    return pref && pref.tenantId === tenantId ? pref : null;
  }

  async listBySubject(
    tenantId: string,
    subjectType: string,
    subjectId: string,
  ): Promise<ReservationPreference[]> {
    return [...this.byId.values()].filter(
      (p) => p.tenantId === tenantId && p.subjectType === subjectType && p.subjectId === subjectId,
    );
  }

  async save(preference: ReservationPreference): Promise<void> {
    this.byId.set(preference.id, preference);
  }
}
