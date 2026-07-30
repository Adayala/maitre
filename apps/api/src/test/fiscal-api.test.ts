import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import {
  InMemoryOutboxRepository,
  type FixtureSessionVerificationPort,
} from "@maitre/adapter-persistence-memory";

const DEMO_POS_ID = "00000000-0000-0000-0000-00000000000f";
const DEMO_CUIT = "20123456786";

function serialTest(name: string, fn: () => Promise<void> | void) {
  return test(name, { concurrency: false }, fn);
}

async function getContext(container: Container) {
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  const tenantId = memberships[0]!.tenantId;
  const branches = await container.branches.listByTenant(tenantId);
  const fe = await container.fiscalEntities.findByCuit(tenantId, DEMO_CUIT);
  return { tenantId, branchId: branches[0]!.id, fiscalEntityId: fe!.id };
}

function ownerHeaders(container: Container, tenantId: string) {
  return {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": tenantId,
  };
}

function sessionsOf(container: Container): FixtureSessionVerificationPort {
  return container.sessions as FixtureSessionVerificationPort;
}

async function roleHeaders(
  container: Container,
  tenantId: string,
  roleId: string,
  subject: string,
) {
  const now = new Date();
  await container.users.save({
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: subject,
    displayName: subject,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: (await container.users.findByExternalIdentity("fixture", subject))!
      .id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: [roleId],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = `${subject}-token`;
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });
  return { authorization: `Bearer ${token}`, "x-tenant-id": tenantId };
}

// Seeds a Floor Check directly (the Invoice create flow snapshots it).
async function seedCheck(
  container: Container,
  tenantId: string,
  branchId: string,
): Promise<string> {
  const now = new Date();
  const id = randomUUID();
  await container.checks.save({
    id,
    tenantId,
    branchId,
    visitId: randomUUID(),
    currency: "ARS",
    lines: [
      {
        id: randomUUID(),
        description: "Bife de chorizo",
        amountMinorUnits: 150000,
      },
      { id: randomUUID(), description: "Malbec", amountMinorUnits: 50000 },
    ],
    adjustments: [],
    status: "OPEN",
    revision: 2,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

async function createInvoiceFromCheck(
  container: Container,
  headers: Record<string, string>,
  fiscalEntityId: string,
  checkId: string,
) {
  const app = await buildApp(container);
  return app.inject({
    method: "POST",
    url: "/v1/invoices",
    headers,
    payload: {
      fiscalEntityId,
      pointOfSaleId: DEMO_POS_ID,
      voucherType: "FACTURA_A",
      currency: "ARS",
      sourceCheckId: checkId,
    },
  });
}

serialTest(
  "Fiscal API: create invoice from a Check, validate, issue with fake CAE + number 1",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId, fiscalEntityId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const checkId = await seedCheck(container, tenantId, branchId);

    const created = await createInvoiceFromCheck(
      container,
      headers,
      fiscalEntityId,
      checkId,
    );
    assert.equal(created.statusCode, 201);
    const invoice = created.json().data;
    assert.equal(invoice.status, "DRAFT");
    // 200000 net, 21% => 42000 tax, 242000 gross.
    assert.equal(invoice.totals.netMinorUnits, 200000);
    assert.equal(invoice.totals.taxAmountMinorUnits, 42000);
    assert.equal(invoice.totals.grossMinorUnits, 242000);
    assert.equal(invoice.sourceCheckRevision, 2);

    const validated = await app.inject({
      method: "POST",
      url: `/v1/invoices/${invoice.id}/validate`,
      headers,
    });
    assert.equal(validated.statusCode, 200);
    assert.equal(validated.json().data.status, "VALIDATED");

    const issued = await app.inject({
      method: "POST",
      url: `/v1/invoices/${invoice.id}/issue`,
      headers,
    });
    assert.equal(issued.statusCode, 200);
    const issuedInvoice = issued.json().data;
    assert.equal(issuedInvoice.status, "AUTHORIZED");
    assert.equal(issuedInvoice.number, 1);
    assert.ok(String(issuedInvoice.cae).startsWith("SIM"));
    assert.ok(issuedInvoice.caeExpiresAt);
  },
);

serialTest(
  "Fiscal API: creates a branch-owned ARCA point of sale and verifies registration",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId, fiscalEntityId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const branch = await container.branches.findById(tenantId, branchId);
    assert.ok(branch);
    await container.branches.save({
      ...branch,
      fiscalEntityId,
      updatedAt: new Date(),
    });

    const created = await app.inject({
      method: "POST",
      url: "/v1/fiscal-points-of-sale",
      headers,
      payload: {
        fiscalEntityId,
        branchId,
        environment: "PRODUCTION",
        officialCode: "23",
        arcaDomicileCode: "DOM-ARCA-1",
        arcaDomicileLabel: "Casa central",
        issuingSystem: "WSFEV1",
        allowedVoucherTypes: ["FACTURA_A"],
      },
    });
    assert.equal(created.statusCode, 201);
    const pos = created.json().data;
    assert.equal(pos.branchId, branchId);
    assert.equal(pos.registrationStatus, "DECLARED");
    assert.equal(pos.arcaDomicileCode, "DOM-ARCA-1");

    const withoutEvidence = await app.inject({
      method: "POST",
      url: `/v1/fiscal-points-of-sale/${pos.id}/registration`,
      headers,
      payload: { status: "VERIFIED" },
    });
    assert.equal(withoutEvidence.statusCode, 400);

    const verified = await app.inject({
      method: "POST",
      url: `/v1/fiscal-points-of-sale/${pos.id}/registration`,
      headers,
      payload: {
        status: "VERIFIED",
        evidenceRef: "arca://registration/23",
      },
    });
    assert.equal(verified.statusCode, 200);
    assert.equal(verified.json().data.registrationStatus, "VERIFIED");
    assert.equal(
      verified.json().data.registrationEvidenceRef,
      "arca://registration/23",
    );
    assert.ok(verified.json().data.verifiedAt);
  },
);

serialTest(
  "Fiscal API: rejects a point of sale whose branch has another fiscal owner",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId, fiscalEntityId } = await getContext(container);
    const app = await buildApp(container);
    const response = await app.inject({
      method: "POST",
      url: "/v1/fiscal-points-of-sale",
      headers: ownerHeaders(container, tenantId),
      payload: {
        fiscalEntityId,
        branchId,
        environment: "HOMOLOGATION",
        officialCode: "24",
        arcaDomicileCode: "DOM-ARCA-2",
        allowedVoucherTypes: ["FACTURA_A"],
      },
    });

    assert.equal(response.statusCode, 400);
    assert.equal(
      response.json().title,
      "Branch must be explicitly associated with the same fiscal entity",
    );
  },
);

