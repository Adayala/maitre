import { z } from "zod";

const cssHexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Expected #RRGGBB color");
const assetKindSchema = z.enum(["LOGO", "LOGO_COMPACT", "LOGO_DARK", "FAVICON", "HERO", "BACKGROUND", "PLACEHOLDER", "FONT"]);

export const brandAssetRefSchema = z.object({
  assetId: z.string().uuid(),
  kind: assetKindSchema,
  url: z.string().min(1),
  mimeType: z.string().min(1),
  checksum: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const brandFontRefSchema = z.object({
  family: z.string().trim().min(1).max(100),
  assetId: z.string().uuid().optional(),
  fallback: z.string().trim().min(1).max(200).default("system-ui, sans-serif"),
  weights: z.array(z.number().int().min(100).max(900)).min(1).default([400, 700]),
});

export const brandPresentationDocumentSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  identity: z.object({
    displayName: z.string().trim().min(1).max(100).optional(),
    shortName: z.string().trim().min(1).max(40).optional(),
    tagline: z.string().trim().max(180).optional(),
  }).default({}),
  assets: z.object({
    logo: brandAssetRefSchema.optional(),
    logoCompact: brandAssetRefSchema.optional(),
    logoDark: brandAssetRefSchema.optional(),
    favicon: brandAssetRefSchema.optional(),
    hero: brandAssetRefSchema.optional(),
    background: brandAssetRefSchema.optional(),
    placeholders: z.record(z.string(), brandAssetRefSchema).optional(),
  }).default({}),
  colors: z.object({
    primary: cssHexColorSchema.optional(),
    secondary: cssHexColorSchema.optional(),
    accent: cssHexColorSchema.optional(),
    canvas: cssHexColorSchema.optional(),
    surface: cssHexColorSchema.optional(),
    text: cssHexColorSchema.optional(),
    mutedText: cssHexColorSchema.optional(),
    border: cssHexColorSchema.optional(),
  }).default({}),
  typography: z.object({
    heading: brandFontRefSchema.optional(),
    body: brandFontRefSchema.optional(),
    numeric: brandFontRefSchema.optional(),
    scale: z.enum(["compact", "comfortable", "large"]).optional(),
  }).default({}),
  shape: z.object({
    radius: z.enum(["none", "small", "medium", "large"]).optional(),
    elevation: z.enum(["flat", "subtle", "expressive"]).optional(),
  }).default({}),
  templates: z.record(z.string(), z.object({
    templateId: z.string().trim().min(1).max(80),
    variant: z.string().trim().max(80).optional(),
    config: z.record(z.string(), z.unknown()).optional(),
  })).default({}),
  content: z.object({
    locale: z.string().trim().min(2).max(20).optional(),
    supportUrl: z.string().url().optional(),
    legalUrl: z.string().url().optional(),
    social: z.record(z.string(), z.string().url()).optional(),
  }).default({}),
});

export const brandPresentationStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export type BrandAssetRef = z.infer<typeof brandAssetRefSchema>;
export type BrandPresentationDocument = z.infer<typeof brandPresentationDocumentSchema>;
export type BrandPresentationStatus = z.infer<typeof brandPresentationStatusSchema>;

export interface BrandPresentation {
  id: string;
  tenantId: string;
  brandId: string;
  revision: number;
  status: BrandPresentationStatus;
  document: BrandPresentationDocument;
  createdAt: Date;
  createdBy?: string;
  publishedAt?: Date | null;
  publishedBy?: string | null;
}

export interface BrandAsset {
  id: string;
  tenantId: string;
  brandId: string;
  kind: z.infer<typeof assetKindSchema>;
  storageBucket: string;
  storagePath: string;
  publicUrl?: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
  width?: number;
  height?: number;
  status: "UPLOADING" | "PROCESSING" | "READY" | "REJECTED" | "ARCHIVED";
  createdAt: Date;
  createdBy?: string;
}
