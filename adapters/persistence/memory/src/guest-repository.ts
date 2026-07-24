import type { Guest, GuestRepositoryPort } from "@maitre/reservations";

export class InMemoryGuestRepository implements GuestRepositoryPort {
  private readonly byId = new Map<string, Guest>();

  async findById(tenantId: string, id: string): Promise<Guest | null> {
    const guest = this.byId.get(id);
    return guest && guest.tenantId === tenantId ? guest : null;
  }

  async lookupByContact(tenantId: string, email?: string, phone?: string): Promise<Guest | null> {
    return (
      [...this.byId.values()].find(
        (g) =>
          g.tenantId === tenantId &&
          ((email && g.email === email) || (phone && g.phone === phone)),
      ) ?? null
    );
  }

  async save(guest: Guest): Promise<void> {
    this.byId.set(guest.id, guest);
  }
}
