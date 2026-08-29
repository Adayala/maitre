import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type { FixtureSessionVerificationPort } from "@maitre/adapter-persistence-memory";
import type { Employment } from "@maitre/workforce";

// SPEC-055/056/058/059/065 §5 — Fastify inject() coverage for the Floor API.

function serialTest(name: string, fn: () => Promise<void> | void) {
  return test(name, { concurrency: false }, fn);
}

function sessionsOf(container: Container): FixtureSessionVerificationPort {
  return container.sessions as FixtureSessionVerificationPort;
}

async function getContext(container: Container) {
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  const memberships = await container.memberships.listActiveByUser(owner!.id);
  const tenantId = memberships[0]!.tenantId;
  const branches = await container.branches.listByTenant(tenantId);
  const branchId = branches[0]!.id;
  return { tenantId, branchId };
}

function ownerHeaders(container: Container, tenantId: string) {
  return {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": tenantId,
  };
}

function attachEmploymentRepository(container: Container) {
  const byId = new Map<string, Employment>();
  container.employments = {
    async findById(tenantId, id) {
      const employment = byId.get(id);
      return employment?.tenantId === tenantId ? employment : null;
    },
    async findByEmployeeCode(tenantId, employeeCode) {
      return (
        [...byId.values()].find(
          (employment) =>
            employment.tenantId === tenantId &&
            employment.employeeCode === employeeCode,
        ) ?? null
      );
    },
    async listByTenant(tenantId) {
      return [...byId.values()].filter(
        (employment) => employment.tenantId === tenantId,
      );
    },
    async save(employment) {
      byId.set(employment.id, employment);
    },
  };
  return container.employments;
}

async function openCashSession(
  app: Awaited<ReturnType<typeof buildApp>>,
  container: Container,
  tenantId: string,
  branchId: string,
) {
  const registers = await container.cashRegisters.listByBranch(
    tenantId,
    branchId,
  );
  const register = registers[0]!;
  const response = await app.inject({
    method: "POST",
    url: `/v1/cash-registers/${register.id}/sessions`,
    headers: ownerHeaders(container, tenantId),
    payload: {
      currency: "ARS",
      businessDate: "2026-07-29",
      timezone: "America/Argentina/Buenos_Aires",
      openingAmountMinorUnits: 0,
    },
  });
  assert.equal(response.statusCode, 201);
  return response.json().data as { id: string };
}

async function seedForeignServicePeriod(container: Container) {
  const now = new Date();
  const tenantId = randomUUID();
  const branchId = randomUUID();
  const servicePeriodId = randomUUID();

  await container.tenants.save({
    id: tenantId,
    name: "Foreign Tenant Floor",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
  });

  await container.branches.save({
    id: branchId,
    tenantId,
    brandId: randomUUID(),
    code: "FOREIGN",
    name: "Foreign Branch Floor",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });

  await container.servicePeriods.save({
    id: servicePeriodId,
    tenantId,
    branchId,
    businessDate: "2026-07-25",
    name: "Foreign Dinner",
    type: "DINNER",
    status: "PLANNED",
    revision: 1,
    createdAt: now,
    updatedAt: now,
  });

  return { tenantId, branchId, servicePeriodId };
}

serialTest(
  "Plaza API groups salon tables per service period and keeps tenant isolation",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const headers = ownerHeaders(container, tenantId);
    const salons = await container.salons.listByBranch(tenantId, branchId);
    const salon = salons[0]!;
    const tables = await container.tables.listBySalon(tenantId, salon.id);
    const app = await buildApp(container);
    const periodResponse = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
      payload: { businessDate: "2026-08-01", name: "Cena", type: "DINNER" },
    });
    assert.equal(periodResponse.statusCode, 201);
    const servicePeriodId = periodResponse.json().data.id as string;

    const create = await app.inject({
      method: "POST",
      url: "/v1/plazas",
      headers,
      payload: {
        salonId: salon.id,
        servicePeriodId,
        name: "Terraza",
        tableIds: [tables[0]!.id, tables[1]!.id],
      },
    });
    assert.equal(create.statusCode, 201);
    const plaza = create.json().data as {
      id: string;
      name: string;
      tableIds: string[];
    };
    assert.equal(plaza.name, "Terraza");
    assert.equal(create.json().data.mode, "VARIABLE");
    assert.deepEqual(plaza.tableIds, [tables[0]!.id, tables[1]!.id]);

    const bySalon = await app.inject({
      method: "GET",
      url: `/v1/plazas?salonId=${salon.id}`,
      headers,
    });
    assert.equal(bySalon.statusCode, 200);
    assert.equal(bySalon.json().data.length, 1);
    const byPeriod = await app.inject({
      method: "GET",
      url: `/v1/plazas?servicePeriodId=${servicePeriodId}`,
      headers,
    });
    assert.equal(byPeriod.statusCode, 200);
    assert.equal(byPeriod.json().data[0].id, plaza.id);
    const detail = await app.inject({
      method: "GET",
      url: `/v1/plazas/${plaza.id}`,
      headers,
    });
    assert.equal(detail.statusCode, 200);

    const patch = await app.inject({
      method: "PATCH",
      url: `/v1/plazas/${plaza.id}`,
      headers,
      payload: {
        name: "Patio",
        mode: "FIXED",
        waiterEmploymentId: null,
        tableIds: [tables[0]!.id],
      },
    });
    assert.equal(patch.statusCode, 200);
    assert.equal(patch.json().data.name, "Patio");
    assert.equal(patch.json().data.mode, "FIXED");
    const patchNameOnly = await app.inject({
      method: "PATCH",
      url: `/v1/plazas/${plaza.id}`,
      headers,
      payload: { name: "Patio norte" },
    });
    assert.equal(patchNameOnly.statusCode, 200);
    assert.deepEqual(patchNameOnly.json().data.tableIds, [tables[0]!.id]);

    const conflictResponse = await app.inject({
      method: "POST",
      url: "/v1/plazas",
      headers,
      payload: {
        salonId: salon.id,
        servicePeriodId,
        name: "Interior",
        tableIds: [tables[0]!.id],
      },
    });
    assert.equal(conflictResponse.statusCode, 409);

    const foreign = await seedForeignServicePeriod(container);
    const hidden = await app.inject({
      method: "GET",
      url: `/v1/plazas/${plaza.id}`,
      headers: ownerHeaders(container, foreign.tenantId),
    });
    assert.equal(hidden.statusCode, 403);
    await app.close();
  },
);

serialTest(
  "Plazas organize multiple groups per waiter and carry only fixed compositions forward",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const headers = ownerHeaders(container, tenantId);
    const salons = await container.salons.listByBranch(tenantId, branchId);
    const salon = salons[0]!;
    const tables = await container.tables.listBySalon(tenantId, salon.id);
    const now = new Date("2026-08-02T10:00:00Z");
    const employmentId = randomUUID();
    const employments = attachEmploymentRepository(container);
    await employments.save({
      id: employmentId,
      tenantId,
      personRef: "demo-owner",
      employeeCode: "MZ-7",
      relationshipType: "EMPLOYEE",
      eligibleBranchIds: [branchId],
      status: "ACTIVE",
      validFrom: now,
      createdAt: now,
      updatedAt: now,
    });
    const app = await buildApp(container);
    for (const name of ["Almuerzo anterior", "Cena anterior"]) {
      assert.equal(
        (
          await app.inject({
            method: "POST",
            url: `/v1/branches/${branchId}/service-periods`,
            headers,
            payload: {
              businessDate: "2026-08-01",
              name,
              type: "DINNER",
            },
          })
        ).statusCode,
        201,
      );
    }
    const periodResponse = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
      payload: { businessDate: "2026-08-02", name: "Cena", type: "DINNER" },
    });
    const periodId = periodResponse.json().data.id as string;
    const fixed = await app.inject({
      method: "POST",
      url: "/v1/plazas",
      headers,
      payload: {
        salonId: salon.id,
        servicePeriodId: periodId,
        name: "Terraza fija",
        mode: "FIXED",
        waiterEmploymentId: employmentId,
        tableIds: [tables[0]!.id],
      },
    });
    const variable = await app.inject({
      method: "POST",
      url: "/v1/plazas",
      headers,
      payload: {
        salonId: salon.id,
        servicePeriodId: periodId,
        name: "Apoyo variable",
        mode: "VARIABLE",
        waiterEmploymentId: employmentId,
        tableIds: [tables[1]!.id],
      },
    });
    assert.equal(fixed.statusCode, 201);
    assert.equal(variable.statusCode, 201);
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: `/v1/service-periods/${periodId}/open`,
          headers,
        })
      ).statusCode,
      200,
    );
    const active = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/active-plazas`,
      headers,
    });
    assert.equal(active.statusCode, 200);
    assert.equal(active.json().data.servicePeriod.id, periodId);
    assert.deepEqual(
      active
        .json()
        .data.plazas.map(
          (plaza: { isMine: boolean; waiterEmployeeCode: string }) => [
            plaza.isMine,
            plaza.waiterEmployeeCode,
          ],
        ),
      [
        [true, "MZ-7"],
        [true, "MZ-7"],
      ],
    );

    const nextPeriod = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
      payload: {
        businessDate: "2026-08-03",
        name: "Cena siguiente",
        type: "DINNER",
      },
    });
    assert.equal(nextPeriod.statusCode, 201);
    const copies = await container.plazas.listByServicePeriod(
      tenantId,
      nextPeriod.json().data.id,
    );
    assert.equal(copies.length, 1);
    assert.equal(copies[0]?.mode, "FIXED");
    assert.equal(copies[0]?.sourcePlazaId, fixed.json().data.id);
    assert.equal(copies[0]?.waiterEmploymentId, null);
    assert.deepEqual(copies[0]?.tableIds, [tables[0]!.id]);
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: `/v1/service-periods/${periodId}/begin-close`,
          headers,
        })
      ).statusCode,
      200,
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: `/v1/service-periods/${periodId}/close`,
          headers,
        })
      ).statusCode,
      200,
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: `/v1/service-periods/${nextPeriod.json().data.id}/open`,
          headers,
        })
      ).statusCode,
      200,
    );
    const nextActive = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/active-plazas`,
      headers,
    });
    assert.equal(nextActive.statusCode, 200);
    assert.equal(nextActive.json().data.plazas[0].waiterEmployeeCode, null);
    assert.equal(nextActive.json().data.plazas[0].isMine, false);
    await app.close();
  },
);

