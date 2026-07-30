import assert from "node:assert/strict";
import test from "node:test";
import { findBreakingChanges } from "./check-breaking.mjs";
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
          responses: { default: {} },
          "x-maitre-owner": "ordering",
          "x-maitre-spec": "SPEC-084",
        },
      },
    },
    components: { schemas: { ProblemDetails: problemSchema } },
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

test("breaking checker permits additive optional fields and operations", () => {
  const baseline = document();
  const candidate = document();
  candidate.components.schemas.ProblemDetails.properties.extra = {
    type: "string",
  };
  candidate.paths["/v1/checks"] = { get: {} };
  assert.deepEqual(findBreakingChanges(baseline, candidate), []);
});
