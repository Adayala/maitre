import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

type JsonSchema = Record<string, unknown>;
type OpenApiDocument = {
  paths?: Record<string, Record<string, OpenApiOperation>>;
};
type OpenApiOperation = {
  parameters?: Array<Record<string, unknown>>;
  requestBody?: Record<string, unknown>;
  responses?: Record<string, Record<string, unknown>>;
};

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete"]);

/**
 * Derives payload contracts from the same TypeScript handler expressions and
 * Zod parse results used by the running API. This keeps the generated artifact
 * operation-specific without introducing a second hand-maintained DTO registry.
 */
export function applyOperationPayloadContracts(
  document: OpenApiDocument,
  tsconfigPath = "tsconfig.json",
): void {
  const configPath = resolve(tsconfigPath);
  const parsed = parseTsConfig(configPath);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();

  for (const sourceFile of program.getSourceFiles()) {
    if (
      sourceFile.isDeclarationFile ||
      !sourceFile.fileName.includes("/apps/api/src/routes/")
    ) {
      continue;
    }
    visit(sourceFile);
  }
  applyKnownSharedContracts(document);

  function visit(node: ts.Node): void {
    const route = routeRegistration(node);
    if (route) applyRouteContract(route);
    ts.forEachChild(node, visit);
  }

  function applyRouteContract(route: RouteRegistration): void {
    const path = route.path.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
    const operation = document.paths?.[path]?.[route.method];
    if (!operation) return;

    const request = findParsedRequestTypes(route.handler, checker);
    if (request.body) {
      operation.requestBody = {
        required: request.bodyRequired ?? true,
        content: {
          "application/json": {
            schema: schemaForType(request.body, checker),
          },
        },
      };
    }
    if (request.query) {
      const queryParameters = parametersForObjectType(request.query, checker);
      const retained = (operation.parameters ?? []).filter(
        (parameter) => parameter["in"] !== "query",
      );
      operation.parameters = [...retained, ...queryParameters];
    }

    const success = findSuccessfulResponses(route.handler, checker);
    if (success.noContent && success.schemas.length === 0) {
      if (operation.responses) {
        delete operation.responses["2XX"];
        operation.responses["204"] = { description: "No content" };
      }
      return;
    }
    if (success.schemas.length === 0) return;
    const response = operation.responses?.["2XX"];
    const content = response?.["content"] as
      Record<string, Record<string, unknown>> | undefined;
    const media = content?.["application/json"];
    if (media) {
      media["schema"] = combineSchemas(success.schemas);
    }
  }
}

interface RouteRegistration {
  method: string;
  path: string;
  handler: ts.ArrowFunction | ts.FunctionExpression;
}

function routeRegistration(node: ts.Node): RouteRegistration | null {
  if (
    !ts.isCallExpression(node) ||
    !ts.isPropertyAccessExpression(node.expression)
  ) {
    return null;
  }
  const method = node.expression.name.text.toLowerCase();
  const path = node.arguments[0];
  if (
    !HTTP_METHODS.has(method) ||
    !path ||
    !ts.isStringLiteralLike(path) ||
    !path.text.startsWith("/v1/")
  ) {
    return null;
  }
  const handler = [...node.arguments]
    .reverse()
    .find(
      (argument): argument is ts.ArrowFunction | ts.FunctionExpression =>
        ts.isArrowFunction(argument) || ts.isFunctionExpression(argument),
    );
  const options = [...node.arguments]
    .reverse()
    .find(ts.isObjectLiteralExpression);
  const configuredHandler = options?.properties
    .filter(ts.isPropertyAssignment)
    .find(
      (property) =>
        property.name.getText().replaceAll('"', "") === "handler" &&
        (ts.isArrowFunction(property.initializer) ||
          ts.isFunctionExpression(property.initializer)),
    )?.initializer;
  if (
    configuredHandler &&
    (ts.isArrowFunction(configuredHandler) ||
      ts.isFunctionExpression(configuredHandler))
  ) {
    return { method, path: path.text, handler: configuredHandler };
  }
  return handler ? { method, path: path.text, handler } : null;
}