serialTest(
  "Active plazas returns a harmless empty organization without an open period",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const headers = ownerHeaders(container, tenantId);
    const app = await buildApp(container);
    const response = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/active-plazas`,
      headers,
    });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json().data, { servicePeriod: null, plazas: [] });

    const [salon] = await container.salons.listByBranch(tenantId, branchId);
    const [table, secondTable] = await container.tables.listBySalon(
      tenantId,
      salon!.id,
    );
    const period = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
      payload: { businessDate: "2026-08-04", name: "Cena", type: "DINNER" },
    });
    const periodId = period.json().data.id as string;
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/v1/plazas",
          headers,
          payload: {
            salonId: salon!.id,
            servicePeriodId: periodId,
            name: "Sin asignar",
            tableIds: [table!.id],
          },
        })
      ).statusCode,
      201,
    );
    const now = new Date("2026-08-04T20:00:00Z");
    await container.plazas.save({
      id: randomUUID(),
      tenantId,
      branchId,
      salonId: salon!.id,
      servicePeriodId: periodId,
      name: "Responsable no disponible",
      mode: "VARIABLE",
      waiterEmploymentId: randomUUID(),
      tableIds: [secondTable!.id],
      createdAt: now,
      updatedAt: now,
    });
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: `/v1/service-periods/${periodId}/open`,
          headers,
        })
      ).statusCode,
      200,
    );
    const activeWithoutEmploymentRepository = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/active-plazas`,
      headers,
    });
    assert.equal(activeWithoutEmploymentRepository.statusCode, 200);
    assert.equal(
      activeWithoutEmploymentRepository
        .json()
        .data.plazas.every(
          (plaza: { waiterEmployeeCode: string | null }) =>
            plaza.waiterEmployeeCode === null,
        ),
      true,
    );
    assert.equal(
      activeWithoutEmploymentRepository
        .json()
        .data.plazas.every((plaza: { isMine: boolean }) => !plaza.isMine),
      true,
    );
    await app.close();
  },
);

serialTest(
  "Fixed plaza carry-forward rejects stale compositions before creating a period",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const headers = ownerHeaders(container, tenantId);
    const [salon] = await container.salons.listByBranch(tenantId, branchId);
    const [table] = await container.tables.listBySalon(tenantId, salon!.id);
    const app = await buildApp(container);
    const period = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
      payload: { businessDate: "2026-08-04", name: "Cena", type: "DINNER" },
    });
    const plaza = await app.inject({
      method: "POST",
      url: "/v1/plazas",
      headers,
      payload: {
        salonId: salon!.id,
        servicePeriodId: period.json().data.id,
        name: "Salón fijo",
        mode: "FIXED",
        tableIds: [table!.id],
      },
    });
    assert.equal(plaza.statusCode, 201);
    await container.salons.save({
      ...salon!,
      status: "INACTIVE",
      updatedAt: new Date("2026-08-04T20:00:00Z"),
    });

    const rejected = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
      payload: {
        businessDate: "2026-08-05",
        name: "Cena siguiente",
        type: "DINNER",
      },
    });
    assert.equal(rejected.statusCode, 400);
    assert.equal(
      (await container.servicePeriods.listByBranch(tenantId, branchId)).length,
      1,
    );
    await app.close();
  },
);

