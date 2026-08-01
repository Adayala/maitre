import type { FastifyInstance, RouteOptions } from "fastify";
import type { SwaggerOptions } from "@fastify/swagger";

const PROBLEM_SCHEMA_ID = "ProblemDetails";
const SUCCESS_SCHEMA_ID = "SuccessEnvelope";
const COLLECTION_SCHEMA_ID = "CollectionEnvelope";

const problemDetailsJsonSchema = {
  $id: PROBLEM_SCHEMA_ID,
  type: "object",
  additionalProperties: false,
  required: [
    "type",
    "title",
    "status",
    "detail",
    "instance",
    "code",
    "correlationId",
  ],
  properties: {
    type: { type: "string", format: "uri" },
    title: { type: "string" },
    status: { type: "integer", minimum: 400, maximum: 599 },
    detail: { type: "string" },
    instance: { type: "string" },
    code: { type: "string" },
    correlationId: { type: "string" },
    errors: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["path", "code", "message"],
        properties: {
          path: { type: "string" },
          code: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
} as const;

const successEnvelopeJsonSchema = {
  $id: SUCCESS_SCHEMA_ID,
  type: "object",
  additionalProperties: true,
  required: ["data"],
  properties: {
    data: {
      anyOf: [
        { type: "object", additionalProperties: true },
        { type: "array", items: {} },
        { type: "string" },
        { type: "number" },
        { type: "boolean" },
        { type: "null" },
      ],
    },
    page: {
      type: "object",
      additionalProperties: false,
      required: ["nextCursor", "hasMore"],
      properties: {
        nextCursor: { anyOf: [{ type: "string" }, { type: "null" }] },
        hasMore: { type: "boolean" },
      },
    },
    meta: {
      type: "object",
      additionalProperties: false,
      required: ["correlationId"],
      properties: { correlationId: { type: "string" } },
    },
  },
} as const;

const collectionEnvelopeJsonSchema = {
  $id: COLLECTION_SCHEMA_ID,
  type: "object",
  additionalProperties: true,
  required: ["data", "page", "meta"],
  properties: {
    data: { type: "array", items: {} },
    page: {
      type: "object",
      required: ["nextCursor", "hasMore"],
      properties: {
        nextCursor: { anyOf: [{ type: "string" }, { type: "null" }] },
        hasMore: { type: "boolean" },
      },
    },
    meta: {
      type: "object",
      additionalProperties: false,
      required: ["correlationId"],
      properties: { correlationId: { type: "string" } },
    },
  },
} as const;

const contextHeadersJsonSchema = {
  type: "object",
  additionalProperties: true,
  properties: {
    "x-tenant-id": { type: "string" },
    "x-branch-id": { type: "string" },
    "x-correlation-id": { type: "string" },
    traceparent: {
      type: "string",
      pattern: "^[0-9a-f]{2}-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$",
    },
  },
} as const;

export function registerOpenApiContractMetadata(app: FastifyInstance): void {
  app.addSchema(problemDetailsJsonSchema);
  app.addSchema(successEnvelopeJsonSchema);
  app.addSchema(collectionEnvelopeJsonSchema);
  app.addHook("onRoute", (route) => {
    if (!route.url.startsWith("/v1/")) return;

    const method = firstMethod(route.method);
    const ownership = ownershipFor(route.url);
    const existing = (route.schema ?? {}) as Record<string, unknown>;
    const response = (existing["response"] ?? {}) as Record<string, unknown>;
    const operationId =
      typeof existing["operationId"] === "string"
        ? existing["operationId"]
        : operationIdFor(method.toLowerCase(), route.url);
    const tags = Array.isArray(existing["tags"])
      ? existing["tags"]
      : [ownership.owner];
    const security = Array.isArray(existing["security"])
      ? existing["security"]
      : [{ bearerAuth: [] }];

    route.schema = {
      ...existing,
      operationId,
      tags,
      security,
      response: {
        // Fastify consumes route schemas for runtime serialization. Keep this
        // permissive here and materialize the exact operation contract only in
        // the Swagger transform/generator so documentation cannot change
        // business responses.
        "2XX": { type: "object", additionalProperties: true },
        default: { $ref: `${PROBLEM_SCHEMA_ID}#` },
        ...response,
      },
      "x-maitre-owner": ownership.owner,
      "x-maitre-spec": ownership.spec,
    } as NonNullable<RouteOptions["schema"]>;
  });
}

export const openApiConfiguration: SwaggerOptions = {
  transform({ schema, url }) {
    if (!url.startsWith("/v1/")) return { schema, url };
    const existing = schema as Record<string, unknown>;
    const response = (existing["response"] ?? {}) as Record<string, unknown>;
    return {
      schema: {
        ...existing,
        headers: existing["headers"] ?? contextHeadersJsonSchema,
        response: {
          ...response,
          ...(response["2XX"]
            ? {
                "2XX": {
                  description: "Successful response",
                  content: {
                    "application/json": {
                      schema: { $ref: `${SUCCESS_SCHEMA_ID}#` },
                    },
                  },
                },
              }
            : {}),
          ...(response["default"]
            ? {
                default: {
                  description: "RFC 9457 problem response",
                  content: {
                    "application/problem+json": {
                      schema: { $ref: `${PROBLEM_SCHEMA_ID}#` },
                    },
                  },
                },
              }
            : {}),
        },
      },
      url,
    };
  },
  refResolver: {
    buildLocalReference(json, _baseUri, _fragment, index) {
      return typeof json["$id"] === "string" ? json["$id"] : `schema-${index}`;
    },
  },
  openapi: {
    openapi: "3.1.0",
    info: {
      title: "Maitre API",
      version: "1.0.0",
      description: "Public HTTP contract governed by SPEC-215.",
    },
    servers: [{ url: "/" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      parameters: {
        tenantContext: {
          name: "X-Tenant-Id",
          in: "header",
          required: false,
          schema: { type: "string" },
        },
        branchContext: {
          name: "X-Branch-Id",
          in: "header",
          required: false,
          schema: { type: "string" },
        },
      },
    },
  },
};

function firstMethod(method: RouteOptions["method"]): string {
  return Array.isArray(method) ? String(method[0]) : String(method);
}

function operationIdFor(method: string, url: string): string {
  const path = url
    .replace(/^\/v1\//, "")
    .replace(/:([A-Za-z0-9_]+)/g, " by $1 ")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part, index) =>
      index === 0
        ? part.toLowerCase()
        : `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`,
    )
    .join("");
  return `${method}${path[0]?.toUpperCase() ?? ""}${path.slice(1)}`;
}

function ownershipFor(url: string): { owner: string; spec: string } {
  const segment = url.split("/")[2] ?? "platform";
  if (
    [
      "visits",
      "occupancy",
      "table-statuses",
      "checks",
      "payments",
      "service-periods",
    ].includes(segment)
  ) {
    return { owner: "floor", spec: "SPEC-052..083" };
  }
  if (
    [
      "orders",
      "qr-menu",
      "digital-bill",
      "order-tracking",
      "menu-recommendations",
    ].includes(segment)
  ) {
    return { owner: "ordering", spec: "SPEC-084..097" };
  }
  if (["stations", "kitchen", "production-queue"].includes(segment)) {
    return { owner: "kitchen", spec: "SPEC-098..110" };
  }
  if (
    ["cash-registers", "cash-sessions", "cash-reconciliations"].includes(
      segment,
    )
  ) {
    return { owner: "cash", spec: "SPEC-124..136" };
  }
  return { owner: segment, spec: "SPEC-215" };
}