function findParsedRequestTypes(
  handler: ts.ArrowFunction | ts.FunctionExpression,
  checker: ts.TypeChecker,
): { body?: ts.Type; bodyRequired?: boolean; query?: ts.Type } {
  const result: { body?: ts.Type; bodyRequired?: boolean; query?: ts.Type } =
    {};
  walkHandler(handler.body, (node) => {
    if (isRequestProperty(node, "body")) {
      result.body ??= checker.getTypeAtLocation(node);
      result.bodyRequired ??= true;
      return;
    }
    if (isRequestProperty(node, "query")) {
      result.query ??= checker.getTypeAtLocation(node);
      return;
    }
    if (!ts.isCallExpression(node)) {
      return;
    }
    const argumentText = node.arguments[0]?.getText() ?? "";
    if (
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "parse" &&
      argumentText.includes("req.body")
    ) {
      result.body ??= checker.getTypeAtLocation(node);
      result.bodyRequired = !argumentText.includes("??");
    }
    if (
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "parse" &&
      argumentText.includes("req.query")
    ) {
      result.query ??= checker.getTypeAtLocation(node);
    }
  });
  return result;
}

function isRequestProperty(
  node: ts.Node,
  name: "body" | "query",
): node is ts.PropertyAccessExpression {
  return (
    ts.isPropertyAccessExpression(node) &&
    node.name.text === name &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "req"
  );
}

function findSuccessfulResponses(
  handler: ts.ArrowFunction | ts.FunctionExpression,
  checker: ts.TypeChecker,
): { schemas: JsonSchema[]; noContent: boolean } {
  const schemas: JsonSchema[] = [];
  let noContent = false;
  walkHandler(handler.body, (node) => {
    if (!ts.isReturnStatement(node) || !node.expression) return;
    if (isNoContentExpression(node.expression)) {
      noContent = true;
      return;
    }
    const payload = responsePayload(node.expression);
    if (!payload) return;
    const type = checker.getTypeAtLocation(payload);
    if (checker.typeToString(type).includes("FastifyReply")) return;
    const schema = schemaForType(type, checker);
    if (isConstrainedSchema(schema)) schemas.push(schema);
  });
  return { schemas: uniqueSchemas(schemas), noContent };
}

function responsePayload(expression: ts.Expression): ts.Expression | null {
  if (
    ts.isCallExpression(expression) &&
    ts.isIdentifier(expression.expression) &&
    ["sendProblem", "sendMapped"].includes(expression.expression.text)
  ) {
    return null;
  }
  if (
    ts.isCallExpression(expression) &&
    ts.isPropertyAccessExpression(expression.expression) &&
    expression.expression.name.text === "send"
  ) {
    return expression.arguments[0] ?? null;
  }
  return expression;
}

function isNoContentExpression(expression: ts.Expression): boolean {
  if (expression.kind === ts.SyntaxKind.NullKeyword) return true;
  return (
    ts.isCallExpression(expression) &&
    ts.isPropertyAccessExpression(expression.expression) &&
    expression.expression.name.text === "send" &&
    expression.arguments.length === 0
  );
}

function walkHandler(root: ts.Node, visitor: (node: ts.Node) => void): void {
  const visit = (node: ts.Node): void => {
    if (node !== root && ts.isFunctionLike(node)) return;
    visitor(node);
    ts.forEachChild(node, visit);
  };
  visit(root);
}

function parametersForObjectType(
  type: ts.Type,
  checker: ts.TypeChecker,
): Array<Record<string, unknown>> {
  return checker.getPropertiesOfType(type).map((property) => {
    const declaration = property.valueDeclaration ?? property.declarations?.[0];
    if (!declaration) {
      return {
        name: property.name,
        in: "query",
        required: false,
        schema: {},
      };
    }
    const propertyType = checker.getTypeOfSymbolAtLocation(
      property,
      declaration,
    );
    return {
      name: property.name,
      in: "query",
      required: (property.flags & ts.SymbolFlags.Optional) === 0,
      schema: schemaForType(withoutUndefined(propertyType), checker),
    };
  });
}

