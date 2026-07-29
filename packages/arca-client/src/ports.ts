import type { ArcaEnvironment } from "./environment.js";

export interface ArcaHttpRequest {
  url: string;
  method: "POST";
  headers: Readonly<Record<string, string>>;
  body: string;
  signal?: AbortSignal;
}

export interface ArcaHttpResponse {
  status: number;
  headers: Readonly<Record<string, string>>;
  body: string;
}

export interface ArcaHttpTransport {
  send(request: ArcaHttpRequest): Promise<ArcaHttpResponse>;
}

export interface ArcaClock {
  now(): Date;
}

export const systemClock: ArcaClock = {
  now: () => new Date(),
};

export interface ArcaCredentials {
  representedCuit: string;
  certificatePem: string;
  privateKeyPem: string;
}

export interface ArcaCredentialProvider {
  getCredentials(input: {
    environment: ArcaEnvironment;
    representedCuit: string;
  }): Promise<ArcaCredentials>;
}

export interface CmsSigner {
  sign(input: {
    content: string;
    certificatePem: string;
    privateKeyPem: string;
  }): Promise<string>;
}

export interface WsaaTicket {
  token: string;
  sign: string;
  generationTime: Date;
  expirationTime: Date;
}

export interface WsaaTicketKey {
  environment: ArcaEnvironment;
  representedCuit: string;
  service: string;
}

export interface WsaaTicketCache {
  get(key: WsaaTicketKey): Promise<WsaaTicket | null>;
  set(key: WsaaTicketKey, ticket: WsaaTicket): Promise<void>;
}

export interface ArcaDiagnosticEvent {
  operation: string;
  environment: ArcaEnvironment;
  outcome: "success" | "failure" | "ambiguous";
  durationMs: number;
  status?: number;
  code?: string;
}

export interface ArcaDiagnostics {
  record(event: ArcaDiagnosticEvent): void;
}

export const noOpDiagnostics: ArcaDiagnostics = {
  record: () => undefined,
};
