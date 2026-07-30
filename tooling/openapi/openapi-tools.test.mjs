import assert from "node:assert/strict";
import test from "node:test";
import {
  findBreakingChanges,
  partitionApprovedChanges,
} from "./check-breaking.mjs";
import { validateContract } from "./contract-policy.mjs";

const problemSchema = {
  type: "object",
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
    type: { type: "string" },
    title: { type: "string" },
    status: { type: "integer" },
    detail: { type: "string" },
    instance: { type: "string" },
    code: { type: "string" },
    correlationId: { type: "string" },
  },
};

function document() {
  return structuredClone({
    openapi: "3.1.0",
    paths: {
      "/v1/orders": {
        get: {
          operationId: "getOrders",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "x-tenant-id",
              in: "header",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "x-branch-id",
              in: "header",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "x-correlation-id",
              in: "header",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "traceparent",
              in: "header",
              required: false,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/OrderCollection" },
                },
              },
            },
            default: {
              content: {
                "application/problem+json": {
                  schema: { $ref: "#/components/schemas/ProblemDetails" },
                },
              },
            },
          },
          "x-maitre-owner": "ordering",
          "x-maitre-spec": "SPEC-084",
        },
      },
    },
    components: {
      schemas: {
        ProblemDetails: problemSchema,
        OrderCollection: {
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Order" },
            },
          },
        },
        Order: {
          type: "object",
          required: ["id", "status"],
          properties: {
            id: { type: "string" },
            status: { type: "string", enum: ["DRAFT", "SUBMITTED"] },
          },
        },
      },
    },
  });
}

test("contract policy accepts governed operations and RFC 9457 fields", () => {
  assert.deepEqual(validateContract(document()), []);
});

test("contract policy rejects missing ownership and problem response", () => {
  const candidate = document();
  delete candidate.paths["/v1/orders"].get["x-maitre-owner"];
  delete candidate.paths["/v1/orders"].get.responses.default;
  assert.deepEqual(validateContract(candidate), [
    "GET /v1/orders is missing x-maitre-owner",
    "GET /v1/orders is missing the default Problem Details response",
  ]);
});

test("contract policy rejects unconstrained success and wrong problem media type", () => {
  const candidate = document();
  candidate.paths["/v1/orders"].get.responses["200"] = {
    content: {
      "application/json": {
        schema: { type: "object", additionalProperties: true },
      },
    },
  };
  candidate.paths["/v1/orders"].get.responses.default = {
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ProblemDetails" },
      },
    },
  };
  assert.deepEqual(validateContract(candidate), [
    "GET /v1/orders success response schema is unconstrained",
    "GET /v1/orders default response must use application/problem+json",
  ]);
});

test("breaking checker detects removed operations and schema fields", () => {
  const baseline = document();
  const candidate = document();
  delete candidate.paths["/v1/orders"];
  delete candidate.components.schemas.ProblemDetails.properties.detail;
  assert.deepEqual(findBreakingChanges(baseline, candidate), [
    "removed path /v1/orders",
    "removed property components.schemas.ProblemDetails.detail",
  ]);
});

test("breaking checker detects operation contract regressions", () => {
  const baseline = document();
  baseline.paths["/v1/orders"].get.requestBody = {
    required: false,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: { cursor: { type: "string" } },
        },
      },
    },
  };
  const candidate = document();
  candidate.paths["/v1/orders"].get.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {},
        },
      },
    },
  };
  candidate.paths["/v1/orders"].get.parameters = candidate.paths[
    "/v1/orders"
  ].get.parameters.filter((parameter) => parameter.name !== "x-branch-id");
  delete candidate.paths["/v1/orders"].get.responses["200"].content[
    "application/json"
  ];

  assert.deepEqual(findBreakingChanges(baseline, candidate), [
    "removed parameter header:x-branch-id from GET /v1/orders",
    "made request body required at GET /v1/orders",
    "removed property GET /v1/orders.requestBody.application/json.cursor",
    "removed media type application/json at GET /v1/orders.responses.200",
  ]);
});

test("breaking checker detects nested response type and enum changes", () => {
  const baseline = document();
  const candidate = document();
  candidate.components.schemas.Order.properties.status.type = "integer";
  candidate.components.schemas.Order.properties.status.enum = ["SUBMITTED"];

  assert.deepEqual(findBreakingChanges(baseline, candidate), [
    "changed type at components.schemas.Order.status from string to integer",
    'removed enum value "DRAFT" at components.schemas.Order.status',
  ]);
});

test("breaking checker permits additive optional fields and operations", () => {
  const baseline = document();
  const candidate = document();
  candidate.components.schemas.ProblemDetails.properties.extra = {
    type: "string",
  };
  candidate.paths["/v1/checks"] = { get: {} };
  assert.deepEqual(findBreakingChanges(baseline, candidate), []);
});

test("breaking approval is scoped to an unexpired default media migration", () => {
  const candidate = document();
  const policy = {
    approvals: [
      {
        id: "SPEC-215-PROBLEM-DETAILS-MEDIA",
        kind: "replace-default-response-media-type",
        from: "application/json",
        to: "application/problem+json",
        pathPrefix: "/v1/",
        expiresOn: "2026-09-30",
        reason: "Contract correction.",
      },
    ],
  };
  const change =
    "removed media type application/json at GET /v1/orders.responses.default";
  assert.deepEqual(
    partitionApprovedChanges(
      [change, "removed response 200 from GET /v1/orders"],
      candidate,
      policy,
      new Date("2026-07-30T00:00:00Z"),
    ),
    {
      approved: [
        {
          change,
          approvalId: "SPEC-215-PROBLEM-DETAILS-MEDIA",
        },
      ],
      unapproved: ["removed response 200 from GET /v1/orders"],
    },
  );
  assert.deepEqual(
    partitionApprovedChanges(
      [change],
      candidate,
      policy,
      new Date("2026-10-01T00:00:00Z"),
    ).unapproved,
    [change],
  );
});
