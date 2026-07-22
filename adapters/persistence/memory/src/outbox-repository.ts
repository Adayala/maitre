import type { OutboxPort, OutboxRecord } from "@maitre/organization";

// In-memory outbox — a placeholder for the Postgres outbox table of
// SPEC-217 §4. `append` here is trivially atomic with the aggregate save
// since both happen in the same synchronous in-process call; a real adapter
// must write both inside one PostgreSQL transaction.
export class InMemoryOutboxRepository implements OutboxPort {
  private readonly records: OutboxRecord[] = [];

  async append(record: OutboxRecord): Promise<void> {
    this.records.push(record);
  }

  /** Test/inspection helper — not part of OutboxPort. */
  all(): readonly OutboxRecord[] {
    return this.records;
  }
}
