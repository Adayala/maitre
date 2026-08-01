import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryBrandPresentationRepository } from "@maitre/adapter-persistence-memory";
import type { BrandPresentation } from "@maitre/organization";
import {
  ensureDemoBrandPresentation,
  isLegacyDemoPresentation,
} from "../composition/container.js";

const tenantId = "00000000-0000-0000-0000-000000000001";
const brandId = "00000000-0000-0000-0000-000000000002";
const presentationId = "00000000-0000-0000-0000-000000000020";
const now = new Date("2026-08-01T12:00:00.000Z");

test("seeds the demo brand with a contemporary system font profile", async () => {
  const repository = new InMemoryBrandPresentationRepository();
  await ensureDemoBrandPresentation(repository, tenantId, brandId, now);

  const published = await repository.findPublished(tenantId, brandId);
  assert.ok(published);
  assert.equal(published.document.colors.primary, "#FF5C35");
  assert.equal(published.document.colors.canvas, "#F6F8FC");
  assert.equal(published.document.typography.heading?.family, "system-ui");
  assert.equal(published.document.shape.radius, "large");
  assert.equal(
    published.document.templates["DASH"]?.templateId,
    "contemporary",
  );
});

test("upgrades only the untouched legacy demo presentation", async () => {
  const repository = new InMemoryBrandPresentationRepository();
  const seeded = await seedAndRead(repository);
  const legacy = legacyPresentation(seeded);
  await repository.save(legacy);

  await ensureDemoBrandPresentation(repository, tenantId, brandId, now);

  const upgraded = await repository.findPublished(tenantId, brandId);
  assert.ok(upgraded);
  assert.equal(upgraded.id, legacy.id);
  assert.equal(upgraded.revision, 1);
  assert.equal(upgraded.document.colors.primary, "#FF5C35");
  assert.equal(upgraded.document.typography.heading?.family, "system-ui");
});

test("preserves a presentation customized by the tenant", async () => {
  const repository = new InMemoryBrandPresentationRepository();
  const seeded = await seedAndRead(repository);
  const customized: BrandPresentation = {
    ...seeded,
    revision: 2,
    document: {
      ...seeded.document,
      colors: { ...seeded.document.colors, primary: "#123456" },
      typography: {
        ...seeded.document.typography,
        heading: {
          family: "Custom Sans",
          fallback: "sans-serif",
          weights: [700],
        },
      },
    },
  };
  await repository.save(customized);

  await ensureDemoBrandPresentation(repository, tenantId, brandId, now);

  assert.deepEqual(
    await repository.findPublished(tenantId, brandId),
    customized,
  );
});

test("legacy detection requires the exact seeded signature", async () => {
  const repository = new InMemoryBrandPresentationRepository();
  const seeded = await seedAndRead(repository);
  const legacy = legacyPresentation(seeded);
  assert.equal(isLegacyDemoPresentation(legacy), true);
  assert.equal(
    isLegacyDemoPresentation({ ...legacy, id: crypto.randomUUID() }),
    false,
  );
  assert.equal(isLegacyDemoPresentation({ ...legacy, revision: 2 }), false);
  assert.equal(
    isLegacyDemoPresentation({
      ...legacy,
      document: {
        ...legacy.document,
        colors: { ...legacy.document.colors, primary: "#123456" },
      },
    }),
    false,
  );
  assert.equal(
    isLegacyDemoPresentation({
      ...legacy,
      document: {
        ...legacy.document,
        typography: {
          ...legacy.document.typography,
          heading: {
            family: "Custom Sans",
            fallback: "sans-serif",
            weights: [700],
          },
        },
      },
    }),
    false,
  );
});

async function seedAndRead(
  repository: InMemoryBrandPresentationRepository,
): Promise<BrandPresentation> {
  await ensureDemoBrandPresentation(repository, tenantId, brandId, now);
  const presentation = await repository.findPublished(tenantId, brandId);
  assert.ok(presentation);
  return presentation;
}

function legacyPresentation(
  presentation: BrandPresentation,
): BrandPresentation {
  return {
    ...presentation,
    id: presentationId,
    revision: 1,
    document: {
      ...presentation.document,
      colors: { ...presentation.document.colors, primary: "#A63D2F" },
      typography: {
        ...presentation.document.typography,
        heading: {
          family: "Georgia",
          fallback: "Georgia, serif",
          weights: [400, 700],
        },
      },
    },
  };
}
