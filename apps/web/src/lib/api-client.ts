const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: { type: string; title: string; correlationId?: string },
  ) {
    super(problem.title);
    this.name = "ApiError";
  }
}

export interface RequestOptions {
  accessToken: string;
  tenantId?: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

// SPEC-215 §4 — X-Tenant-Id expresses a requested selection; the server is
// the authority. This client never decides authorization, only transport.
export async function apiRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.accessToken}`,
  };
  if (options.tenantId) headers["X-Tenant-Id"] = options.tenantId;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });

  if (response.status === 204) return undefined as T;

  const json = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, json);
  }
  return json as T;
}
