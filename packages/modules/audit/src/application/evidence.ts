import { createHash } from "node:crypto";

export const MAX_AUDIT_EVIDENCE_BYTES = 8_192;
const MAX_STRING_LENGTH = 256;
const MAX_ARRAY_LENGTH = 20;
const MAX_DEPTH = 5;
const forbiddenEvidenceKeys =
  /(?:authorization|token|password|secret|credential|card|pan|cvv|cvc|track|account|email|phone|notes?|operatorNote)/i;

export function sanitizeAuditEvidence(value: unknown): unknown {
  const sanitized = sanitizeValue(value, 0);
  const serialized = JSON.stringify(sanitized);
  if (Buffer.byteLength(serialized, "utf8") <= MAX_AUDIT_EVIDENCE_BYTES) {
    return sanitized;
  }
  return {
    truncated: true,
    sha256: createHash("sha256").update(serialized).digest("hex"),
    originalBytes: Buffer.byteLength(serialized, "utf8"),
  };
}

function sanitizeValue(value: unknown, depth: number): unknown {
  if (depth >= MAX_DEPTH) return "[MAX_DEPTH]";
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    return value;
  }
  if (typeof value === "string") {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}…`
      : value;
  }
  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_LENGTH)
      .map((item) => sanitizeValue(item, depth + 1));
  }
  if (typeof value !== "object") return String(value);

  const projected: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (forbiddenEvidenceKeys.test(key)) continue;
    projected[key] = sanitizeValue(item, depth + 1);
  }
  return projected;
}
