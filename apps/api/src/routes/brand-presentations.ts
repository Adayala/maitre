import type { FastifyInstance } from "fastify";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { brandPresentationDocumentSchema, type BrandPresentation } from "@maitre/contracts";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { badRequest, notFound, sendProblem } from "../http/problem-details.js";

const presentationBodySchema = z.object({ presentation: brandPresentationDocumentSchema });
const rollbackBodySchema = z.object({ revision: z.number().int().positive() });
const assetUploadSchema = z.object({
  kind: z.enum(["LOGO", "LOGO_COMPACT", "LOGO_DARK", "FAVICON", "HERO", "BACKGROUND", "PLACEHOLDER", "FONT"]),
  fileName: z.string().regex(/^[a-zA-Z0-9._-]+$/),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/x-icon", "font/woff2"]),
  base64: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export async function registerBrandPresentationRoutes(app: FastifyInstance, container: Container) {
  app.get<{ Params: { brandId: string } }>("/v1/brands/:brandId/presentation", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "brand:read");
      const brand = await container.brands.findById(ctx.tenantId, req.params.brandId);
      if (!brand) return sendProblem(reply, correlationId, notFound("Brand"));
      const [draft, published, history] = await Promise.all([
        container.brandPresentations.findDraft(ctx.tenantId, brand.id),
        container.brandPresentations.findPublished(ctx.tenantId, brand.id),
        container.brandPresentations.listByBrand(ctx.tenantId, brand.id),
      ]);
      return { data: { draft, published, history } };
    } catch (err) { return sendProblem(reply, correlationId, err); }
  });

  app.get<{ Params: { brandId: string } }>("/v1/brands/:brandId/assets", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "brand:read");
      return { data: await container.brandAssets.listByBrand(ctx.tenantId, req.params.brandId) };
    } catch (err) { return sendProblem(reply, correlationId, err); }
  });

  app.post<{ Params: { brandId: string } }>("/v1/brands/:brandId/assets", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "brand:write");
      const brand = await container.brands.findById(ctx.tenantId, req.params.brandId);
      if (!brand) return sendProblem(reply, correlationId, notFound("Brand"));
      const input = assetUploadSchema.parse(req.body);
      const bytes = Buffer.from(input.base64, "base64");
      if (bytes.byteLength === 0 || bytes.byteLength > 5 * 1024 * 1024) return sendProblem(reply, correlationId, badRequest("Asset must be between 1 byte and 5 MB"));
      const assetError = validateAsset(input.mimeType, bytes);
      if (assetError) return sendProblem(reply, correlationId, badRequest(assetError));
      const id = randomUUID();
      const path = `tenants/${ctx.tenantId}/brands/${brand.id}/${input.kind.toLowerCase()}/${id}/${input.fileName}`;
      await container.brandAssetStorage.put(path, bytes, input.mimeType);
      const asset = {
        id, tenantId: ctx.tenantId, brandId: brand.id, kind: input.kind,
        storageBucket: "brand-assets", storagePath: path,
        publicUrl: `/public/tenants/${ctx.tenantId}/brands/${brand.id}/assets/${id}`,
        mimeType: input.mimeType, sizeBytes: bytes.byteLength,
        checksum: createHash("sha256").update(bytes).digest("hex"),
        ...(input.width ? { width: input.width } : {}), ...(input.height ? { height: input.height } : {}),
        status: "READY" as const, createdAt: new Date(), createdBy: ctx.userId,
      };
      await container.brandAssets.save(asset);
      reply.code(201);
      return { data: asset };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.delete<{ Params: { brandId: string; assetId: string } }>("/v1/brands/:brandId/assets/:assetId", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "brand:write");
      const asset = await container.brandAssets.findById(ctx.tenantId, req.params.brandId, req.params.assetId);
      if (!asset) return sendProblem(reply, correlationId, notFound("Brand asset"));
      await container.brandAssetStorage.remove(asset.storagePath);
      await container.brandAssets.save({ ...asset, status: "ARCHIVED" });
      return reply.code(204).send();
    } catch (err) { return sendProblem(reply, correlationId, err); }
  });

  app.put<{ Params: { brandId: string } }>("/v1/brands/:brandId/presentation/draft", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "brand:write");
      const brand = await container.brands.findById(ctx.tenantId, req.params.brandId);
      if (!brand) return sendProblem(reply, correlationId, notFound("Brand"));
      const body = presentationBodySchema.parse(req.body);
      const existing = await container.brandPresentations.findDraft(ctx.tenantId, brand.id);
      const draft: BrandPresentation = {
        id: existing?.id ?? randomUUID(), tenantId: ctx.tenantId, brandId: brand.id,
        revision: existing?.revision ?? await container.brandPresentations.nextRevision(ctx.tenantId, brand.id),
        status: "DRAFT", document: body.presentation,
        createdAt: existing?.createdAt ?? new Date(), createdBy: existing?.createdBy ?? ctx.userId,
      };
      await container.brandPresentations.save(draft);
      return { data: draft };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { brandId: string } }>("/v1/brands/:brandId/presentation/preview", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "brand:write");
      const body = presentationBodySchema.parse(req.body);
      return { data: effectivePayload(ctx.tenantId, req.params.brandId, null, "PREVIEW", body.presentation, 0) };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { brandId: string } }>("/v1/brands/:brandId/presentation/publish", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "brand:write");
      const draft = await container.brandPresentations.findDraft(ctx.tenantId, req.params.brandId);
      if (!draft) return sendProblem(reply, correlationId, notFound("Brand presentation draft"));
      const current = await container.brandPresentations.findPublished(ctx.tenantId, req.params.brandId);
      if (current) await container.brandPresentations.save({ ...current, status: "ARCHIVED" });
      const now = new Date();
      const published = { ...draft, status: "PUBLISHED" as const, publishedAt: now, publishedBy: ctx.userId };
      await container.brandPresentations.save(published);
      return { data: published };
    } catch (err) { return sendProblem(reply, correlationId, err); }
  });

  app.post<{ Params: { brandId: string } }>("/v1/brands/:brandId/presentation/rollback", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "brand:write");
      const body = rollbackBodySchema.parse(req.body);
      const history = await container.brandPresentations.listByBrand(ctx.tenantId, req.params.brandId);
      const source = history.find((item) => item.revision === body.revision);
      if (!source) return sendProblem(reply, correlationId, notFound("Brand presentation revision"));
      const current = await container.brandPresentations.findPublished(ctx.tenantId, req.params.brandId);
      if (current) await container.brandPresentations.save({ ...current, status: "ARCHIVED" });
      const now = new Date();
      const restored: BrandPresentation = {
        ...source, id: randomUUID(), revision: await container.brandPresentations.nextRevision(ctx.tenantId, req.params.brandId),
        status: "PUBLISHED", createdAt: now, createdBy: ctx.userId, publishedAt: now, publishedBy: ctx.userId,
      };
      await container.brandPresentations.save(restored);
      return { data: restored };
    } catch (err) {
      if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
      return sendProblem(reply, correlationId, err);
    }
  });

  app.get<{ Params: { brandId: string }; Querystring: { branchId?: string; surface?: string } }>(
    "/v1/brands/:brandId/presentation/effective",
    async (req, reply) => {
      const correlationId = randomUUID();
      try {
        const ctx = await requireTenantContext(container, req);
        const brand = await container.brands.findById(ctx.tenantId, req.params.brandId);
        if (!brand) return sendProblem(reply, correlationId, notFound("Brand"));
      const published = await container.brandPresentations.findPublished(ctx.tenantId, brand.id);
        const document = absolutizeDocument(published?.document ?? platformFallback(brand.name, brand.logoUrl), `${req.protocol}://${req.hostname}`);
        return { data: effectivePayload(ctx.tenantId, brand.id, req.query.branchId ?? null, req.query.surface ?? "DASH", document, published?.revision ?? 0) };
      } catch (err) { return sendProblem(reply, correlationId, err); }
    },
  );

  app.get<{ Params: { tenantId: string; brandId: string }; Querystring: { surface?: string } }>(
    "/public/tenants/:tenantId/brands/:brandId/presentation",
    async (req, reply) => {
      const brand = await container.brands.findById(req.params.tenantId, req.params.brandId);
      if (!brand || brand.status !== "ACTIVE") return reply.code(404).send({ type: "not-found", title: "Presentation not found", status: 404 });
      const published = await container.brandPresentations.findPublished(req.params.tenantId, brand.id);
      const document = absolutizeDocument(published?.document ?? platformFallback(brand.name, brand.logoUrl), `${req.protocol}://${req.hostname}`);
      return { data: effectivePayload(req.params.tenantId, brand.id, null, req.query.surface ?? "PUBLIC_HOME", document, published?.revision ?? 0) };
    },
  );

  app.get<{ Params: { file: string } }>("/public/demo-brand/:file", async (req, reply) => {
    const allowed: Record<string, string> = {
      "logo.svg": "image/svg+xml",
      "logo-dark.svg": "image/svg+xml",
      "favicon.svg": "image/svg+xml",
      "hero.png": "image/png",
    };
    const contentType = allowed[req.params.file];
    if (!contentType) return reply.code(404).send({ type: "not-found", title: "Asset not found", status: 404 });
    const file = new URL(`../../assets/demo-brand/${req.params.file}`, import.meta.url);
    const body = await readFile(file);
    return reply.header("content-type", contentType).header("cache-control", "public, max-age=31536000, immutable").send(body);
  });

  app.get<{ Params: { tenantId: string; brandId: string; assetId: string } }>(
    "/public/tenants/:tenantId/brands/:brandId/assets/:assetId",
    async (req, reply) => {
      const asset = await container.brandAssets.findById(req.params.tenantId, req.params.brandId, req.params.assetId);
      if (!asset || asset.status !== "READY") return reply.code(404).send({ type: "not-found", title: "Asset not found", status: 404 });
      const stored = await container.brandAssetStorage.get(asset.storagePath);
      if (!stored) return reply.code(404).send({ type: "not-found", title: "Asset not found", status: 404 });
      return reply.header("content-type", stored.mimeType).header("cache-control", "public, max-age=31536000, immutable").send(Buffer.from(stored.bytes));
    },
  );
}

