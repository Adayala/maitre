import type { APIRequestContext, APIResponse } from "@playwright/test";
import { randomUUID } from "node:crypto";
import type {
  E2ERole,
  E2ERunManifest,
} from "../../../tooling/e2e/run-manifest.mjs";
import { tokenForRole } from "../../../tooling/e2e/run-manifest.mjs";

const TENANT_A_ID = "00000000-0000-0000-0000-000000000001";
const BRANCH_A_ID = "00000000-0000-0000-0000-000000000003";

export interface ApiEvidence<T = unknown> {
  status: number;
  correlationId: string | null;
  body: T;
}

export class JourneyApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly manifest: E2ERunManifest,
  ) {}

  async get<T>(
    role: E2ERole,
    path: string,
    context: { tenantId?: string; branchId?: string } = {},
  ): Promise<ApiEvidence<T>> {
    const response = await this.request.get(
      `${this.manifest.apiBaseUrl}${path}`,
      {
        headers: this.headers(role, context),
      },
    );
    return evidence<T>(response);
  }

  async mutate<T>(
    role: E2ERole,
    method: "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    data: unknown,
    context: { tenantId?: string; branchId?: string } = {},
  ): Promise<ApiEvidence<T>> {
    const response = await this.request.fetch(
      `${this.manifest.apiBaseUrl}${path}`,
      {
        method,
        headers: this.headers(role, context),
        data,
      },
    );
    return evidence<T>(response);
  }

  async poll<T>(
    description: string,
    read: () => Promise<ApiEvidence<T>>,
    accepted: (body: T) => boolean,
    timeoutMs = 10_000,
  ): Promise<ApiEvidence<T>> {
    const deadline = Date.now() + timeoutMs;
    let last: ApiEvidence<T> | undefined;
    while (Date.now() < deadline) {
      last = await read();
      if (accepted(last.body)) return last;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(
      `${description} timed out; last status=${last?.status ?? "none"} ` +
        `correlation=${last?.correlationId ?? "none"} body=${JSON.stringify(
          last?.body ?? null,
        )}`,
    );
  }

  private headers(
    role: E2ERole,
    context: { tenantId?: string; branchId?: string },
  ): Record<string, string> {
    return {
      authorization: `Bearer ${tokenForRole(role)}`,
      "x-tenant-id": context.tenantId ?? TENANT_A_ID,
      "x-branch-id": context.branchId ?? BRANCH_A_ID,
      "x-correlation-id": randomUUID(),
    };
  }
}

async function evidence<T>(response: APIResponse): Promise<ApiEvidence<T>> {
  const text = await response.text();
  return {
    status: response.status(),
    correlationId: response.headers()["x-correlation-id"] ?? null,
    body: (text ? JSON.parse(text) : null) as T,
  };
}
