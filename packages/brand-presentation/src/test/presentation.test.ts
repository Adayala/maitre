import assert from "node:assert/strict";
import test from "node:test";
import { PLATFORM_PRESENTATION, mergeBrandPresentation } from "../index.js";

test("platform presentation is a modern neutral default", () => {
  assert.equal(PLATFORM_PRESENTATION.colors.canvas, "#F5F7FB");
  assert.equal(PLATFORM_PRESENTATION.colors.primary, "#5B5CE2");
  assert.equal(PLATFORM_PRESENTATION.shape.radius, "large");
  assert.equal(PLATFORM_PRESENTATION.typography.heading?.family, "system-ui");
});

test("a partial white-label document inherits every missing platform token", () => {
  const effective = mergeBrandPresentation({
    schemaVersion: 1,
    identity: { displayName: "Casa Norte" },
    assets: {},
    colors: { primary: "#7C3AED" },
    typography: {},
    shape: { radius: "small" },
    templates: {},
    content: {},
  });
  assert.equal(effective.identity.displayName, "Casa Norte");
  assert.equal(effective.colors.primary, "#7C3AED");
  assert.equal(effective.colors.canvas, "#F5F7FB");
  assert.equal(effective.colors.text, "#101828");
  assert.equal(effective.typography.body?.family, "system-ui");
  assert.equal(effective.shape.radius, "small");
  assert.equal(effective.shape.elevation, "subtle");
  assert.equal(effective.content.locale, "es-AR");
});