serialTest(
  "Fiscal API: a second invoice on the same POS+voucherType gets number 2",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId, fiscalEntityId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const c1 = await seedCheck(container, tenantId, branchId);
    const i1 = (
      await createInvoiceFromCheck(container, headers, fiscalEntityId, c1)
    ).json().data;
    const issued1 = await app.inject({
      method: "POST",
      url: `/v1/invoices/${i1.id}/issue`,
      headers,
    });
    assert.equal(issued1.json().data.number, 1);

    const c2 = await seedCheck(container, tenantId, branchId);
    const i2 = (
      await createInvoiceFromCheck(container, headers, fiscalEntityId, c2)
    ).json().data;
    const issued2 = await app.inject({
      method: "POST",
      url: `/v1/invoices/${i2.id}/issue`,
      headers,
    });
    assert.equal(issued2.json().data.number, 2);
  },
);

serialTest(
  "Fiscal API: void-draft before issue, then issue conflicts 409",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId, fiscalEntityId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const checkId = await seedCheck(container, tenantId, branchId);
    const invoice = (
      await createInvoiceFromCheck(container, headers, fiscalEntityId, checkId)
    ).json().data;

    const voided = await app.inject({
      method: "POST",
      url: `/v1/invoices/${invoice.id}/void-draft`,
      headers,
    });
    assert.equal(voided.statusCode, 200);
    assert.equal(voided.json().data.status, "VOIDED_DRAFT");

    const issue = await app.inject({
      method: "POST",
      url: `/v1/invoices/${invoice.id}/issue`,
      headers,
    });
    assert.equal(issue.statusCode, 409);
  },
);

serialTest(
  "Fiscal API: credit note references the original without mutating it",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId, fiscalEntityId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const checkId = await seedCheck(container, tenantId, branchId);
    const invoice = (
      await createInvoiceFromCheck(container, headers, fiscalEntityId, checkId)
    ).json().data;
    const original = (
      await app.inject({
        method: "POST",
        url: `/v1/invoices/${invoice.id}/issue`,
        headers,
      })
    ).json().data;

    const credit = await app.inject({
      method: "POST",
      url: `/v1/invoices/${invoice.id}/credit`,
      headers,
    });
    assert.equal(credit.statusCode, 201);
    const note = credit.json().data;
    assert.equal(note.voucherType, "NOTA_CREDITO_A");
    assert.equal(note.linkedInvoiceId, original.id);
    assert.equal(note.status, "DRAFT");

    const reloaded = (
      await app.inject({
        method: "GET",
        url: `/v1/invoices/${original.id}`,
        headers,
      })
    ).json().data;
    assert.equal(reloaded.status, "AUTHORIZED");
    assert.equal(reloaded.number, 1);
    assert.equal(reloaded.linkedInvoiceId, null);
  },
);