serialTest(
  "Plaza reads keep scope boundaries and normalize unexpected storage failures",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const headers = ownerHeaders(container, tenantId);
    const app = await buildApp(container);
    container.plazas.listBySalon = async () => {
      throw new Error("plaza list storage failure");
    };
    assert.equal(
      (
        await app.inject({
          method: "GET",
          url: `/v1/plazas?salonId=${randomUUID()}`,
          headers,
        })
      ).statusCode,
      500,
    );
    container.servicePeriods.findActiveByBranch = async () => {
      throw new Error("active period storage failure");
    };
    assert.equal(
      (
        await app.inject({
          method: "GET",
          url: `/v1/branches/${branchId}/active-plazas`,
          headers,
        })
      ).statusCode,
      500,
    );
    container.plazas.findById = async () => {
      throw new Error("plaza detail storage failure");
    };
    assert.equal(
      (
        await app.inject({
          method: "PATCH",
          url: `/v1/plazas/${randomUUID()}`,
          headers,
          payload: { name: "Plaza actualizada" },
        })
      ).statusCode,
      500,
    );

    const now = new Date();
    const scopedUser = {
      id: randomUUID(),
      identityProvider: "fixture",
      externalIdentityId: "plaza-scoped-waiter",
      displayName: "Scoped Waiter",
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    await container.users.save(scopedUser);
    await container.memberships.save({
      id: randomUUID(),
      tenantId,
      userId: scopedUser.id,
      status: "ACTIVE",
      branchScopeType: "SELECTED_BRANCHES",
      roleIds: ["role_waiter"],
      branchIds: [randomUUID()],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const token = "plaza-scoped-waiter-token";
    sessionsOf(container).registerToken(token, {
      provider: "fixture",
      subject: scopedUser.externalIdentityId,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });
    const outsideScope = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/active-plazas`,
      headers: {
        authorization: `Bearer ${token}`,
        "x-tenant-id": tenantId,
      },
    });
    assert.equal(outsideScope.statusCode, 404);
    await app.close();
  },
);

serialTest(
  "Service period routes normalize unexpected repository failures",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const headers = ownerHeaders(container, tenantId);
    const app = await buildApp(container);
    container.servicePeriods.listByBranch = async () => {
      throw new Error("period list storage failure");
    };
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: `/v1/branches/${branchId}/service-periods`,
          headers,
          payload: {
            businessDate: "2026-08-06",
            name: "Cena",
            type: "DINNER",
          },
        })
      ).statusCode,
      500,
    );
    assert.equal(
      (
        await app.inject({
          method: "GET",
          url: `/v1/branches/${branchId}/service-periods`,
          headers,
        })
      ).statusCode,
      500,
    );
    container.servicePeriods.findById = async () => {
      throw new Error("period detail storage failure");
    };
    const periodId = randomUUID();
    for (const request of [
      { method: "GET", url: `/v1/service-periods/${periodId}` },
      { method: "POST", url: `/v1/service-periods/${periodId}/open` },
      {
        method: "POST",
        url: `/v1/service-periods/${periodId}/begin-close`,
      },
      {
        method: "POST",
        url: `/v1/service-periods/${periodId}/close`,
        payload: {},
      },
      {
        method: "POST",
        url: `/v1/service-periods/${periodId}/force-close`,
        payload: { reason: "Test" },
      },
      {
        method: "POST",
        url: `/v1/service-periods/${periodId}/cancel-planned`,
      },
    ] as const) {
      assert.equal(
        (
          await app.inject({
            ...request,
            headers,
          })
        ).statusCode,
        500,
      );
    }
    await app.close();
  },
);

serialTest(
  "Plaza API reports validation and missing resource errors",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const headers = ownerHeaders(container, tenantId);
    const app = await buildApp(container);
    const missingFilter = await app.inject({
      method: "GET",
      url: "/v1/plazas",
      headers,
    });
    assert.equal(missingFilter.statusCode, 400);
    const invalidCreate = await app.inject({
      method: "POST",
      url: "/v1/plazas",
      headers,
      payload: {
        salonId: "bad",
        servicePeriodId: "bad",
        name: "x",
        tableIds: [],
      },
    });
    assert.equal(invalidCreate.statusCode, 400);
    const unknownSalon = await app.inject({
      method: "POST",
      url: "/v1/plazas",
      headers,
      payload: {
        salonId: randomUUID(),
        servicePeriodId: randomUUID(),
        name: "Terraza",
        tableIds: [randomUUID()],
      },
    });
    assert.equal(unknownSalon.statusCode, 400);
    const unknown = await app.inject({
      method: "GET",
      url: `/v1/plazas/${randomUUID()}`,
      headers,
    });
    assert.equal(unknown.statusCode, 404);
    const unknownPatch = await app.inject({
      method: "PATCH",
      url: `/v1/plazas/${randomUUID()}`,
      headers,
      payload: { name: "Patio" },
    });
    assert.equal(unknownPatch.statusCode, 404);
    await app.close();
  },
);

serialTest("Visit lifecycle: create, close happy path", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const tableId = randomUUID();

  const create = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers: ownerHeaders(container, tenantId),
    payload: { branchId, tableIds: [tableId], guestCount: 2 },
  });
  assert.equal(create.statusCode, 201);
  assert.deepEqual(Object.keys(create.json()).sort(), ["data"]);
  const visit = create.json().data;
  assert.deepEqual(
    new Set(Object.keys(visit as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "tableIds",
      "guestCount",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(visit.status, "OPEN");
  assert.equal(visit.revision, 1);
  assert.ok(!Number.isNaN(Date.parse(visit.createdAt as string)));
  assert.ok(!Number.isNaN(Date.parse(visit.updatedAt as string)));

  const requestClose = await app.inject({
    method: "POST",
    url: `/v1/visits/${visit.id}/request-close`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(requestClose.statusCode, 200);
  assert.deepEqual(Object.keys(requestClose.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(requestClose.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "tableIds",
      "guestCount",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.equal(requestClose.json().data.status, "CLOSING");
  assert.equal(requestClose.json().data.revision, 2);
  assert.equal(requestClose.json().data.createdAt, visit.createdAt);
  assert.notEqual(requestClose.json().data.updatedAt, visit.updatedAt);

  const close = await app.inject({
    method: "POST",
    url: `/v1/visits/${visit.id}/close`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(close.statusCode, 200);
  assert.deepEqual(Object.keys(close.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(close.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "tableIds",
      "guestCount",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
      "closedAt",
    ]),
  );
  assert.equal(close.json().data.status, "CLOSED");
  assert.equal(close.json().data.revision, 3);
  assert.equal(close.json().data.createdAt, visit.createdAt);
  assert.ok(!Number.isNaN(Date.parse(close.json().data.closedAt as string)));
  assert.equal(close.json().data.updatedAt, close.json().data.closedAt);
  await app.close();
});

serialTest(
  "Visit reopen returns CLOSING to OPEN and visit list is query-scoped by branchId",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const tableId = randomUUID();

    const create = await app.inject({
      method: "POST",
      url: "/v1/visits",
      headers: ownerHeaders(container, tenantId),
      payload: { branchId, tableIds: [tableId], guestCount: 2 },
    });
    assert.equal(create.statusCode, 201);
    assert.deepEqual(Object.keys(create.json()).sort(), ["data"]);
    const visit = create.json().data;
    assert.equal(visit.revision, 1);

    const list = await app.inject({
      method: "GET",
      url: `/v1/visits?branchId=${branchId}`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(list.statusCode, 200);
    assert.deepEqual(Object.keys(list.json()).sort(), ["data"]);
    const listed = list
      .json()
      .data.find((row: { id: string }) => row.id === visit.id);
    assert.ok(listed);
    assert.deepEqual(
      new Set(Object.keys(listed as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "tableIds",
        "guestCount",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
      ]),
    );
    assert.equal(listed.revision, 1);
    assert.equal(listed.createdAt, visit.createdAt);
    assert.equal(listed.updatedAt, visit.updatedAt);

    const requestClose = await app.inject({
      method: "POST",
      url: `/v1/visits/${visit.id}/request-close`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(requestClose.statusCode, 200);
    assert.deepEqual(Object.keys(requestClose.json()).sort(), ["data"]);
    assert.equal(requestClose.json().data.status, "CLOSING");
    assert.equal(requestClose.json().data.revision, 2);

    const reopen = await app.inject({
      method: "POST",
      url: `/v1/visits/${visit.id}/reopen`,
      headers: ownerHeaders(container, tenantId),
      payload: { reason: "manager correction" },
    });
    assert.equal(reopen.statusCode, 200);
    assert.deepEqual(Object.keys(reopen.json()).sort(), ["data"]);
    assert.deepEqual(
      new Set(Object.keys(reopen.json().data as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "tableIds",
        "guestCount",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
      ]),
    );
    assert.equal(reopen.json().data.status, "OPEN");
    assert.equal(reopen.json().data.revision, 3);
    assert.equal(reopen.json().data.createdAt, visit.createdAt);
    assert.ok(
      Date.parse(reopen.json().data.updatedAt as string) >=
        Date.parse(requestClose.json().data.updatedAt as string),
    );
    await app.close();
  },
);

serialTest(
  "Visit move and cancel commands update the visit and enforce branch-scoped list query contract",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const originalTableId = randomUUID();
    const movedTableId = randomUUID();

    const create = await app.inject({
      method: "POST",
      url: "/v1/visits",
      headers: ownerHeaders(container, tenantId),
      payload: { branchId, tableIds: [originalTableId], guestCount: 2 },
    });
    assert.equal(create.statusCode, 201);
    const visit = create.json().data;
    assert.equal(visit.revision, 1);

    const missingBranchQuery = await app.inject({
      method: "GET",
      url: "/v1/visits",
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(missingBranchQuery.statusCode, 400);
    assert.deepEqual(
      new Set(
        Object.keys(missingBranchQuery.json() as Record<string, unknown>),
      ),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      missingBranchQuery.json().type,
      "https://docs.maitre.app/problems/bad-request",
    );
    assert.equal(missingBranchQuery.json().detail, "branchId is required");
    assert.equal(missingBranchQuery.json().status, 400);

    const move = await app.inject({
      method: "POST",
      url: `/v1/visits/${visit.id}/move`,
      headers: ownerHeaders(container, tenantId),
      payload: { tableIds: [movedTableId] },
    });
    assert.equal(move.statusCode, 200);
    assert.deepEqual(
      new Set(Object.keys(move.json().data as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "tableIds",
        "guestCount",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
      ]),
    );
    assert.deepEqual(move.json().data.tableIds, [movedTableId]);
    assert.equal(move.json().data.revision, 2);
    assert.equal(move.json().data.createdAt, visit.createdAt);
    assert.notEqual(move.json().data.updatedAt, visit.updatedAt);

    const cancel = await app.inject({
      method: "POST",
      url: `/v1/visits/${visit.id}/cancel`,
      headers: ownerHeaders(container, tenantId),
      payload: { reason: "guest no-show after seating correction" },
    });
    assert.equal(cancel.statusCode, 200);
    assert.deepEqual(
      new Set(Object.keys(cancel.json().data as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "tableIds",
        "guestCount",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
        "cancelledAt",
        "cancelReason",
      ]),
    );
    assert.equal(cancel.json().data.status, "CANCELLED");
    assert.equal(cancel.json().data.revision, 3);
    assert.equal(
      cancel.json().data.cancelReason,
      "guest no-show after seating correction",
    );
    assert.ok(
      !Number.isNaN(Date.parse(cancel.json().data.cancelledAt as string)),
    );
    assert.equal(cancel.json().data.updatedAt, cancel.json().data.cancelledAt);

    await app.close();
  },
);

serialTest(
  "Visit commands reject occupied moves, close with unsettled check, and invalid transitions",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const firstTableId = randomUUID();
    const secondTableId = randomUUID();
    const occupiedTableId = randomUUID();

    const firstVisit = await app.inject({
      method: "POST",
      url: "/v1/visits",
      headers,
      payload: { branchId, tableIds: [firstTableId], guestCount: 2 },
    });
    assert.equal(firstVisit.statusCode, 201);
    const visitId = firstVisit.json().data.id as string;

    const occupiedVisit = await app.inject({
      method: "POST",
      url: "/v1/visits",
      headers,
      payload: { branchId, tableIds: [occupiedTableId], guestCount: 2 },
    });
    assert.equal(occupiedVisit.statusCode, 201);

    const moveConflict = await app.inject({
      method: "POST",
      url: `/v1/visits/${visitId}/move`,
      headers,
      payload: { tableIds: [occupiedTableId] },
    });
    assert.equal(moveConflict.statusCode, 409);
    assert.deepEqual(
      new Set(Object.keys(moveConflict.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      moveConflict.json().type,
      "https://docs.maitre.app/problems/conflict",
    );
    assert.equal(moveConflict.json().status, 409);

    const moveOk = await app.inject({
      method: "POST",
      url: `/v1/visits/${visitId}/move`,
      headers,
      payload: { tableIds: [secondTableId] },
    });
    assert.equal(moveOk.statusCode, 200);
    assert.deepEqual(moveOk.json().data.tableIds, [secondTableId]);

    const createCheck = await app.inject({
      method: "POST",
      url: `/v1/visits/${visitId}/check`,
      headers,
      payload: { currency: "ARS" },
    });
    assert.equal(createCheck.statusCode, 201);

    const requestClose = await app.inject({
      method: "POST",
      url: `/v1/visits/${visitId}/request-close`,
      headers,
    });
    assert.equal(requestClose.statusCode, 200);

    const closeBlocked = await app.inject({
      method: "POST",
      url: `/v1/visits/${visitId}/close`,
      headers,
    });
    assert.equal(closeBlocked.statusCode, 400);
    assert.deepEqual(
      new Set(Object.keys(closeBlocked.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      closeBlocked.json().type,
      "https://docs.maitre.app/problems/bad-request",
    );
    assert.equal(closeBlocked.json().status, 400);

    const requestCloseAgain = await app.inject({
      method: "POST",
      url: `/v1/visits/${visitId}/request-close`,
      headers,
    });
    assert.equal(requestCloseAgain.statusCode, 409);
    assert.deepEqual(
      new Set(Object.keys(requestCloseAgain.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      requestCloseAgain.json().type,
      "https://docs.maitre.app/problems/conflict",
    );
    assert.equal(requestCloseAgain.json().status, 409);

    const cancelAfterCheck = await app.inject({
      method: "POST",
      url: `/v1/visits/${visitId}/cancel`,
      headers,
      payload: { reason: "too late" },
    });
    assert.equal(cancelAfterCheck.statusCode, 409);
    assert.deepEqual(
      new Set(Object.keys(cancelAfterCheck.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      cancelAfterCheck.json().type,
      "https://docs.maitre.app/problems/conflict",
    );
    assert.equal(cancelAfterCheck.json().status, 409);

    const reopenWithoutReason = await app.inject({
      method: "POST",
      url: `/v1/visits/${visitId}/reopen`,
      headers,
      payload: {},
    });
    assert.equal(reopenWithoutReason.statusCode, 400);
    assert.deepEqual(
      new Set(
        Object.keys(reopenWithoutReason.json() as Record<string, unknown>),
      ),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      reopenWithoutReason.json().type,
      "https://docs.maitre.app/problems/bad-request",
    );
    assert.equal(reopenWithoutReason.json().status, 400);
    assert.match(String(reopenWithoutReason.json().detail), /reason/i);

    const reopen = await app.inject({
      method: "POST",
      url: `/v1/visits/${visitId}/reopen`,
      headers,
      payload: { reason: "manager correction" },
    });
    assert.equal(reopen.statusCode, 200);
    assert.equal(reopen.json().data.status, "OPEN");

    await app.close();
  },
);

serialTest("Check + Payment: add line, capture payment, settle", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const tableId = randomUUID();
  await openCashSession(app, container, tenantId, branchId);

  const create = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers: ownerHeaders(container, tenantId),
    payload: { branchId, tableIds: [tableId], guestCount: 2 },
  });
  const visit = create.json().data;

  const createCheck = await app.inject({
    method: "POST",
    url: `/v1/visits/${visit.id}/check`,
    headers: ownerHeaders(container, tenantId),
    payload: { currency: "ARS" },
  });
  assert.equal(createCheck.statusCode, 201);
  const check = createCheck.json().data;
  assert.deepEqual(
    new Set(Object.keys(check as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "lines",
      "adjustments",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
      "totals",
      "paymentsSummary",
    ]),
  );
  assert.equal(check.paymentsSummary.count, 0);
  assert.deepEqual(
    new Set(Object.keys(check.totals as Record<string, unknown>)),
    new Set([
      "gross",
      "discounts",
      "estimatedTax",
      "serviceCharges",
      "netDue",
      "paid",
      "balance",
    ]),
  );
  assert.deepEqual(
    new Set(Object.keys(check.paymentsSummary as Record<string, unknown>)),
    new Set(["count", "capturedCount", "refundCount", "paidMinorUnits"]),
  );

  const addLine = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/add-line`,
    headers: ownerHeaders(container, tenantId),
    payload: { description: "Empanadas", amountMinorUnits: 1000 },
  });
  assert.equal(addLine.statusCode, 200);
  assert.equal(addLine.json().data.lines.length, 1);
  assert.deepEqual(
    new Set(
      Object.keys(addLine.json().data.lines[0] as Record<string, unknown>),
    ),
    new Set(["id", "description", "amountMinorUnits"]),
  );
  assert.equal(addLine.json().data.totals.netDue, 1000);

  const createPayment = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/payments`,
    headers: { ...ownerHeaders(container, tenantId), "x-branch-id": branchId },
    payload: {
      amountMinorUnits: 1000,
      currency: "ARS",
      method: "CASH",
      idempotencyKey: "idem-test-1",
    },
  });
  assert.equal(createPayment.statusCode, 201);
  assert.deepEqual(Object.keys(createPayment.json()).sort(), ["data"]);
  const payment = createPayment.json().data;
  assert.deepEqual(
    new Set(Object.keys(payment as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "checkId",
      "amountMinorUnits",
      "currency",
      "method",
      "status",
      "idempotencyKey",
      "revision",
      "createdAt",
      "updatedAt",
    ]),
  );
  assert.ok(!Number.isNaN(Date.parse(payment.createdAt as string)));
  assert.ok(!Number.isNaN(Date.parse(payment.updatedAt as string)));

  const capture = await app.inject({
    method: "POST",
    url: `/v1/payments/${payment.id}/capture`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(capture.statusCode, 200);
  assert.equal(capture.json().data.revision, 2);
  assert.equal(capture.json().data.status, "CAPTURED");

  const registers = await container.cashRegisters.listByBranch(
    tenantId,
    branchId,
  );
  const register = registers[0]!;
  const cashSession =
    await container.cashSessions.findLiveByRegisterAndCurrency(
      tenantId,
      register.id,
      "ARS",
    );
  assert.ok(cashSession);
  const cashMovements = await container.cashMovements.listBySession(
    tenantId,
    cashSession!.id,
  );
  const paymentMovements = cashMovements.filter(
    (movement) => movement.sourceReference === `FLOOR_PAYMENT:${payment.id}`,
  );
  assert.equal(paymentMovements.length, 1);
  assert.equal(paymentMovements[0]!.type, "CASH_SALE");
  assert.equal(paymentMovements[0]!.amountMinorUnits, 1000);

  const captureRetry = await app.inject({
    method: "POST",
    url: `/v1/payments/${payment.id}/capture`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(captureRetry.statusCode, 200);
  assert.equal(captureRetry.json().data.status, "CAPTURED");
  const movementsAfterRetry = await container.cashMovements.listBySession(
    tenantId,
    cashSession!.id,
  );
  assert.equal(
    movementsAfterRetry.filter(
      (movement) => movement.sourceReference === `FLOOR_PAYMENT:${payment.id}`,
    ).length,
    1,
  );

  const byVisit = await app.inject({
    method: "GET",
    url: `/v1/visits/${visit.id}/check`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(byVisit.statusCode, 200);
  assert.deepEqual(
    new Set(Object.keys(byVisit.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "visitId",
      "currency",
      "lines",
      "adjustments",
      "status",
      "revision",
      "createdAt",
      "updatedAt",
      "totals",
      "paymentsSummary",
    ]),
  );
  assert.equal(byVisit.json().data.id, check.id);
  assert.equal(byVisit.json().data.paymentsSummary.count, 1);
  assert.equal(byVisit.json().data.paymentsSummary.capturedCount, 1);
  assert.equal(byVisit.json().data.paymentsSummary.paidMinorUnits, 1000);

  const requestPayment = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/request-payment`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(requestPayment.statusCode, 200);

  const settle = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/settle`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(settle.statusCode, 200);
  assert.equal(settle.json().data.status, "SETTLED");
  assert.equal(settle.json().data.totals.balance, 0);
  assert.equal(settle.json().data.paymentsSummary.paidMinorUnits, 1000);
  await app.close();
});

serialTest(
  "Payments API: create is idempotent, list/get work, fail and void transitions are exposed",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const tableId = randomUUID();

    const visit = (
      await app.inject({
        method: "POST",
        url: "/v1/visits",
        headers: ownerHeaders(container, tenantId),
        payload: { branchId, tableIds: [tableId], guestCount: 2 },
      })
    ).json().data;

    const check = (
      await app.inject({
        method: "POST",
        url: `/v1/visits/${visit.id}/check`,
        headers: ownerHeaders(container, tenantId),
        payload: { currency: "ARS" },
      })
    ).json().data;

    await app.inject({
      method: "POST",
      url: `/v1/checks/${check.id}/add-line`,
      headers: ownerHeaders(container, tenantId),
      payload: { description: "Soda", amountMinorUnits: 1000 },
    });

    const first = await app.inject({
      method: "POST",
      url: `/v1/checks/${check.id}/payments`,
      headers: {
        ...ownerHeaders(container, tenantId),
        "x-branch-id": branchId,
      },
      payload: {
        amountMinorUnits: 500,
        currency: "ARS",
        method: "CARD",
        idempotencyKey: "idem-floor-1",
      },
    });
    assert.equal(first.statusCode, 201);
    assert.deepEqual(Object.keys(first.json()).sort(), ["data"]);
    const payment = first.json().data;
    assert.deepEqual(
      new Set(Object.keys(payment as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "checkId",
        "amountMinorUnits",
        "currency",
        "method",
        "status",
        "idempotencyKey",
        "revision",
        "createdAt",
        "updatedAt",
      ]),
    );

    const second = await app.inject({
      method: "POST",
      url: `/v1/checks/${check.id}/payments`,
      headers: {
        ...ownerHeaders(container, tenantId),
        "x-branch-id": branchId,
      },
      payload: {
        amountMinorUnits: 500,
        currency: "ARS",
        method: "CARD",
        idempotencyKey: "idem-floor-1",
      },
    });
    assert.equal(second.statusCode, 201);
    assert.deepEqual(Object.keys(second.json()).sort(), ["data"]);
    assert.equal(second.json().data.id, payment.id);

    const list = await app.inject({
      method: "GET",
      url: `/v1/checks/${check.id}/payments`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(list.statusCode, 200);
    assert.deepEqual(Object.keys(list.json()).sort(), ["data"]);
    assert.equal(list.json().data.length, 1);
    assert.deepEqual(
      new Set(Object.keys(list.json().data[0] as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "checkId",
        "amountMinorUnits",
        "currency",
        "method",
        "status",
        "idempotencyKey",
        "revision",
        "createdAt",
        "updatedAt",
      ]),
    );
    assert.equal(list.json().data[0].id, payment.id);

    const get = await app.inject({
      method: "GET",
      url: `/v1/payments/${payment.id}`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(get.statusCode, 200);
    assert.deepEqual(Object.keys(get.json()).sort(), ["data"]);
    assert.deepEqual(
      new Set(Object.keys(get.json().data as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "checkId",
        "amountMinorUnits",
        "currency",
        "method",
        "status",
        "idempotencyKey",
        "revision",
        "createdAt",
        "updatedAt",
      ]),
    );
    assert.equal(get.json().data.status, "PENDING");

    const fail = await app.inject({
      method: "POST",
      url: `/v1/payments/${payment.id}/fail`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(fail.statusCode, 200);
    assert.deepEqual(Object.keys(fail.json()).sort(), ["data"]);
    assert.equal(fail.json().data.status, "FAILED");

    const voidPending = await app.inject({
      method: "POST",
      url: `/v1/checks/${check.id}/payments`,
      headers: {
        ...ownerHeaders(container, tenantId),
        "x-branch-id": branchId,
      },
      payload: {
        amountMinorUnits: 300,
        currency: "ARS",
        method: "OTHER",
        idempotencyKey: "idem-floor-void",
      },
    });
    assert.equal(voidPending.statusCode, 201);
    assert.deepEqual(Object.keys(voidPending.json()).sort(), ["data"]);
    const pendingPayment = voidPending.json().data;

    const voidRes = await app.inject({
      method: "POST",
      url: `/v1/payments/${pendingPayment.id}/void`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(voidRes.statusCode, 200);
    assert.deepEqual(Object.keys(voidRes.json()).sort(), ["data"]);
    assert.equal(voidRes.json().data.status, "VOID");

    await app.close();
  },
);

serialTest("Payments API: refund and over-capture validation", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const tableId = randomUUID();

  const visit = (
    await app.inject({
      method: "POST",
      url: "/v1/visits",
      headers: ownerHeaders(container, tenantId),
      payload: { branchId, tableIds: [tableId], guestCount: 2 },
    })
  ).json().data;

  const check = (
    await app.inject({
      method: "POST",
      url: `/v1/visits/${visit.id}/check`,
      headers: ownerHeaders(container, tenantId),
      payload: { currency: "ARS" },
    })
  ).json().data;

  await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/add-line`,
    headers: ownerHeaders(container, tenantId),
    payload: { description: "Milanesa", amountMinorUnits: 1000 },
  });

  const createPayment = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/payments`,
    headers: { ...ownerHeaders(container, tenantId), "x-branch-id": branchId },
    payload: {
      amountMinorUnits: 1000,
      currency: "ARS",
      method: "CARD",
      idempotencyKey: "idem-floor-refund",
    },
  });
  assert.equal(createPayment.statusCode, 201);
  const payment = createPayment.json().data;

  const capture = await app.inject({
    method: "POST",
    url: `/v1/payments/${payment.id}/capture`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(capture.statusCode, 200);
  assert.deepEqual(Object.keys(capture.json()).sort(), ["data"]);

  const refund = await app.inject({
    method: "POST",
    url: `/v1/payments/${payment.id}/refund`,
    headers: ownerHeaders(container, tenantId),
    payload: { amountMinorUnits: 500 },
  });
  assert.equal(refund.statusCode, 200);
  assert.deepEqual(Object.keys(refund.json()).sort(), ["data"]);
  assert.deepEqual(
    new Set(Object.keys(refund.json().data as Record<string, unknown>)),
    new Set([
      "id",
      "tenantId",
      "branchId",
      "checkId",
      "amountMinorUnits",
      "currency",
      "method",
      "status",
      "idempotencyKey",
      "revision",
      "createdAt",
      "updatedAt",
      "refund",
    ]),
  );
  assert.deepEqual(
    new Set(Object.keys(refund.json().data.refund as Record<string, unknown>)),
    new Set(["amountMinorUnits", "status"]),
  );
  assert.equal(refund.json().data.refund.amountMinorUnits, 500);
  assert.equal(refund.json().data.refund.status, "SUCCEEDED");

  const hugePayment = await app.inject({
    method: "POST",
    url: `/v1/checks/${check.id}/payments`,
    headers: { ...ownerHeaders(container, tenantId), "x-branch-id": branchId },
    payload: {
      amountMinorUnits: 999999,
      currency: "ARS",
      method: "CARD",
      idempotencyKey: "idem-floor-too-big",
    },
  });
  assert.equal(hugePayment.statusCode, 201);

  const overCapture = await app.inject({
    method: "POST",
    url: `/v1/payments/${hugePayment.json().data.id}/capture`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(overCapture.statusCode, 400);
  assert.deepEqual(
    new Set(Object.keys(overCapture.json() as Record<string, unknown>)),
    new Set([
      "type",
      "title",
      "status",
      "detail",
      "instance",
      "code",
      "correlationId",
    ]),
  );
  assert.equal(
    overCapture.json().type,
    "https://docs.maitre.app/problems/bad-request",
  );
  assert.equal(overCapture.json().status, 400);

  await app.close();
});

serialTest("403 without permission, 404 for unknown ids", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const now = new Date();

  const cook = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-cook",
    displayName: "Demo Cook",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(cook);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: cook.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_cook"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const token = "cook-token-floor";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-cook",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const forbidden = await app.inject({
    method: "POST",
    url: "/v1/visits",
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: {
      branchId: randomUUID(),
      tableIds: [randomUUID()],
      guestCount: 2,
    },
  });
  assert.equal(forbidden.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(forbidden.json() as Record<string, unknown>)),
    new Set([
      "type",
      "title",
      "status",
      "detail",
      "instance",
      "code",
      "correlationId",
    ]),
  );
  assert.equal(
    forbidden.json().type,
    "https://docs.maitre.app/problems/insufficient-scope",
  );
  assert.equal(forbidden.json().detail, "Insufficient scope");
  assert.equal(forbidden.json().status, 403);

  const notFound = await app.inject({
    method: "GET",
    url: `/v1/visits/${randomUUID()}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(notFound.statusCode, 404);
  assert.deepEqual(
    new Set(Object.keys(notFound.json() as Record<string, unknown>)),
    new Set([
      "type",
      "title",
      "status",
      "detail",
      "instance",
      "code",
      "correlationId",
    ]),
  );
  assert.equal(
    notFound.json().type,
    "https://docs.maitre.app/problems/not-found",
  );
  assert.equal(notFound.json().detail, "Visit not found");
  assert.equal(notFound.json().status, 404);

  const reopenForbidden = await app.inject({
    method: "POST",
    url: `/v1/visits/${randomUUID()}/reopen`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: { reason: "not allowed" },
  });
  assert.equal(reopenForbidden.statusCode, 403);
  assert.deepEqual(
    new Set(Object.keys(reopenForbidden.json() as Record<string, unknown>)),
    new Set([
      "type",
      "title",
      "status",
      "detail",
      "instance",
      "code",
      "correlationId",
    ]),
  );
  assert.equal(
    reopenForbidden.json().type,
    "https://docs.maitre.app/problems/insufficient-scope",
  );
  assert.equal(reopenForbidden.json().detail, "Insufficient scope");
  assert.equal(reopenForbidden.json().status, 403);
  await app.close();
});

