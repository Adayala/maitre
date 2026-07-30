import assert from "node:assert/strict";
import { test } from "node:test";
import {
  encodeInvoiceEmailTemplate,
  InvalidInvoiceEmailTemplateError,
  renderInvoiceEmailTemplate,
} from "../application/invoice-email-template.js";
import type { InvoiceTemplate } from "../domain/invoice-template.js";

const values = {
  issuerName: "<Maitre & Co>",
  voucherType: "FACTURA_A",
  voucherNumber: "00001-00000042",
  total: "1210.00",
  currency: "ARS",
  environment: "HOMOLOGATION",
};

test("email template renders allowlisted variables and escapes generated HTML", () => {
  const now = new Date("2026-07-30T13:00:00.000Z");
  const template: InvoiceTemplate = {
    id: "template-1",
    tenantId: "tenant-1",
    name: "Factura por email",
    channel: "EMAIL",
    status: "PUBLISHED",
    contentRef: encodeInvoiceEmailTemplate({
      subject: "{{voucherType}} {{voucherNumber}}",
      text: "Hola\n{{issuerName}} emitio {{currency}} {{total}}",
    }),
    variableSchemaVersion: 1,
    layoutNormativeVersion: "email-v1",
    revision: 2,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  };

  const rendered = renderInvoiceEmailTemplate(template, values);
  assert.equal(rendered.subject, "FACTURA_A 00001-00000042");
  assert.match(rendered.text, /<Maitre & Co>/);
  assert.match(rendered.html, /&lt;Maitre &amp; Co&gt;/);
  assert.doesNotMatch(rendered.html, /<Maitre/);
});

test("email template rejects variables outside the allowlist", () => {
  assert.throws(
    () =>
      encodeInvoiceEmailTemplate({
        subject: "Factura",
        text: "CAE {{cae}}",
      }),
    InvalidInvoiceEmailTemplateError,
  );
});

test("email template has a deterministic safe fallback", () => {
  const first = renderInvoiceEmailTemplate(null, values);
  const second = renderInvoiceEmailTemplate(null, values);
  assert.deepEqual(first, second);
  assert.equal(first.templateId, null);
  assert.match(first.subject, /FACTURA_A/);
});