serialTest(
  "Fiscal API: re-issuing an AUTHORIZED invoice conflicts 409",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId, fiscalEntityId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const checkId = await seedCheck(container, tenantId, branchId);
    const invoice = (
      await createInvoiceFromCheck(container, headers, fiscalEntityId, checkId)
    ).json().data;
    await app.inject({
      method: "POST",
      url: `/v1/invoices/${invoice.id}/issue`,
      headers,
    });
    const again = await app.inject({
      method: "POST",
      url: `/v1/invoices/${invoice.id}/issue`,
      headers,
    });
    assert.equal(again.statusCode, 409);
  },
);

serialTest(
  "Fiscal API: QR payload is deterministic across two calls for an AUTHORIZED invoice",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId, fiscalEntityId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const checkId = await seedCheck(container, tenantId, branchId);
    const invoice = (
      await createInvoiceFromCheck(container, headers, fiscalEntityId, checkId)
    ).json().data;
    await app.inject({
      method: "POST",
      url: `/v1/invoices/${invoice.id}/issue`,
      headers,
    });

    const qr1 = (
      await app.inject({
        method: "GET",
        url: `/v1/invoices/${invoice.id}/qr`,
        headers,
      })
    ).json().data;
    const qr2 = (
      await app.inject({
        method: "GET",
        url: `/v1/invoices/${invoice.id}/qr`,
        headers,
      })
    ).json().data;
    assert.equal(qr1.payloadHash, qr2.payloadHash);
    assert.equal(qr1.canonicalPayload, qr2.canonicalPayload);
    assert.equal(qr1.payloadHash.length, 64);
  },
);

serialTest(
  "Fiscal API: authorized invoice document downloads deterministic HTML",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId, fiscalEntityId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const checkId = await seedCheck(container, tenantId, branchId);
    const invoice = (
      await createInvoiceFromCheck(container, headers, fiscalEntityId, checkId)
    ).json().data;

    const draftDocument = await app.inject({
      method: "GET",
      url: `/v1/invoices/${invoice.id}/document`,
      headers,
    });
    assert.equal(draftDocument.statusCode, 409);

    await app.inject({
      method: "POST",
      url: `/v1/invoices/${invoice.id}/issue`,
      headers,
    });
    const first = await app.inject({
      method: "GET",
      url: `/v1/invoices/${invoice.id}/document`,
      headers,
    });
    const second = await app.inject({
      method: "GET",
      url: `/v1/invoices/${invoice.id}/document`,
      headers,
    });

    assert.equal(first.statusCode, 200);
    assert.match(first.headers["content-type"] ?? "", /^text\/html/);
    assert.match(first.headers["content-disposition"] ?? "", /^attachment;/);
    assert.equal(first.headers.etag, second.headers.etag);
    assert.equal(first.body, second.body);
    assert.match(first.body, /HOMOLOGACIÓN · SIN VALIDEZ FISCAL PRODUCTIVA/);
    assert.match(first.body, /CAE/);

    const pdfFirst = await app.inject({
      method: "GET",
      url: `/v1/invoices/${invoice.id}/document?format=pdf`,
      headers,
    });
    const pdfSecond = await app.inject({
      method: "GET",
      url: `/v1/invoices/${invoice.id}/document?format=pdf`,
      headers,
    });
    assert.equal(pdfFirst.statusCode, 200);
    assert.equal(pdfFirst.headers["content-type"], "application/pdf");
    assert.match(pdfFirst.headers["content-disposition"] ?? "", /\.pdf"/);
    assert.equal(pdfFirst.headers.etag, pdfSecond.headers.etag);
    assert.equal(pdfFirst.rawPayload.subarray(0, 5).toString(), "%PDF-");
    assert.deepEqual(pdfFirst.rawPayload, pdfSecond.rawPayload);
  },
);