serialTest(
  "ServicePeriod force-close endpoint closes a closing period and requires reason",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);

    const create = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers: ownerHeaders(container, tenantId),
      payload: { businessDate: "2026-07-25", name: "Dinner", type: "DINNER" },
    });
    assert.equal(create.statusCode, 201);
    const period = create.json().data;
    assert.deepEqual(
      new Set(Object.keys(period as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "businessDate",
        "name",
        "type",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
      ]),
    );
    assert.equal(period.revision, 1);
    assert.ok(!Number.isNaN(Date.parse(period.createdAt as string)));
    assert.ok(!Number.isNaN(Date.parse(period.updatedAt as string)));

    const open = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${period.id}/open`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(open.statusCode, 200);
    assert.deepEqual(
      new Set(Object.keys(open.json().data as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "businessDate",
        "name",
        "type",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
        "actualOpen",
      ]),
    );
    assert.equal(open.json().data.revision, 2);
    assert.equal(open.json().data.createdAt, period.createdAt);
    assert.ok(!Number.isNaN(Date.parse(open.json().data.actualOpen as string)));
    assert.equal(open.json().data.updatedAt, open.json().data.actualOpen);

    const beginClose = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${period.id}/begin-close`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(beginClose.statusCode, 200);
    assert.deepEqual(
      new Set(Object.keys(beginClose.json().data as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "businessDate",
        "name",
        "type",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
        "actualOpen",
      ]),
    );
    assert.equal(beginClose.json().data.revision, 3);
    assert.equal(
      beginClose.json().data.actualOpen,
      open.json().data.actualOpen,
    );

    const missingReason = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${period.id}/force-close`,
      headers: ownerHeaders(container, tenantId),
      payload: {},
    });
    assert.equal(missingReason.statusCode, 400);
    assert.deepEqual(
      new Set(Object.keys(missingReason.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      missingReason.json().type,
      "https://docs.maitre.app/problems/bad-request",
    );
    assert.equal(missingReason.json().status, 400);
    assert.match(String(missingReason.json().detail), /reason/i);

    const forceClose = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${period.id}/force-close`,
      headers: ownerHeaders(container, tenantId),
      payload: { reason: "manual override" },
    });
    assert.equal(forceClose.statusCode, 200);
    assert.deepEqual(
      new Set(Object.keys(forceClose.json().data as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "businessDate",
        "name",
        "type",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
        "actualOpen",
        "actualClose",
      ]),
    );
    assert.equal(forceClose.json().data.status, "CLOSED");
    assert.equal(forceClose.json().data.revision, 4);
    assert.equal(
      forceClose.json().data.actualOpen,
      open.json().data.actualOpen,
    );
    assert.ok(
      !Number.isNaN(Date.parse(forceClose.json().data.actualClose as string)),
    );
    assert.equal(
      forceClose.json().data.updatedAt,
      forceClose.json().data.actualClose,
    );
    await app.close();
  },
);

