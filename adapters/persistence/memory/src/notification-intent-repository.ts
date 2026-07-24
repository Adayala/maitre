import type { NotificationIntent, NotificationIntentRepositoryPort } from "@maitre/reservations";

export class InMemoryNotificationIntentRepository implements NotificationIntentRepositoryPort {
  private readonly byId = new Map<string, NotificationIntent>();

  async findById(tenantId: string, id: string): Promise<NotificationIntent | null> {
    const intent = this.byId.get(id);
    return intent && intent.tenantId === tenantId ? intent : null;
  }

  async save(intent: NotificationIntent): Promise<void> {
    this.byId.set(intent.id, intent);
  }
}
