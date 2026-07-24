import type { Reservation, ReservationRepositoryPort } from "@maitre/reservations";

export class InMemoryReservationRepository implements ReservationRepositoryPort {
  private readonly byId = new Map<string, Reservation>();

  async findById(tenantId: string, id: string): Promise<Reservation | null> {
    const reservation = this.byId.get(id);
    return reservation && reservation.tenantId === tenantId ? reservation : null;
  }

  async listByBranch(
    tenantId: string,
    branchId: string,
    filter?: { status?: string; from?: Date; to?: Date },
  ): Promise<Reservation[]> {
    return [...this.byId.values()].filter(
      (r) =>
        r.tenantId === tenantId &&
        r.branchId === branchId &&
        (!filter?.status || r.status === filter.status) &&
        (!filter?.from || r.startAt >= filter.from) &&
        (!filter?.to || r.startAt <= filter.to),
    );
  }

  async listActiveByBranchWindow(
    tenantId: string,
    branchId: string,
    _from: Date,
    _to: Date,
  ): Promise<Reservation[]> {
    return [...this.byId.values()].filter((r) => r.tenantId === tenantId && r.branchId === branchId);
  }

  async save(reservation: Reservation): Promise<void> {
    this.byId.set(reservation.id, reservation);
  }
}
