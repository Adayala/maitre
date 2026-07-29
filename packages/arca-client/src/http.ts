import { ArcaError } from "./errors.js";
import type { ArcaHttpRequest, ArcaHttpResponse, ArcaHttpTransport } from "./ports.js";

export interface FetchArcaHttpTransportOptions {
  timeoutMs?: number;
  fetch?: typeof globalThis.fetch;
}

export class FetchArcaHttpTransport implements ArcaHttpTransport {
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(options: FetchArcaHttpTransportOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? 15_000;
    this.fetchImpl = options.fetch ?? globalThis.fetch;
    if (!this.fetchImpl) {
      throw new ArcaError("A Fetch implementation is required", { kind: "CONFIGURATION" });
    }
  }

  async send(request: ArcaHttpRequest): Promise<ArcaHttpResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const signal = request.signal
      ? AbortSignal.any([request.signal, controller.signal])
      : controller.signal;
    try {
      const response = await this.fetchImpl(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal,
      });
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      };
    } catch (cause) {
      throw new ArcaError("ARCA transport request failed", {
        kind: "TRANSPORT",
        retryable: true,
        outcomeAmbiguous: true,
        cause,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
