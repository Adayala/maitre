import type { FastifyRequest } from "fastify";

export interface Pagination {
  limit: number;
  offset: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(req: FastifyRequest): Pagination {
  const query = req.query as Record<string, string | undefined>;
  const limitRaw = Number(query["limit"] ?? DEFAULT_LIMIT);
  const offsetRaw = Number(query["offset"] ?? 0);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(1, Math.trunc(limitRaw)), MAX_LIMIT)
    : DEFAULT_LIMIT;
  const offset = Number.isFinite(offsetRaw) ? Math.max(0, Math.trunc(offsetRaw)) : 0;
  return { limit, offset };
}

export function paginate<T>(items: T[], pagination: Pagination) {
  const total = items.length;
  const data = items.slice(pagination.offset, pagination.offset + pagination.limit);
  return { data, meta: { total, limit: pagination.limit, offset: pagination.offset } };
}