function schemaForType(
  originalType: ts.Type,
  checker: ts.TypeChecker,
  seen = new Set<number>(),
  depth = 0,
): JsonSchema {
  const type = withoutUndefined(originalType);
  if (depth > 10) return {};
  if (type.flags & ts.TypeFlags.Any || type.flags & ts.TypeFlags.Unknown)
    return {};
  if (type.flags & ts.TypeFlags.Never) return { not: {} };
  if (type.flags & ts.TypeFlags.Null) return { type: "null" };
  if (type.flags & ts.TypeFlags.String) return { type: "string" };
  if (type.flags & ts.TypeFlags.Number) return { type: "number" };
  if (type.flags & ts.TypeFlags.Boolean) return { type: "boolean" };
  if (type.isStringLiteral()) return { type: "string", const: type.value };
  if (type.isNumberLiteral()) return { type: "number", const: type.value };
  if (type.flags & ts.TypeFlags.BooleanLiteral) {
    return {
      type: "boolean",
      const: checker.typeToString(type) === "true",
    };
  }
  if (type.isUnion()) {
    const members = type.types
      .filter((member) => !(member.flags & ts.TypeFlags.Undefined))
      .map((member) => schemaForType(member, checker, seen, depth + 1));
    const compact = compactLiteralUnion(members);
    return compact ?? combineSchemas(members);
  }
  if (checker.isArrayType(type) || checker.isTupleType(type)) {
    const arguments_ = checker.getTypeArguments(type as ts.TypeReference);
    if (checker.isTupleType(type)) {
      return {
        type: "array",
        prefixItems: arguments_.map((item) =>
          schemaForType(item, checker, seen, depth + 1),
        ),
        minItems: arguments_.length,
        maxItems: arguments_.length,
      };
    }
    return {
      type: "array",
      items: schemaForType(
        arguments_[0] ?? checker.getAnyType(),
        checker,
        seen,
        depth + 1,
      ),
    };
  }

  const symbolName = type.getSymbol()?.getName();
  if (symbolName === "Date") return { type: "string", format: "date-time" };
  if (!(type.flags & ts.TypeFlags.Object)) return {};

  const typeId = (type as ts.Type & { id?: number }).id;
  if (typeId !== undefined && seen.has(typeId)) return {};
  const nestedSeen = new Set(seen);
  if (typeId !== undefined) nestedSeen.add(typeId);

  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  for (const property of checker.getPropertiesOfType(type)) {
    const declaration = property.valueDeclaration ?? property.declarations?.[0];
    if (!declaration) continue;
    const propertyType = checker.getTypeOfSymbolAtLocation(
      property,
      declaration,
    );
    if (propertyType.getCallSignatures().length > 0) continue;
    properties[property.name] = schemaForType(
      propertyType,
      checker,
      nestedSeen,
      depth + 1,
    );
    if ((property.flags & ts.SymbolFlags.Optional) === 0) {
      required.push(property.name);
    }
  }
  const stringIndex = checker.getIndexTypeOfType(type, ts.IndexKind.String);
  return {
    type: "object",
    additionalProperties: stringIndex
      ? schemaForType(stringIndex, checker, nestedSeen, depth + 1)
      : false,
    ...(required.length > 0 ? { required: required.sort() } : {}),
    properties: Object.fromEntries(
      Object.entries(properties).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
  };
}

function withoutUndefined(type: ts.Type): ts.Type {
  if (!type.isUnion()) return type;
  const defined = type.types.filter(
    (member) => !(member.flags & ts.TypeFlags.Undefined),
  );
  return defined.length === 1 ? defined[0]! : type;
}

function compactLiteralUnion(schemas: JsonSchema[]): JsonSchema | null {
  if (
    schemas.length < 2 ||
    !schemas.every(
      (schema) =>
        typeof schema["type"] === "string" &&
        Object.prototype.hasOwnProperty.call(schema, "const"),
    )
  ) {
    return null;
  }
  const types = new Set(schemas.map((schema) => schema["type"]));
  if (types.size !== 1) return null;
  return {
    type: schemas[0]?.["type"],
    enum: schemas.map((schema) => schema["const"]),
  };
}

function combineSchemas(schemas: JsonSchema[]): JsonSchema {
  const unique = uniqueSchemas(schemas);
  return unique.length === 1 ? unique[0]! : { anyOf: unique };
}

function uniqueSchemas(schemas: JsonSchema[]): JsonSchema[] {
  const values = new Map(
    schemas.map((schema) => [JSON.stringify(schema), schema]),
  );
  return [...values.values()];
}

function isConstrainedSchema(schema: JsonSchema): boolean {
  if (schema["type"] === "object") {
    const properties = schema["properties"];
    return Boolean(
      properties &&
      typeof properties === "object" &&
      Object.keys(properties).length > 0,
    );
  }
  return Object.keys(schema).length > 0;
}

function applyKnownSharedContracts(document: OpenApiDocument): void {
  const fiscalDocument =
    document.paths?.["/v1/invoices/{id}/document"]?.["get"];
  if (fiscalDocument?.responses) {
    delete fiscalDocument.responses["2XX"];
    fiscalDocument.responses["200"] = {
      description: "Rendered authorized fiscal document",
      content: {
        "text/html": { schema: { type: "string" } },
        "application/pdf": {
          schema: { type: "string", format: "binary" },
        },
      },
    };
  }
  copySuccessSchema(document, "get", "/v1/cash-sessions/{id}", [
    "/v1/cash-sessions/{id}/begin-close",
    "/v1/cash-sessions/{id}/close",
    "/v1/cash-sessions/{id}/resume",
    "/v1/cash-sessions/{id}/suspend",
  ]);
  copySuccessSchema(document, "get", "/v1/special-requests/{id}", [
    "/v1/special-requests/{id}/accept",
    "/v1/special-requests/{id}/fulfill",
    "/v1/special-requests/{id}/reject",
  ]);
  for (const path of [
    "/v1/special-requests/{id}/accept",
    "/v1/special-requests/{id}/fulfill",
    "/v1/special-requests/{id}/reject",
  ]) {
    const operation = document.paths?.[path]?.["post"];
    if (!operation) continue;
    operation.requestBody = {
      required: false,
      content: {
        "application/json": {
          schema: {
            type: "object",
            additionalProperties: false,
            properties: { reasonCode: { type: "string", minLength: 1 } },
          },
        },
      },
    };
  }
}

function copySuccessSchema(
  document: OpenApiDocument,
  sourceMethod: string,
  sourcePath: string,
  targetPaths: string[],
): void {
  const source = successSchema(document.paths?.[sourcePath]?.[sourceMethod]);
  if (!source) return;
  for (const targetPath of targetPaths) {
    const target = document.paths?.[targetPath]?.["post"];
    const content = target?.responses?.["2XX"]?.["content"] as
      Record<string, Record<string, unknown>> | undefined;
    if (content?.["application/json"]) {
      content["application/json"]["schema"] = structuredClone(source);
    }
  }
}

function successSchema(
  operation: OpenApiOperation | undefined,
): JsonSchema | undefined {
  const content = operation?.responses?.["2XX"]?.["content"] as
    Record<string, Record<string, unknown>> | undefined;
  return content?.["application/json"]?.["schema"] as JsonSchema | undefined;
}

function parseTsConfig(configPath: string): ts.ParsedCommandLine {
  const config = ts.readConfigFile(configPath, (path) =>
    readFileSync(path, "utf8"),
  );
  if (config.error) {
    throw new Error(
      ts.flattenDiagnosticMessageText(config.error.messageText, "\n"),
    );
  }
  return ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    resolve(configPath, ".."),
    undefined,
    configPath,
  );
}