serialTest(
  "Fiscal API: queues invoice email delivery idempotently without email in outbox",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId, fiscalEntityId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const checkId = await seedCheck(container, tenantId, branchId);
    const invoice = (
      await createInvoiceFromCheck(container, headers, fiscalEntityId, checkId)
    ).json().data;
    await app.inject({
      method: "POST",
      url: `/v1/invoices/${invoice.id}/issue`,
      headers,
    });

    const request = {
      method: "POST" as const,
      url: `/v1/invoices/${invoice.id}/deliveries`,
      headers: { ...headers, "idempotency-key": "email-invoice-1" },
      payload: { recipientEmail: "CLIENTE@Example.com", format: "PDF" },
    };
    const first = await app.inject(request);
    const replay = await app.inject(request);

    assert.equal(first.statusCode, 202);
    assert.equal(replay.statusCode, 200);
    assert.equal(first.json().data.id, replay.json().data.id);
    assert.equal(replay.json().meta.idempotentReplay, true);
    assert.equal(first.json().data.recipientEmail, "cliente@example.com");
    const summary = await app.inject({
      method: "GET",
      url: "/v1/invoice-deliveries/summary",
      headers,
    });
    assert.equal(summary.statusCode, 200);
    assert.deepEqual(summary.json().data, {
      tenantId,
      total: 1,
      queued: 1,
      processing: 0,
      sent: 0,
      failed: 0,
      oldestPendingAt: first.json().data.createdAt,
    });

    const events = (
      container.outbox as InMemoryOutboxRepository
    ).all().filter((record) => record.eventName === "fiscal.invoice-delivery.queued.v1");
    assert.equal(events.length, 1);
    assert.doesNotMatch(JSON.stringify(events[0]!.payload), /cliente@example\.com/i);

    const conflictResponse = await app.inject({
      ...request,
      payload: { recipientEmail: "otro@example.com", format: "PDF" },
    });
    assert.equal(conflictResponse.statusCode, 409);
  },
);

serialTest(
  "Fiscal API: renders and processes a queued PDF delivery through the email port",
  async () => {
    const previousApiKey = process.env["RESEND_API_KEY"];
    const previousFrom = process.env["FISCAL_EMAIL_FROM"];
    const previousCronSecret = process.env["CRON_SECRET"];
    const previousFetch = globalThis.fetch;
    process.env["RESEND_API_KEY"] = "test-key";
    process.env["FISCAL_EMAIL_FROM"] = "Maitre <facturas@example.com>";
    process.env["CRON_SECRET"] = "test-cron-secret";
    let providerBody: Record<string, unknown> | undefined;
    globalThis.fetch = async (_input, init) => {
      providerBody = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ id: "provider-email-1" }), {
        status: 200,
      });
    };
    try {
      const container = await buildContainer();
      const { tenantId, branchId, fiscalEntityId } = await getContext(container);
      const app = await buildApp(container);
      const headers = ownerHeaders(container, tenantId);
      const emailTemplate = await app.inject({
        method: "POST",
        url: "/v1/invoice-templates",
        headers,
        payload: {
          name: "Email fiscal",
          channel: "EMAIL",
          emailContent: {
            subject: "Comprobante {{voucherNumber}}",
            text: "Emitido por {{issuerName}} por {{currency}} {{total}}",
          },
          variableSchemaVersion: 1,
          layoutNormativeVersion: "email-v1",
        },
      });
      assert.equal(emailTemplate.statusCode, 201);
      await app.inject({
        method: "POST",
        url: `/v1/invoice-templates/${emailTemplate.json().data.id}/publish`,
        headers,
      });
      const checkId = await seedCheck(container, tenantId, branchId);
      const invoice = (
        await createInvoiceFromCheck(container, headers, fiscalEntityId, checkId)
      ).json().data;
      await app.inject({
        method: "POST",
        url: `/v1/invoices/${invoice.id}/issue`,
        headers,
      });
      const queued = await app.inject({
        method: "POST",
        url: `/v1/invoices/${invoice.id}/deliveries`,
        headers: { ...headers, "idempotency-key": "runtime-email-1" },
        payload: { recipientEmail: "client@example.com", format: "PDF" },
      });
      const unauthorized = await app.inject({
        method: "GET",
        url: "/internal/fiscal/invoice-deliveries/process",
      });
      assert.equal(unauthorized.statusCode, 401);
      const processed = await app.inject({
        method: "GET",
        url: "/internal/fiscal/invoice-deliveries/process",
        headers: { authorization: "Bearer test-cron-secret" },
      });

      assert.equal(processed.statusCode, 200);
      assert.equal(processed.json().data.sent, 1);
      const delivery = await container.invoiceDeliveries.findById(
        tenantId,
        queued.json().data.id,
      );
      assert.equal(delivery?.status, "SENT");
      assert.match(String(providerBody?.["subject"]), /^Comprobante /);
      const attachments = providerBody?.["attachments"] as Array<{
        filename: string;
        content: string;
      }>;
      assert.match(attachments[0]!.filename, /\.pdf$/);
      assert.match(
        Buffer.from(attachments[0]!.content, "base64").subarray(0, 5).toString(),
        /^%PDF-/,
      );
    } finally {
      globalThis.fetch = previousFetch;
      if (previousApiKey === undefined) delete process.env["RESEND_API_KEY"];
      else process.env["RESEND_API_KEY"] = previousApiKey;
      if (previousFrom === undefined) delete process.env["FISCAL_EMAIL_FROM"];
      else process.env["FISCAL_EMAIL_FROM"] = previousFrom;
      if (previousCronSecret === undefined) delete process.env["CRON_SECRET"];
      else process.env["CRON_SECRET"] = previousCronSecret;
    }
  },
);