function effectivePayload(tenantId: string, brandId: string, branchId: string | null, surface: string, document: BrandPresentation["document"], revision: number) {
  return { tenantId, brandId, branchId, revision, surface, document, cacheKey: `${tenantId}:${brandId}:${branchId ?? "-"}:${revision}:${surface}` };
}

function platformFallback(name: string, logoUrl?: string): BrandPresentation["document"] {
  return brandPresentationDocumentSchema.parse({
    identity: { displayName: name },
    assets: logoUrl ? { logo: { assetId: "00000000-0000-0000-0000-000000000000", kind: "LOGO", url: logoUrl, mimeType: "image/png", checksum: "legacy" } } : {},
    colors: { primary: "#2B5CAD", canvas: "#FFFFFF", surface: "#FFFFFF", text: "#1A1A1A", mutedText: "#595959", border: "#D0D0D0" },
    typography: {}, shape: {}, templates: {}, content: { locale: "es-AR" },
  });
}

function absolutizeDocument(document: BrandPresentation["document"], origin: string): BrandPresentation["document"] {
  const assets = { ...document.assets };
  for (const key of ["logo", "logoCompact", "logoDark", "favicon", "hero", "background"] as const) {
    const asset = assets[key];
    if (asset?.url.startsWith("/")) assets[key] = { ...asset, url: `${origin}${asset.url}` };
  }
  return { ...document, assets };
}

function validateAsset(mimeType: string, bytes: Buffer): string | null {
  const prefix = bytes.subarray(0, 16);
  const ascii = prefix.toString("ascii");
  if (mimeType === "image/png" && !prefix.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "Invalid PNG signature";
  if (mimeType === "image/jpeg" && !(prefix[0] === 0xff && prefix[1] === 0xd8)) return "Invalid JPEG signature";
  if (mimeType === "image/webp" && !(ascii.startsWith("RIFF") && ascii.includes("WEBP"))) return "Invalid WebP signature";
  if (mimeType === "font/woff2" && !ascii.startsWith("wOF2")) return "Invalid WOFF2 signature";
  if (mimeType === "image/svg+xml") {
    const svg = bytes.toString("utf8").toLowerCase();
    if (!svg.includes("<svg") || /<script|javascript:|onload\s*=|onerror\s*=|<foreignobject/.test(svg)) return "Unsafe SVG";
  }
  return null;
}
