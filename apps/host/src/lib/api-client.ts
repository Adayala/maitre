const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:3001";

// Shared transport for the Host / Maître app. Per SPEC-215 §4 the client only
// expresses a requested tenant selection via X-Tenant-Id; the server remains
// the sole authority on authorization.
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: { type: string; title: string; correlationId?: string },
  ) {
    super(problem?.title ?? `HTTP ${status}`);
    this.name = "ApiError";
  }
}

const REQUEST_TIMEOUT_MS = 8_000;

export interface RequestOptions {
  accessToken: string;
  tenantId?: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

export async function apiRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.accessToken}`,
  };
  if (options.tenantId) headers["X-Tenant-Id"] = options.tenantId;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      signal: controller.signal,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("La API no respondió a tiempo. Verificá que el backend local esté activo.");
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }

  if (response.status === 204) return undefined as T;

  const json = await response.json().catch(() => ({ title: response.statusText }));
  if (!response.ok) {
    throw new ApiError(response.status, json);
  }
  return json as T;
}