serialTest(
  "Fiscal API: invoice export manifest sums authorized totals",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId, fiscalEntityId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const c1 = await seedCheck(container, tenantId, branchId);
    const i1 = (
      await createInvoiceFromCheck(container, headers, fiscalEntityId, c1)
    ).json().data;
    await app.inject({
      method: "POST",
      url: `/v1/invoices/${i1.id}/issue`,
      headers,
    });

    const res = await app.inject({
      method: "POST",
      url: "/v1/invoice-exports",
      headers,
      payload: {
        fiscalEntityId,
        periodFrom: "2020-01-01T00:00:00.000Z",
        periodTo: "2100-01-01T00:00:00.000Z",
      },
    });
    assert.equal(res.statusCode, 200);
    const manifest = res.json().data;
    assert.equal(manifest.authorizedCount, 1);
    assert.equal(manifest.grandTotalGrossMinorUnits, 242000);
    assert.equal(manifest.presented, false);
  },
);

serialTest("Fiscal API: create/publish tax rate + resolve", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const created = await app.inject({
    method: "POST",
    url: "/v1/tax-rates",
    headers,
    payload: {
      jurisdiction: "AR",
      taxType: "IIBB",
      officialCode: "77",
      treatment: "TAXED",
      decimalRate: 350,
      effectiveFrom: "2026-01-01T00:00:00.000Z",
      normativeSourceVersion: "test-v1",
    },
  });
  assert.equal(created.statusCode, 201);
  const rateId = created.json().data.id;

  const published = await app.inject({
    method: "POST",
    url: `/v1/tax-rates/${rateId}/publish`,
    headers,
  });
  assert.equal(published.statusCode, 200);
  assert.equal(published.json().data.status, "PUBLISHED");

  const resolved = await app.inject({
    method: "GET",
    url: `/v1/tax-rates/resolve?jurisdiction=AR&taxType=IIBB&at=2026-06-01T00:00:00.000Z`,
    headers,
  });
  assert.equal(resolved.statusCode, 200);
  assert.equal(resolved.json().data.resolved.id, rateId);
});

serialTest(
  "Fiscal API: create fiscal printer + activate + test (no-op)",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const created = await app.inject({
      method: "POST",
      url: "/v1/fiscal-printers",
      headers,
      payload: {
        branchId,
        provider: "epson",
        model: "TM-T900",
        deviceId: "dev-1",
        capabilities: ["PRINT"],
      },
    });
    assert.equal(created.statusCode, 201);
    const printerId = created.json().data.id;

    const test1 = await app.inject({
      method: "POST",
      url: `/v1/fiscal-printers/${printerId}/test`,
      headers,
    });
    assert.equal(test1.statusCode, 200);
    assert.equal(test1.json().data.simulated, true);
  },
);

serialTest("Fiscal API: create/publish invoice template", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const created = await app.inject({
    method: "POST",
    url: "/v1/invoice-templates",
    headers,
    payload: {
      name: "Default A",
      contentRef: "ref-1",
      layoutNormativeVersion: "layout-v1",
    },
  });
  assert.equal(created.statusCode, 201);
  const templateId = created.json().data.id;

  const published = await app.inject({
    method: "POST",
    url: `/v1/invoice-templates/${templateId}/publish`,
    headers,
  });
  assert.equal(published.statusCode, 200);
  assert.equal(published.json().data.status, "PUBLISHED");
});

serialTest(
  "Fiscal API: 403 without permission, 404 for unknown id",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const app = await buildApp(container);

    // role_employee has no fiscal permissions.
    const employee = await roleHeaders(
      container,
      tenantId,
      "role_employee",
      "fiscal-nobody",
    );
    const forbidden = await app.inject({
      method: "GET",
      url: "/v1/invoices",
      headers: employee,
    });
    assert.equal(forbidden.statusCode, 403);

    const owner = ownerHeaders(container, tenantId);
    const missing = await app.inject({
      method: "GET",
      url: `/v1/invoices/${randomUUID()}`,
      headers: owner,
    });
    assert.equal(missing.statusCode, 404);
  },
);