serialTest(
  "ServicePeriod create preserves planned window and happy-path close increments revision",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const create = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
      payload: {
        businessDate: "2026-07-25",
        name: "Lunch",
        type: "LUNCH",
        plannedOpen: "2026-07-25T12:00:00.000Z",
        plannedClose: "2026-07-25T15:00:00.000Z",
      },
    });
    assert.equal(create.statusCode, 201);
    const created = create.json().data;
    assert.deepEqual(
      new Set(Object.keys(created as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "businessDate",
        "name",
        "type",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
        "plannedOpen",
        "plannedClose",
      ]),
    );
    assert.equal(created.status, "PLANNED");
    assert.equal(created.revision, 1);
    assert.equal(created.plannedOpen, "2026-07-25T12:00:00.000Z");
    assert.equal(created.plannedClose, "2026-07-25T15:00:00.000Z");

    const open = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${created.id}/open`,
      headers,
    });
    assert.equal(open.statusCode, 200);
    assert.equal(open.json().data.createdAt, created.createdAt);
    assert.equal(open.json().data.status, "OPEN");
    assert.equal(open.json().data.revision, 2);
    assert.ok(!Number.isNaN(Date.parse(open.json().data.actualOpen as string)));
    assert.equal(open.json().data.updatedAt, open.json().data.actualOpen);

    const beginClose = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${created.id}/begin-close`,
      headers,
    });
    assert.equal(beginClose.statusCode, 200);
    assert.equal(beginClose.json().data.status, "CLOSING");
    assert.equal(beginClose.json().data.revision, 3);
    assert.equal(
      beginClose.json().data.actualOpen,
      open.json().data.actualOpen,
    );

    const close = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${created.id}/close`,
      headers,
      payload: {},
    });
    assert.equal(close.statusCode, 200);
    assert.equal(close.json().data.status, "CLOSED");
    assert.equal(close.json().data.revision, 4);
    assert.equal(close.json().data.actualOpen, open.json().data.actualOpen);
    assert.ok(
      !Number.isNaN(Date.parse(close.json().data.actualClose as string)),
    );
    assert.equal(close.json().data.updatedAt, close.json().data.actualClose);

    const detail = await app.inject({
      method: "GET",
      url: `/v1/service-periods/${created.id}`,
      headers,
    });
    assert.equal(detail.statusCode, 200);
    assert.deepEqual(
      new Set(Object.keys(detail.json().data as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "businessDate",
        "name",
        "type",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
        "plannedOpen",
        "plannedClose",
        "actualOpen",
        "actualClose",
      ]),
    );
    assert.equal(detail.json().data.status, "CLOSED");
    assert.equal(detail.json().data.revision, 4);
    assert.equal(detail.json().data.plannedOpen, "2026-07-25T12:00:00.000Z");
    assert.equal(detail.json().data.plannedClose, "2026-07-25T15:00:00.000Z");
    assert.equal(detail.json().data.actualOpen, open.json().data.actualOpen);
    assert.equal(detail.json().data.actualClose, close.json().data.actualClose);

    await app.close();
  },
);

serialTest(
  "ServicePeriod list/detail and transition guards enforce conflict and invalid-state contracts",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const breakfast = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
      payload: {
        businessDate: "2026-07-25",
        name: "Breakfast",
        type: "BREAKFAST",
      },
    });
    assert.equal(breakfast.statusCode, 201);
    const breakfastId = breakfast.json().data.id as string;

    const dinner = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
      payload: { businessDate: "2026-07-25", name: "Dinner", type: "DINNER" },
    });
    assert.equal(dinner.statusCode, 201);
    const dinnerId = dinner.json().data.id as string;

    const list = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
    });
    assert.equal(list.statusCode, 200);
    assert.deepEqual(Object.keys(list.json()).sort(), ["data"]);
    assert.equal(list.json().data.length, 2);
    for (const row of list.json().data as Array<Record<string, unknown>>) {
      assert.deepEqual(
        new Set(Object.keys(row)),
        new Set([
          "id",
          "tenantId",
          "branchId",
          "businessDate",
          "name",
          "type",
          "status",
          "revision",
          "createdAt",
          "updatedAt",
        ]),
      );
    }

    const detail = await app.inject({
      method: "GET",
      url: `/v1/service-periods/${breakfastId}`,
      headers,
    });
    assert.equal(detail.statusCode, 200);
    assert.deepEqual(Object.keys(detail.json()).sort(), ["data"]);
    assert.deepEqual(
      new Set(Object.keys(detail.json().data as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "businessDate",
        "name",
        "type",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
      ]),
    );
    assert.equal(detail.json().data.id, breakfastId);
    assert.equal(detail.json().data.status, "PLANNED");

    const openBreakfast = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${breakfastId}/open`,
      headers,
    });
    assert.equal(openBreakfast.statusCode, 200);
    assert.deepEqual(Object.keys(openBreakfast.json()).sort(), ["data"]);
    assert.equal(openBreakfast.json().data.status, "OPEN");

    const conflictingOpen = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${dinnerId}/open`,
      headers,
    });
    assert.equal(conflictingOpen.statusCode, 409);
    assert.deepEqual(
      new Set(Object.keys(conflictingOpen.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      conflictingOpen.json().type,
      "https://docs.maitre.app/problems/conflict",
    );
    assert.equal(conflictingOpen.json().status, 409);

    const closeWithoutBegin = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${breakfastId}/close`,
      headers,
      payload: {},
    });
    assert.equal(closeWithoutBegin.statusCode, 409);
    assert.deepEqual(
      new Set(Object.keys(closeWithoutBegin.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      closeWithoutBegin.json().type,
      "https://docs.maitre.app/problems/conflict",
    );
    assert.equal(closeWithoutBegin.json().status, 409);

    const cancelPlannedDinner = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${dinnerId}/cancel-planned`,
      headers,
    });
    assert.equal(cancelPlannedDinner.statusCode, 200);
    assert.deepEqual(
      new Set(
        Object.keys(cancelPlannedDinner.json().data as Record<string, unknown>),
      ),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "businessDate",
        "name",
        "type",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
      ]),
    );
    assert.equal(cancelPlannedDinner.json().data.status, "CANCELLED");
    assert.equal(cancelPlannedDinner.json().data.revision, 2);

    const reopenCancelledDinner = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${dinnerId}/open`,
      headers,
    });
    assert.equal(reopenCancelledDinner.statusCode, 409);
    assert.deepEqual(
      new Set(
        Object.keys(reopenCancelledDinner.json() as Record<string, unknown>),
      ),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      reopenCancelledDinner.json().type,
      "https://docs.maitre.app/problems/conflict",
    );
    assert.equal(reopenCancelledDinner.json().status, 409);

    const unknownDetail = await app.inject({
      method: "GET",
      url: `/v1/service-periods/${randomUUID()}`,
      headers,
    });
    assert.equal(unknownDetail.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(unknownDetail.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      unknownDetail.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(unknownDetail.json().detail, "ServicePeriod not found");
    assert.equal(unknownDetail.json().status, 404);

    const unknownOpen = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${randomUUID()}/open`,
      headers,
    });
    assert.equal(unknownOpen.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(unknownOpen.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      unknownOpen.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(unknownOpen.json().detail, "ServicePeriod not found");
    assert.equal(unknownOpen.json().status, 404);

    const unknownForceClose = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${randomUUID()}/force-close`,
      headers,
      payload: { reason: "unknown target" },
    });
    assert.equal(unknownForceClose.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(unknownForceClose.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      unknownForceClose.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(unknownForceClose.json().detail, "ServicePeriod not found");
    assert.equal(unknownForceClose.json().status, 404);

    await app.close();
  },
);

