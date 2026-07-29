import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { ArcaError } from "./errors.js";

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  processEntities: false,
  trimValues: true,
  removeNSPrefix: true,
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  format: false,
  suppressEmptyNode: true,
});

export function parseXml(xml: string): unknown {
  try {
    return parser.parse(xml) as unknown;
  } catch (cause) {
    throw new ArcaError("ARCA returned malformed XML", {
      kind: "INVALID_RESPONSE",
      cause,
    });
  }
}

export function buildXml(value: unknown): string {
  return builder.build(value);
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function asRecord(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ArcaError(`Invalid ARCA response at ${context}`, {
      kind: "INVALID_RESPONSE",
    });
  }
  return value as Record<string, unknown>;
}

export function stringValue(value: unknown, context: string): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  throw new ArcaError(`Invalid ARCA response value at ${context}`, {
    kind: "INVALID_RESPONSE",
  });
}
