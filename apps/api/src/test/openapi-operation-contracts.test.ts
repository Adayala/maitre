import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { applyOperationPayloadContracts } from "../openapi-operation-contracts.js";

type Schema = Record<string, unknown>;
interface Operation {
  parameters?: Array<Record<string, unknown>>;
  requestBody?: {
    content: Record<string, { schema: Schema }>;
  };
  responses: Record<
    string,
    {
      description?: string;
      content?: Record<string, { schema: Schema }>;
    }
  >;
}
interface Document {
  paths: Record<string, Record<string, Operation>>;
}

const genericSuccess = () => ({
  "2XX": {
    description: "Successful response",
    content: {
      "application/json": {
        schema: { $ref: "SuccessEnvelope#" },
      },
    },
  },
});

test("derives exact request and response contracts from route implementation types", () => {
  const document: Document = {
    paths: {
      "/v1/visits": {
        post: { parameters: [], responses: genericSuccess() },
      },
      "/v1/me/context": {
        get: { parameters: [], responses: genericSuccess() },
      },
      "/v1/brands/{id}": {
        delete: { parameters: [], responses: genericSuccess() },
      },
      "/v1/invoices/{id}/document": {
        get: { parameters: [], responses: genericSuccess() },
      },
    },
  };
  const tsconfig = fileURLToPath(
    new URL("../../tsconfig.json", import.meta.url),
  );

  applyOperationPayloadContracts(document, tsconfig);

  const visit = document.paths["/v1/visits"]!["post"]!;
  const requestSchema = visit.requestBody?.content["application/json"]!
    .schema as {
    required: string[];
    properties: Record<string, Schema>;
  };
  assert.deepEqual(requestSchema.required, [
    "branchId",
    "guestCount",
    "tableIds",
  ]);
  assert.equal(requestSchema.properties["branchId"]?.["type"], "string");

  const visitSchema = visit.responses["2XX"]!.content!["application/json"]!
    .schema as {
    additionalProperties: boolean;
    properties: Record<string, Schema>;
  };
  assert.equal(visitSchema.additionalProperties, false);
  assert.equal(visitSchema.properties["data"]?.["type"], "object");
  const dataProperties = visitSchema.properties["data"]?.["properties"] as
    Record<string, Schema> | undefined;
  assert.ok(dataProperties?.["status"]?.["enum"]);

  const meSchema = document.paths["/v1/me/context"]!["get"]!.responses["2XX"]!
    .content!["application/json"]!.schema as {
    required: string[];
    properties: Record<string, Schema>;
  };
  assert.deepEqual(meSchema.required, ["tenants", "user"]);
  assert.equal(meSchema.properties["user"]?.["type"], "object");
  assert.equal(meSchema.properties["data"], undefined);

  assert.deepEqual(document.paths["/v1/brands/{id}"]!["delete"]!.responses, {
    204: { description: "No content" },
  });
  assert.deepEqual(
    Object.keys(
      document.paths["/v1/invoices/{id}/document"]!["get"]!.responses["200"]!
        .content!,
    ).sort(),
    ["application/pdf", "text/html"],
  );
});