serialTest(
  "ServicePeriod routes enforce create schema and manage permission",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const now = new Date();
    const cook = {
      id: randomUUID(),
      identityProvider: "fixture",
      externalIdentityId: "demo-cook-service-periods",
      displayName: "Demo Cook Service Periods",
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    await container.users.save(cook);
    await container.memberships.save({
      id: randomUUID(),
      tenantId,
      userId: cook.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_cook"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const token = "cook-token-service-periods";
    sessionsOf(container).registerToken(token, {
      provider: "fixture",
      subject: "demo-cook-service-periods",
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });

    const invalidCreate = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
      payload: { businessDate: "2026-07-25", name: "", type: "DINNER" },
    });
    assert.equal(invalidCreate.statusCode, 400);
    assert.deepEqual(
      new Set(Object.keys(invalidCreate.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      invalidCreate.json().type,
      "https://docs.maitre.app/problems/bad-request",
    );
    assert.equal(invalidCreate.json().status, 400);
    assert.match(String(invalidCreate.json().detail), /name/i);

    const create = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
      payload: { businessDate: "2026-07-25", name: "Dinner", type: "DINNER" },
    });
    assert.equal(create.statusCode, 201);
    assert.deepEqual(Object.keys(create.json()).sort(), ["data"]);
    assert.deepEqual(
      new Set(Object.keys(create.json().data as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "businessDate",
        "name",
        "type",
        "status",
        "revision",
        "createdAt",
        "updatedAt",
      ]),
    );
    const periodId = create.json().data.id as string;

    const forbiddenList = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/service-periods`,
      headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    });
    assert.equal(forbiddenList.statusCode, 403);
    assert.deepEqual(
      new Set(Object.keys(forbiddenList.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      forbiddenList.json().type,
      "https://docs.maitre.app/problems/insufficient-scope",
    );
    assert.equal(forbiddenList.json().detail, "Insufficient scope");
    assert.equal(forbiddenList.json().status, 403);

    const forbiddenOpen = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${periodId}/open`,
      headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    });
    assert.equal(forbiddenOpen.statusCode, 403);
    assert.deepEqual(
      new Set(Object.keys(forbiddenOpen.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      forbiddenOpen.json().type,
      "https://docs.maitre.app/problems/insufficient-scope",
    );
    assert.equal(forbiddenOpen.json().detail, "Insufficient scope");
    assert.equal(forbiddenOpen.json().status, 403);

    await app.close();
  },
);

