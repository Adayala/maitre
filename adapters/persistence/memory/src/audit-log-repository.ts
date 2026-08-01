import type { AuditLog, AuditLogQuery, AuditLogPage, AuditLogRepositoryPort } from "@maitre/audit";

interface Cursor {
  occurredAt: string;
  id: string;
}

function encodeCursor(entry: AuditLog): string {
  return Buffer.from(
    JSON.stringify({ occurredAt: entry.occurredAt.toISOString(), id: entry.id }),
  ).toString("base64url");
}

function decodeCursor(cursor: string): Cursor {
  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
}

export class InMemoryAuditLogRepository implements AuditLogRepositoryPort {
  private readonly items: AuditLog[] = [];

  async append(entry: AuditLog): Promise<void> {
    this.items.push(entry);
  }

  async query(params: AuditLogQuery): Promise<AuditLogPage> {
    let items = this.items.filter((i) => i.tenantId === params.tenantId);
    if (params.actorId) items = items.filter((i) => i.actorId === params.actorId);
    if (params.branchId) items = items.filter((i) => i.branchId === params.branchId);
    if (params.actionCode) {
      items = items.filter((i) => i.actionCode === params.actionCode);
    }
    if (params.outcome) items = items.filter((i) => i.outcome === params.outcome);
    if (params.resourceType) {
      items = items.filter((i) => i.resourceType === params.resourceType);
    }
    if (params.resourceId) {
      items = items.filter((i) => i.resourceId === params.resourceId);
    }
    if (params.correlationId) {
      items = items.filter((i) => i.correlationId === params.correlationId);
    }
    if (params.from) items = items.filter((i) => i.occurredAt >= params.from!);
    if (params.to) items = items.filter((i) => i.occurredAt <= params.to!);

    // SPEC-045 §contract — stable descending order by (occurredAt, id).
    items = [...items].sort((a, b) => {
      const diff = b.occurredAt.getTime() - a.occurredAt.getTime();
      return diff !== 0 ? diff : b.id.localeCompare(a.id);
    });

    if (params.cursor) {
      const { occurredAt, id } = decodeCursor(params.cursor);
      items = items.filter((i) => {
        const t = i.occurredAt.getTime();
        const ct = new Date(occurredAt).getTime();
        if (t !== ct) return t < ct;
        return i.id < id;
      });
    }

    const limit = params.limit ?? 100;
    const page = items.slice(0, limit);
    const nextCursor =
      items.length > limit && page.length > 0
        ? encodeCursor(page[page.length - 1]!)
        : undefined;

    return { items: page, ...(nextCursor ? { nextCursor } : {}) };
  }
}