serialTest(
  "ServicePeriod detail and commands hide cross-tenant resources as 404",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const app = await buildApp(container);
    const foreign = await seedForeignServicePeriod(container);
    const headers = ownerHeaders(container, tenantId);

    const detail = await app.inject({
      method: "GET",
      url: `/v1/service-periods/${foreign.servicePeriodId}`,
      headers,
    });
    assert.equal(detail.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(detail.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      detail.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(detail.json().detail, "ServicePeriod not found");
    assert.equal(detail.json().status, 404);

    const open = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${foreign.servicePeriodId}/open`,
      headers,
    });
    assert.equal(open.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(open.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      open.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(open.json().detail, "ServicePeriod not found");
    assert.equal(open.json().status, 404);

    const beginClose = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${foreign.servicePeriodId}/begin-close`,
      headers,
    });
    assert.equal(beginClose.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(beginClose.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      beginClose.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(beginClose.json().detail, "ServicePeriod not found");
    assert.equal(beginClose.json().status, 404);

    const cancelPlanned = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${foreign.servicePeriodId}/cancel-planned`,
      headers,
    });
    assert.equal(cancelPlanned.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(cancelPlanned.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      cancelPlanned.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(cancelPlanned.json().detail, "ServicePeriod not found");
    assert.equal(cancelPlanned.json().status, 404);

    const close = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${foreign.servicePeriodId}/close`,
      headers,
      payload: {},
    });
    assert.equal(close.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(close.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      close.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(close.json().detail, "ServicePeriod not found");
    assert.equal(close.json().status, 404);

    const forceClose = await app.inject({
      method: "POST",
      url: `/v1/service-periods/${foreign.servicePeriodId}/force-close`,
      headers,
      payload: { reason: "cross-tenant" },
    });
    assert.equal(forceClose.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(forceClose.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      forceClose.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(forceClose.json().detail, "ServicePeriod not found");
    assert.equal(forceClose.json().status, 404);

    await app.close();
  },
);

serialTest(
  "ServicePeriod list/detail expose the expected I0 shape including nullable actual window fields",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const createBreakfast = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
      payload: {
        businessDate: "2026-07-25",
        name: "Breakfast",
        type: "BREAKFAST",
        plannedOpen: "2026-07-25T08:00:00.000Z",
        plannedClose: "2026-07-25T10:00:00.000Z",
      },
    });
    assert.equal(createBreakfast.statusCode, 201);
    const breakfast = createBreakfast.json().data;

    const createDinner = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
      payload: {
        businessDate: "2026-07-25",
        name: "Dinner",
        type: "DINNER",
      },
    });
    assert.equal(createDinner.statusCode, 201);
    const dinner = createDinner.json().data;

    const list = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/service-periods`,
      headers,
    });
    assert.equal(list.statusCode, 200);

    const rows = list.json().data as Array<Record<string, unknown>>;
    assert.equal(rows.length, 2);
    assert.deepEqual(
      new Set(rows.map((row) => row.id)),
      new Set([breakfast.id, dinner.id]),
    );

    const breakfastRow = rows.find((row) => row.id === breakfast.id)!;
    assert.equal(breakfastRow.branchId, branchId);
    assert.equal(breakfastRow.businessDate, "2026-07-25");
    assert.equal(breakfastRow.name, "Breakfast");
    assert.equal(breakfastRow.type, "BREAKFAST");
    assert.equal(breakfastRow.status, "PLANNED");
    assert.equal(breakfastRow.revision, 1);
    assert.equal(breakfastRow.plannedOpen, "2026-07-25T08:00:00.000Z");
    assert.equal(breakfastRow.plannedClose, "2026-07-25T10:00:00.000Z");
    assert.equal(breakfastRow.actualOpen, undefined);
    assert.equal(breakfastRow.actualClose, undefined);
    assert.ok(breakfastRow.createdAt);
    assert.ok(breakfastRow.updatedAt);

    const dinnerDetail = await app.inject({
      method: "GET",
      url: `/v1/service-periods/${dinner.id}`,
      headers,
    });
    assert.equal(dinnerDetail.statusCode, 200);
    const detail = dinnerDetail.json().data as Record<string, unknown>;
    assert.equal(detail.id, dinner.id);
    assert.equal(detail.branchId, branchId);
    assert.equal(detail.businessDate, "2026-07-25");
    assert.equal(detail.name, "Dinner");
    assert.equal(detail.type, "DINNER");
    assert.equal(detail.status, "PLANNED");
    assert.equal(detail.revision, 1);
    assert.equal(detail.plannedOpen, undefined);
    assert.equal(detail.plannedClose, undefined);
    assert.equal(detail.actualOpen, undefined);
    assert.equal(detail.actualClose, undefined);
    assert.ok(detail.createdAt);
    assert.ok(detail.updatedAt);

    await app.close();
  },
);

serialTest(
  "Table statuses list returns OCCUPIED and PAYING projections for active visit tables",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const occupiedTableId = randomUUID();
    const payingTableId = randomUUID();

    const occupiedVisit = await app.inject({
      method: "POST",
      url: "/v1/visits",
      headers,
      payload: { branchId, tableIds: [occupiedTableId], guestCount: 2 },
    });
    assert.equal(occupiedVisit.statusCode, 201);

    const payingVisit = await app.inject({
      method: "POST",
      url: "/v1/visits",
      headers,
      payload: { branchId, tableIds: [payingTableId], guestCount: 2 },
    });
    assert.equal(payingVisit.statusCode, 201);
    const payingVisitId = payingVisit.json().data.id;

    const createCheck = await app.inject({
      method: "POST",
      url: `/v1/visits/${payingVisitId}/check`,
      headers,
      payload: { currency: "ARS" },
    });
    assert.equal(createCheck.statusCode, 201);
    const checkId = createCheck.json().data.id;

    const requestPayment = await app.inject({
      method: "POST",
      url: `/v1/checks/${checkId}/request-payment`,
      headers,
    });
    assert.equal(requestPayment.statusCode, 200);

    const statuses = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/table-statuses`,
      headers,
    });
    assert.equal(statuses.statusCode, 200);
    assert.deepEqual(Object.keys(statuses.json()).sort(), ["data"]);
    const rows = statuses.json().data as Array<{
      tableId: string;
      status: string;
      relatedVisitId?: string;
      asOf: string;
    }>;

    const occupied = rows.find((row) => row.tableId === occupiedTableId);
    assert.ok(occupied);
    assert.deepEqual(
      new Set(Object.keys(occupied!)),
      new Set(["tableId", "status", "relatedVisitId", "asOf"]),
    );
    assert.equal(occupied!.status, "OCCUPIED");
    assert.equal(occupied!.relatedVisitId, occupiedVisit.json().data.id);
    assert.ok(!Number.isNaN(Date.parse(occupied!.asOf)));

    const paying = rows.find((row) => row.tableId === payingTableId);
    assert.ok(paying);
    assert.deepEqual(
      new Set(Object.keys(paying!)),
      new Set(["tableId", "status", "relatedVisitId", "asOf"]),
    );
    assert.equal(paying!.status, "PAYING");
    assert.equal(paying!.relatedVisitId, payingVisitId);
    assert.ok(!Number.isNaN(Date.parse(paying!.asOf)));
    await app.close();
  },
);

serialTest(
  "Single and branch table status share AVAILABLE, RESERVED, OCCUPIED and PAYING projections",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const salons = await container.salons.listByBranch(tenantId, branchId);
    const salon = salons[0]!;
    const now = new Date();
    const tableId = randomUUID();

    await container.tables.save({
      id: tableId,
      tenantId,
      branchId,
      salonId: salon.id,
      number: "TS-1",
      capacity: 4,
      createdAt: now,
      updatedAt: now,
    });

    const available = await app.inject({
      method: "GET",
      url: `/v1/tables/${tableId}/status`,
      headers,
    });
    assert.equal(available.statusCode, 200);
    assert.equal(available.json().data.tableId, tableId);
    assert.equal(available.json().data.status, "AVAILABLE");
    assert.ok(!Number.isNaN(Date.parse(available.json().data.asOf)));

    const reservationId = randomUUID();
    await container.reservations.save({
      id: reservationId,
      tenantId,
      branchId,
      partySize: 2,
      startAt: new Date(now.getTime() - 60_000),
      durationMinutes: 30,
      source: "HOST",
      status: "CONFIRMED",
      tableIds: [tableId],
      revision: 1,
      createdAt: now,
      updatedAt: now,
    });

    const reserved = await app.inject({
      method: "GET",
      url: `/v1/tables/${tableId}/status`,
      headers,
    });
    assert.equal(reserved.statusCode, 200);
    assert.equal(reserved.json().data.status, "RESERVED");
    assert.equal(reserved.json().data.relatedReservationId, reservationId);

    const visitResponse = await app.inject({
      method: "POST",
      url: "/v1/visits",
      headers,
      payload: { branchId, tableIds: [tableId], guestCount: 2 },
    });
    assert.equal(visitResponse.statusCode, 201);
    const visitId = visitResponse.json().data.id as string;

    const occupied = await app.inject({
      method: "GET",
      url: `/v1/tables/${tableId}/status`,
      headers,
    });
    assert.equal(occupied.statusCode, 200);
    assert.equal(occupied.json().data.status, "OCCUPIED");
    assert.equal(occupied.json().data.relatedVisitId, visitId);

    const checkResponse = await app.inject({
      method: "POST",
      url: `/v1/visits/${visitId}/check`,
      headers,
      payload: { currency: "ARS" },
    });
    assert.equal(checkResponse.statusCode, 201);
    const checkId = checkResponse.json().data.id as string;

    const requestPayment = await app.inject({
      method: "POST",
      url: `/v1/checks/${checkId}/request-payment`,
      headers,
    });
    assert.equal(requestPayment.statusCode, 200);

    const paying = await app.inject({
      method: "GET",
      url: `/v1/tables/${tableId}/status`,
      headers,
    });
    assert.equal(paying.statusCode, 200);
    assert.equal(paying.json().data.status, "PAYING");

    const branchStatuses = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/table-statuses`,
      headers,
    });
    assert.equal(branchStatuses.statusCode, 200);
    const row = branchStatuses
      .json()
      .data.find((status: { tableId: string }) => status.tableId === tableId);
    assert.equal(row.status, "PAYING");
    await app.close();
  },
);

serialTest(
  "Occupancy endpoints list visit occupancies, release an occupancy, and return 404 for unknown ids",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const tableId = randomUUID();

    const visitCreate = await app.inject({
      method: "POST",
      url: "/v1/visits",
      headers,
      payload: { branchId, tableIds: [tableId], guestCount: 2 },
    });
    assert.equal(visitCreate.statusCode, 201);
    const visitId = visitCreate.json().data.id as string;

    const list = await app.inject({
      method: "GET",
      url: `/v1/visits/${visitId}/occupancies`,
      headers,
    });
    assert.equal(list.statusCode, 200);
    assert.deepEqual(Object.keys(list.json()).sort(), ["data"]);
    assert.equal(list.json().data.length, 1);
    assert.deepEqual(
      new Set(Object.keys(list.json().data[0] as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "tableId",
        "visitId",
        "guestCount",
        "status",
        "startedAt",
        "revision",
      ]),
    );
    assert.equal(list.json().data[0].branchId, branchId);
    assert.equal(list.json().data[0].tableId, tableId);
    assert.equal(list.json().data[0].visitId, visitId);
    assert.equal(list.json().data[0].guestCount, 2);
    assert.equal(list.json().data[0].status, "ACTIVE");
    assert.equal(list.json().data[0].revision, 1);
    assert.ok(
      !Number.isNaN(Date.parse(list.json().data[0].startedAt as string)),
    );

    const occupancyId = list.json().data[0].id as string;
    const release = await app.inject({
      method: "POST",
      url: `/v1/occupancies/${occupancyId}/release`,
      headers,
    });
    assert.equal(release.statusCode, 200);
    assert.deepEqual(Object.keys(release.json()).sort(), ["data"]);
    assert.deepEqual(
      new Set(Object.keys(release.json().data as Record<string, unknown>)),
      new Set([
        "id",
        "tenantId",
        "branchId",
        "tableId",
        "visitId",
        "guestCount",
        "status",
        "startedAt",
        "endedAt",
        "revision",
      ]),
    );
    assert.equal(release.json().data.status, "CLOSED");
    assert.equal(release.json().data.branchId, branchId);
    assert.equal(release.json().data.tableId, tableId);
    assert.equal(release.json().data.visitId, visitId);
    assert.equal(release.json().data.guestCount, 2);
    assert.equal(release.json().data.revision, 2);
    assert.ok(
      !Number.isNaN(Date.parse(release.json().data.startedAt as string)),
    );
    assert.ok(!Number.isNaN(Date.parse(release.json().data.endedAt as string)));

    const relisted = await app.inject({
      method: "GET",
      url: `/v1/visits/${visitId}/occupancies`,
      headers,
    });
    assert.equal(relisted.statusCode, 200);
    assert.deepEqual(Object.keys(relisted.json()).sort(), ["data"]);
    assert.equal(relisted.json().data[0].revision, 2);
    assert.equal(relisted.json().data[0].status, "CLOSED");
    assert.ok(
      !Number.isNaN(Date.parse(relisted.json().data[0].endedAt as string)),
    );

    const unknownRelease = await app.inject({
      method: "POST",
      url: `/v1/occupancies/${randomUUID()}/release`,
      headers,
    });
    assert.equal(unknownRelease.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(unknownRelease.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      unknownRelease.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(unknownRelease.json().detail, "Occupancy not found");
    assert.equal(unknownRelease.json().status, 404);

    await app.close();
  },
);

serialTest(
  "Checks API rejects duplicate checks, invalid mutations, and invalid terminal transitions",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const tableId = randomUUID();

    const visitCreate = await app.inject({
      method: "POST",
      url: "/v1/visits",
      headers,
      payload: { branchId, tableIds: [tableId], guestCount: 2 },
    });
    assert.equal(visitCreate.statusCode, 201);
    const visitId = visitCreate.json().data.id as string;

    const createCheck = await app.inject({
      method: "POST",
      url: `/v1/visits/${visitId}/check`,
      headers,
      payload: { currency: "ARS" },
    });
    assert.equal(createCheck.statusCode, 201);
    assert.deepEqual(Object.keys(createCheck.json()).sort(), ["data"]);
    const checkId = createCheck.json().data.id as string;

    const duplicateCheck = await app.inject({
      method: "POST",
      url: `/v1/visits/${visitId}/check`,
      headers,
      payload: { currency: "ARS" },
    });
    assert.equal(duplicateCheck.statusCode, 409);
    assert.deepEqual(
      new Set(Object.keys(duplicateCheck.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      duplicateCheck.json().type,
      "https://docs.maitre.app/problems/conflict",
    );
    assert.equal(duplicateCheck.json().status, 409);

    const invalidLine = await app.inject({
      method: "POST",
      url: `/v1/checks/${checkId}/add-line`,
      headers,
      payload: { description: "Broken", amountMinorUnits: -1 },
    });
    assert.equal(invalidLine.statusCode, 400);
    assert.deepEqual(
      new Set(Object.keys(invalidLine.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      invalidLine.json().type,
      "https://docs.maitre.app/problems/bad-request",
    );
    assert.equal(invalidLine.json().status, 400);
    assert.match(String(invalidLine.json().detail), /amountMinorUnits/i);

    const validLine = await app.inject({
      method: "POST",
      url: `/v1/checks/${checkId}/add-line`,
      headers,
      payload: { description: "Valid item", amountMinorUnits: 500 },
    });
    assert.equal(validLine.statusCode, 200);
    assert.deepEqual(Object.keys(validLine.json()).sort(), ["data"]);

    const invalidVoidBody = await app.inject({
      method: "POST",
      url: `/v1/checks/${checkId}/void`,
      headers,
      payload: {},
    });
    assert.equal(invalidVoidBody.statusCode, 400);
    assert.deepEqual(
      new Set(Object.keys(invalidVoidBody.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      invalidVoidBody.json().type,
      "https://docs.maitre.app/problems/bad-request",
    );
    assert.equal(invalidVoidBody.json().status, 400);
    assert.match(String(invalidVoidBody.json().detail), /reason/i);

    const requestPayment = await app.inject({
      method: "POST",
      url: `/v1/checks/${checkId}/request-payment`,
      headers,
    });
    assert.equal(requestPayment.statusCode, 200);
    assert.deepEqual(Object.keys(requestPayment.json()).sort(), ["data"]);
    assert.equal(requestPayment.json().data.status, "PAYMENT_PENDING");

    const addLineAfterPaymentRequested = await app.inject({
      method: "POST",
      url: `/v1/checks/${checkId}/add-line`,
      headers,
      payload: { description: "Late line", amountMinorUnits: 100 },
    });
    assert.equal(addLineAfterPaymentRequested.statusCode, 400);
    assert.deepEqual(
      new Set(
        Object.keys(
          addLineAfterPaymentRequested.json() as Record<string, unknown>,
        ),
      ),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      addLineAfterPaymentRequested.json().type,
      "https://docs.maitre.app/problems/bad-request",
    );
    assert.equal(addLineAfterPaymentRequested.json().status, 400);

    const settleUnbalanced = await app.inject({
      method: "POST",
      url: `/v1/checks/${checkId}/settle`,
      headers,
    });
    assert.equal(settleUnbalanced.statusCode, 400);
    assert.deepEqual(
      new Set(Object.keys(settleUnbalanced.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      settleUnbalanced.json().type,
      "https://docs.maitre.app/problems/bad-request",
    );
    assert.equal(settleUnbalanced.json().status, 400);

    const voidCheck = await app.inject({
      method: "POST",
      url: `/v1/checks/${checkId}/void`,
      headers,
      payload: { reason: "operator cancelled" },
    });
    assert.equal(voidCheck.statusCode, 200);
    assert.deepEqual(Object.keys(voidCheck.json()).sort(), ["data"]);
    assert.equal(voidCheck.json().data.status, "VOID");

    const settleVoid = await app.inject({
      method: "POST",
      url: `/v1/checks/${checkId}/settle`,
      headers,
    });
    assert.equal(settleVoid.statusCode, 409);
    assert.deepEqual(
      new Set(Object.keys(settleVoid.json() as Record<string, unknown>)),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      settleVoid.json().type,
      "https://docs.maitre.app/problems/conflict",
    );
    assert.equal(settleVoid.json().status, 409);

    const requestPaymentAgain = await app.inject({
      method: "POST",
      url: `/v1/checks/${checkId}/request-payment`,
      headers,
    });
    assert.equal(requestPaymentAgain.statusCode, 409);
    assert.deepEqual(
      new Set(
        Object.keys(requestPaymentAgain.json() as Record<string, unknown>),
      ),
      new Set([
        "type",
        "title",
        "status",
        "detail",
        "instance",
        "code",
        "correlationId",
      ]),
    );
    assert.equal(
      requestPaymentAgain.json().type,
      "https://docs.maitre.app/problems/conflict",
    );
    assert.equal(requestPaymentAgain.json().status, 409);

    await app.close();
  },
);

serialTest(
  "Pending checks are branch-scoped and expose server-calculated cashier context",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const headers = ownerHeaders(container, tenantId);
    const app = await buildApp(container);
    const salon = (await container.salons.listByBranch(tenantId, branchId))[0]!;
    const table = (await container.tables.listBySalon(tenantId, salon.id))[0]!;

    const pendingVisit = (
      await app.inject({
        method: "POST",
        url: "/v1/visits",
        headers,
        payload: { branchId, tableIds: [table.id], guestCount: 3 },
      })
    ).json().data;
    const pendingCheck = (
      await app.inject({
        method: "POST",
        url: `/v1/visits/${pendingVisit.id}/check`,
        headers,
        payload: { currency: "ARS" },
      })
    ).json().data;
    await app.inject({
      method: "POST",
      url: `/v1/checks/${pendingCheck.id}/add-line`,
      headers,
      payload: { description: "Cena", amountMinorUnits: 12_500 },
    });
    await app.inject({
      method: "POST",
      url: `/v1/checks/${pendingCheck.id}/request-payment`,
      headers,
    });

    const openVisit = (
      await app.inject({
        method: "POST",
        url: "/v1/visits",
        headers,
        payload: { branchId, tableIds: [randomUUID()], guestCount: 1 },
      })
    ).json().data;
    await app.inject({
      method: "POST",
      url: `/v1/visits/${openVisit.id}/check`,
      headers,
      payload: { currency: "ARS" },
    });

    const response = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/pending-checks`,
      headers,
    });
    assert.equal(response.statusCode, 200);
    const listed = response
      .json()
      .data.find((check: { id: string }) => check.id === pendingCheck.id);
    assert.ok(listed);
    assert.equal(
      response
        .json()
        .data.every(
          (check: { status: string }) => check.status === "PAYMENT_PENDING",
        ),
      true,
    );
    assert.equal(listed.totals.netDue, 12_500);
    assert.equal(listed.totals.balance, 12_500);
    assert.equal(listed.paymentsSummary.paidMinorUnits, 0);
    assert.equal(listed.visit.id, pendingVisit.id);
    assert.equal(listed.visit.guestCount, 3);
    assert.deepEqual(listed.tables, [
      {
        id: table.id,
        number: table.number,
        ...(table.name ? { name: table.name } : {}),
      },
    ]);

    const now = new Date();
    const scopedUser = {
      id: randomUUID(),
      identityProvider: "fixture",
      externalIdentityId: "pending-checks-scoped-cashier",
      displayName: "Scoped Cashier",
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    await container.users.save(scopedUser);
    await container.memberships.save({
      id: randomUUID(),
      tenantId,
      userId: scopedUser.id,
      status: "ACTIVE",
      branchScopeType: "SELECTED_BRANCHES",
      roleIds: ["role_cashier"],
      branchIds: [randomUUID()],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const scopedToken = "pending-checks-scoped-cashier-token";
    sessionsOf(container).registerToken(scopedToken, {
      provider: "fixture",
      subject: scopedUser.externalIdentityId,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });

    const forbidden = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/pending-checks`,
      headers: {
        authorization: `Bearer ${scopedToken}`,
        "x-tenant-id": tenantId,
      },
    });
    assert.equal(forbidden.statusCode, 403);
    assert.equal(
      forbidden.headers["content-type"],
      "application/problem+json; charset=utf-8",
    );
    assert.equal(forbidden.json().code, "INSUFFICIENT_SCOPE");

    await app.close();
  },
);
