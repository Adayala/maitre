import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../app.js";
import { buildContainer, type Container } from "../composition/container.js";
import type {
  FixtureSessionVerificationPort,
  InMemoryOutboxRepository,
} from "@maitre/adapter-persistence-memory";

// SPEC-071/072/073/074/075/080 §5 — Fastify inject() coverage for the
// Reservations domain API.

function sessionsOf(container: Container): FixtureSessionVerificationPort {
  return container.sessions as FixtureSessionVerificationPort;
}

function outboxOf(container: Container): InMemoryOutboxRepository {
  return container.outbox as InMemoryOutboxRepository;
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

function serialTest(name: string, fn: () => Promise<void> | void) {
  return test(name, { concurrency: false }, fn);
}

serialTest("Reservation lifecycle: create, confirm, seat", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);

  const create = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/reservations`,
    headers: ownerHeaders(container, tenantId),
    payload: {
      partySize: 2,
      startAt: "2026-08-01T20:00:00Z",
      durationMinutes: 90,
    },
  });
  assert.equal(create.statusCode, 201);
  const reservation = create.json().data;
  assert.equal(reservation.status, "PENDING");

  const confirm = await app.inject({
    method: "POST",
    url: `/v1/reservations/${reservation.id}/confirm`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(confirm.statusCode, 200);
  assert.equal(confirm.json().data.status, "CONFIRMED");
  assert.ok(Array.isArray(confirm.json().data.tableIds));
  assert.ok(confirm.json().data.tableIds.length > 0);

  const seat = await app.inject({
    method: "POST",
    url: `/v1/reservations/${reservation.id}/seat`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(seat.statusCode, 200);
  assert.equal(seat.json().data.status, "SEATED");
  assert.ok(seat.json().data.visitId);
  const visit = await container.visits.findById(
    tenantId,
    seat.json().data.visitId,
  );
  assert.ok(visit);
  assert.equal(visit!.branchId, branchId);
  assert.equal(visit!.reservationId, reservation.id);
  assert.equal(visit!.status, "OPEN");
  assert.deepEqual(visit!.tableIds, confirm.json().data.tableIds);
  await app.close();
});

serialTest(
  "Reservation list filters by status and no-show transitions a confirmed reservation",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);

    const firstCreate = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers: ownerHeaders(container, tenantId),
      payload: {
        partySize: 2,
        startAt: "2026-08-03T20:00:00Z",
        durationMinutes: 90,
      },
    });
    assert.equal(firstCreate.statusCode, 201);
    const firstReservation = firstCreate.json().data;

    const secondCreate = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers: ownerHeaders(container, tenantId),
      payload: {
        partySize: 3,
        startAt: "2026-08-03T21:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(secondCreate.statusCode, 201);
    const secondReservation = secondCreate.json().data;

    const confirm = await app.inject({
      method: "POST",
      url: `/v1/reservations/${firstReservation.id}/confirm`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(confirm.statusCode, 200);

    const noShow = await app.inject({
      method: "POST",
      url: `/v1/reservations/${firstReservation.id}/no-show`,
      headers: ownerHeaders(container, tenantId),
      payload: { reason: "guest-did-not-arrive" },
    });
    assert.equal(noShow.statusCode, 200);
    assert.equal(noShow.json().data.status, "NO_SHOW");
    assert.equal(noShow.json().data.noShowReason, "guest-did-not-arrive");

    const pendingList = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/reservations?status=PENDING`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(pendingList.statusCode, 200);
    assert.equal(pendingList.json().data.length, 1);
    assert.equal(pendingList.json().data[0].id, secondReservation.id);
    assert.equal("source" in pendingList.json().data[0], false);

    const noShowList = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/reservations?status=NO_SHOW`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(noShowList.statusCode, 200);
    assert.equal(noShowList.json().data.length, 1);
    assert.equal(noShowList.json().data[0].id, firstReservation.id);
    assert.equal("source" in noShowList.json().data[0], false);
    await app.close();
  },
);

serialTest(
  "Reservation create/detail preserve source while list redacts it",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const create = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
      payload: {
        partySize: 2,
        startAt: "2026-08-13T20:00:00Z",
        durationMinutes: 60,
        source: "PHONE",
        guestId: "guest-list-redaction",
        notes: "window",
      },
    });
    assert.equal(create.statusCode, 201);
    assert.equal(create.json().data.source, "PHONE");
    assert.deepEqual(Object.keys(create.json().data).sort(), [
      "branchId",
      "createdAt",
      "durationMinutes",
      "guestId",
      "id",
      "notes",
      "partySize",
      "revision",
      "source",
      "startAt",
      "status",
      "tenantId",
      "updatedAt",
    ]);

    const list = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
    });
    assert.equal(list.statusCode, 200);
    assert.deepEqual(
      new Set(Object.keys(list.json() as Record<string, unknown>)),
      new Set(["data"]),
    );
    const listed = list
      .json()
      .data.find((item: { id: string }) => item.id === create.json().data.id);
    assert.ok(listed);
    assert.equal("source" in listed, false);
    assert.equal(listed.guestId, create.json().data.guestId);
    assert.equal(listed.notes, "window");
    assert.deepEqual(Object.keys(listed).sort(), [
      "branchId",
      "createdAt",
      "durationMinutes",
      "guestId",
      "id",
      "notes",
      "partySize",
      "revision",
      "startAt",
      "status",
      "tenantId",
      "updatedAt",
    ]);

    const detail = await app.inject({
      method: "GET",
      url: `/v1/reservations/${create.json().data.id}`,
      headers,
    });
    assert.equal(detail.statusCode, 200);
    assert.deepEqual(
      new Set(Object.keys(detail.json() as Record<string, unknown>)),
      new Set(["data"]),
    );
    assert.equal(detail.json().data.source, "PHONE");
    assert.equal(detail.json().data.guestId, create.json().data.guestId);
    assert.equal(detail.json().data.notes, "window");
    assert.deepEqual(Object.keys(detail.json().data).sort(), [
      "branchId",
      "createdAt",
      "durationMinutes",
      "guestId",
      "id",
      "notes",
      "partySize",
      "revision",
      "source",
      "startAt",
      "status",
      "tenantId",
      "updatedAt",
    ]);

    await app.close();
  },
);

serialTest("Reservation cancel on a different reservation", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);

  const create = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/reservations`,
    headers: ownerHeaders(container, tenantId),
    payload: {
      partySize: 4,
      startAt: "2026-08-02T20:00:00Z",
      durationMinutes: 60,
    },
  });
  const reservation = create.json().data;

  const cancel = await app.inject({
    method: "POST",
    url: `/v1/reservations/${reservation.id}/cancel`,
    headers: ownerHeaders(container, tenantId),
    payload: { reasonCode: "GUEST_REQUEST" },
  });
  assert.equal(cancel.statusCode, 200);
  assert.equal(cancel.json().data.status, "CANCELLED");
  await app.close();
});

serialTest(
  "Reservation detail returns the reservation and hides cross-tenant reservations as 404",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const create = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
      payload: {
        partySize: 2,
        startAt: "2026-08-04T20:00:00Z",
        durationMinutes: 90,
      },
    });
    assert.equal(create.statusCode, 201);
    const reservation = create.json().data;

    const detail = await app.inject({
      method: "GET",
      url: `/v1/reservations/${reservation.id}`,
      headers,
    });
    assert.equal(detail.statusCode, 200);
    assert.equal(detail.json().data.id, reservation.id);
    assert.equal(detail.json().data.branchId, branchId);
    assert.equal(detail.json().data.partySize, 2);
    assert.equal(detail.json().data.status, "PENDING");

    const otherTenantId = randomUUID();
    const now = new Date();
    await container.tenants.save({
      id: otherTenantId,
      name: "Other Tenant Reservations",
      status: "ACTIVE",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
      createdAt: now,
      updatedAt: now,
    });
    const owner = await container.users.findByExternalIdentity(
      "fixture",
      "demo-owner",
    );
    await container.memberships.save({
      id: randomUUID(),
      tenantId: otherTenantId,
      userId: owner!.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_owner"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const crossTenant = await app.inject({
      method: "GET",
      url: `/v1/reservations/${reservation.id}`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": otherTenantId,
      },
    });
    assert.equal(crossTenant.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(crossTenant.json() as Record<string, unknown>)),
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
      crossTenant.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(crossTenant.json().detail, "Reservation not found");
    assert.equal(crossTenant.json().status, 404);

    await app.close();
  },
);

serialTest(
  "Reservation list returns empty for unknown or cross-tenant branches",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const create = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
      payload: {
        partySize: 2,
        startAt: "2026-08-06T20:00:00Z",
        durationMinutes: 90,
      },
    });
    assert.equal(create.statusCode, 201);

    const unknownBranch = await app.inject({
      method: "GET",
      url: `/v1/branches/${randomUUID()}/reservations`,
      headers,
    });
    assert.equal(unknownBranch.statusCode, 200);
    assert.deepEqual(
      new Set(Object.keys(unknownBranch.json() as Record<string, unknown>)),
      new Set(["data"]),
    );
    assert.deepEqual(unknownBranch.json().data, []);

    const otherTenantId = randomUUID();
    const now = new Date();
    await container.tenants.save({
      id: otherTenantId,
      name: "Other Tenant Reservation List",
      status: "ACTIVE",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
      createdAt: now,
      updatedAt: now,
    });
    const owner = await container.users.findByExternalIdentity(
      "fixture",
      "demo-owner",
    );
    await container.memberships.save({
      id: randomUUID(),
      tenantId: otherTenantId,
      userId: owner!.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_owner"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const crossTenant = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/reservations`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": otherTenantId,
      },
    });
    assert.equal(crossTenant.statusCode, 200);
    assert.deepEqual(
      new Set(Object.keys(crossTenant.json() as Record<string, unknown>)),
      new Set(["data"]),
    );
    assert.deepEqual(crossTenant.json().data, []);

    await app.close();
  },
);

serialTest(
  "Reservation list validates status filter against the domain enum",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);

    const invalidStatus = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/reservations?status=WAITING`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(invalidStatus.statusCode, 400);

    const validStatus = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/reservations?status=PENDING`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(validStatus.statusCode, 200);
    assert.deepEqual(validStatus.json().data, []);

    await app.close();
  },
);

serialTest("403 without permission, 404 for unknown ids", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const now = new Date();

  const cook = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-cook-reservations",
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
  const token = "cook-token-reservations";
  sessionsOf(container).registerToken(token, {
    provider: "fixture",
    subject: "demo-cook-reservations",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const forbidden = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/reservations`,
    headers: { authorization: `Bearer ${token}`, "x-tenant-id": tenantId },
    payload: {
      partySize: 2,
      startAt: "2026-08-01T20:00:00Z",
      durationMinutes: 60,
    },
  });
  assert.equal(forbidden.statusCode, 403);

  const notFound = await app.inject({
    method: "GET",
    url: `/v1/reservations/${randomUUID()}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(notFound.statusCode, 404);
  await app.close();
});

serialTest(
  "Reservation command routes reject invalid lifecycle transitions with 409",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const createForDoubleConfirm = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
      payload: {
        partySize: 2,
        startAt: "2026-08-11T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(createForDoubleConfirm.statusCode, 201);
    const doubleConfirmReservation = createForDoubleConfirm.json().data;

    const firstConfirm = await app.inject({
      method: "POST",
      url: `/v1/reservations/${doubleConfirmReservation.id}/confirm`,
      headers,
    });
    assert.equal(firstConfirm.statusCode, 200);

    const secondConfirm = await app.inject({
      method: "POST",
      url: `/v1/reservations/${doubleConfirmReservation.id}/confirm`,
      headers,
    });
    assert.equal(secondConfirm.statusCode, 409);

    const createForSeat = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
      payload: {
        partySize: 2,
        startAt: "2026-08-12T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(createForSeat.statusCode, 201);
    const seatReservation = createForSeat.json().data;

    const seatPending = await app.inject({
      method: "POST",
      url: `/v1/reservations/${seatReservation.id}/seat`,
      headers,
    });
    assert.equal(seatPending.statusCode, 409);

    const createForCancel = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
      payload: {
        partySize: 3,
        startAt: "2026-08-13T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(createForCancel.statusCode, 201);
    const cancelReservation = createForCancel.json().data;

    const cancel = await app.inject({
      method: "POST",
      url: `/v1/reservations/${cancelReservation.id}/cancel`,
      headers,
      payload: { reasonCode: "GUEST_REQUEST" },
    });
    assert.equal(cancel.statusCode, 200);

    const noShowCancelled = await app.inject({
      method: "POST",
      url: `/v1/reservations/${cancelReservation.id}/no-show`,
      headers,
      payload: { reason: "guest-did-not-arrive" },
    });
    assert.equal(noShowCancelled.statusCode, 409);

    await app.close();
  },
);

serialTest(
  "Reservation cancel and no-show validate request bodies with 400",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const create = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
      payload: {
        partySize: 2,
        startAt: "2026-08-14T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(create.statusCode, 201);
    const reservation = create.json().data;

    const invalidCancel = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/cancel`,
      headers,
      payload: { reasonCode: "" },
    });
    assert.equal(invalidCancel.statusCode, 400);

    const confirm = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/confirm`,
      headers,
    });
    assert.equal(confirm.statusCode, 200);

    const invalidNoShow = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/no-show`,
      headers,
      payload: { reason: "" },
    });
    assert.equal(invalidNoShow.statusCode, 400);

    await app.close();
  },
);

serialTest(
  "Reservation confirm and seat hide cross-tenant reservations as 404",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const create = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers: ownerHeaders(container, tenantId),
      payload: {
        partySize: 2,
        startAt: "2026-08-15T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(create.statusCode, 201);
    const reservation = create.json().data;

    const otherTenantId = randomUUID();
    await container.tenants.save({
      id: otherTenantId,
      name: "Other Tenant Reservation Commands",
      status: "ACTIVE",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
      createdAt: now,
      updatedAt: now,
    });
    const owner = await container.users.findByExternalIdentity(
      "fixture",
      "demo-owner",
    );
    await container.memberships.save({
      id: randomUUID(),
      tenantId: otherTenantId,
      userId: owner!.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_owner"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const otherTenantHeaders = {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": otherTenantId,
    };

    const crossTenantConfirm = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/confirm`,
      headers: otherTenantHeaders,
    });
    assert.equal(crossTenantConfirm.statusCode, 404);
    assert.deepEqual(
      new Set(
        Object.keys(crossTenantConfirm.json() as Record<string, unknown>),
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
      crossTenantConfirm.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(crossTenantConfirm.json().detail, "Reservation not found");
    assert.equal(crossTenantConfirm.json().status, 404);

    const crossTenantSeat = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/seat`,
      headers: otherTenantHeaders,
    });
    assert.equal(crossTenantSeat.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(crossTenantSeat.json() as Record<string, unknown>)),
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
      crossTenantSeat.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(crossTenantSeat.json().detail, "Reservation not found");
    assert.equal(crossTenantSeat.json().status, 404);

    await app.close();
  },
);

serialTest("Reservation create validates request body with 400", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const headers = ownerHeaders(container, tenantId);

  const invalidPartySize = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/reservations`,
    headers,
    payload: {
      partySize: 0,
      startAt: "2026-08-16T20:00:00Z",
      durationMinutes: 60,
    },
  });
  assert.equal(invalidPartySize.statusCode, 400);

  const invalidStartAt = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/reservations`,
    headers,
    payload: { partySize: 2, startAt: "not-a-date", durationMinutes: 60 },
  });
  assert.equal(invalidStartAt.statusCode, 400);

  const invalidDuration = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/reservations`,
    headers,
    payload: {
      partySize: 2,
      startAt: "2026-08-16T20:00:00Z",
      durationMinutes: 0,
    },
  });
  assert.equal(invalidDuration.statusCode, 400);

  await app.close();
});

serialTest(
  "Reservation create hides unknown and cross-tenant branches as 404",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const unknownBranch = await app.inject({
      method: "POST",
      url: `/v1/branches/${randomUUID()}/reservations`,
      headers: ownerHeaders(container, tenantId),
      payload: {
        partySize: 2,
        startAt: "2026-08-17T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(unknownBranch.statusCode, 404);

    const otherTenantId = randomUUID();
    await container.tenants.save({
      id: otherTenantId,
      name: "Other Tenant Reservation Create",
      status: "ACTIVE",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
      createdAt: now,
      updatedAt: now,
    });
    const owner = await container.users.findByExternalIdentity(
      "fixture",
      "demo-owner",
    );
    await container.memberships.save({
      id: randomUUID(),
      tenantId: otherTenantId,
      userId: owner!.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_owner"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const crossTenant = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": otherTenantId,
      },
      payload: {
        partySize: 2,
        startAt: "2026-08-17T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(crossTenant.statusCode, 404);

    await app.close();
  },
);

serialTest(
  "Reservation command permissions distinguish confirm cancel no-show and seat",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const waiter = {
      id: randomUUID(),
      identityProvider: "fixture",
      externalIdentityId: "demo-waiter-reservation-commands",
      displayName: "Demo Waiter Reservation Commands",
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    await container.users.save(waiter);
    await container.memberships.save({
      id: randomUUID(),
      tenantId,
      userId: waiter.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_waiter"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const waiterToken = "waiter-token-reservation-commands";
    sessionsOf(container).registerToken(waiterToken, {
      provider: "fixture",
      subject: "demo-waiter-reservation-commands",
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });
    const waiterHeaders = {
      authorization: `Bearer ${waiterToken}`,
      "x-tenant-id": tenantId,
    };

    const create = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers: ownerHeaders(container, tenantId),
      payload: {
        partySize: 2,
        startAt: "2026-08-18T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(create.statusCode, 201);
    const reservation = create.json().data;

    const confirmDenied = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/confirm`,
      headers: waiterHeaders,
    });
    assert.equal(confirmDenied.statusCode, 403);

    const cancelDenied = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/cancel`,
      headers: waiterHeaders,
      payload: { reasonCode: "GUEST_REQUEST" },
    });
    assert.equal(cancelDenied.statusCode, 403);

    const noShowDenied = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/no-show`,
      headers: waiterHeaders,
      payload: { reason: "guest-did-not-arrive" },
    });
    assert.equal(noShowDenied.statusCode, 403);

    const confirm = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/confirm`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(confirm.statusCode, 200);

    const seatAllowed = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/seat`,
      headers: waiterHeaders,
    });
    assert.equal(seatAllowed.statusCode, 200);

    await app.close();
  },
);

serialTest(
  "Reservation confirm returns 409 when branch capacity is unavailable",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const firstCreate = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
      payload: {
        partySize: 6,
        startAt: "2026-08-19T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(firstCreate.statusCode, 201);
    const firstReservation = firstCreate.json().data;

    const firstConfirm = await app.inject({
      method: "POST",
      url: `/v1/reservations/${firstReservation.id}/confirm`,
      headers,
    });
    assert.equal(firstConfirm.statusCode, 200);

    const secondCreate = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
      payload: {
        partySize: 6,
        startAt: "2026-08-19T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(secondCreate.statusCode, 201);
    const secondReservation = secondCreate.json().data;

    const secondConfirm = await app.inject({
      method: "POST",
      url: `/v1/reservations/${secondReservation.id}/confirm`,
      headers,
    });
    assert.equal(secondConfirm.statusCode, 409);

    await app.close();
  },
);

serialTest(
  "Salon declared capacity without tables cannot confirm or seat",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const brandId = (await container.brands.listByTenant(tenantId))[0]!.id;

    const branchResponse = await app.inject({
      method: "POST",
      url: "/v1/branches",
      headers,
      payload: {
        brandId,
        name: "Sucursal sin mesas",
        code: "EMPTY",
        timezone: "America/Argentina/Buenos_Aires",
      },
    });
    assert.equal(branchResponse.statusCode, 201);
    const branchId = branchResponse.json().data.id as string;

    const salonResponse = await app.inject({
      method: "POST",
      url: "/v1/salons",
      headers,
      payload: { branchId, name: "Salón declarado", capacity: 40 },
    });
    assert.equal(salonResponse.statusCode, 201);
    assert.deepEqual(
      await container.tables.listBySalon(
        tenantId,
        salonResponse.json().data.id,
      ),
      [],
    );

    const availability = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/availability?partySize=2&startAt=2026-08-29T20:00:00Z&durationMinutes=60`,
      headers,
    });
    assert.equal(availability.statusCode, 200);
    assert.equal(availability.json().data.available, false);
    assert.deepEqual(availability.json().data.freeTableIds, []);

    const create = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
      payload: {
        partySize: 2,
        startAt: "2026-08-29T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(create.statusCode, 201);
    assert.equal(create.json().data.status, "PENDING");
    const reservationId = create.json().data.id as string;

    const confirm = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservationId}/confirm`,
      headers,
    });
    assert.equal(confirm.statusCode, 409);

    const seat = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservationId}/seat`,
      headers,
    });
    assert.equal(seat.statusCode, 409);
    assert.deepEqual(
      await container.visits.listByBranch(tenantId, branchId),
      [],
    );

    await app.close();
  },
);

serialTest(
  "Reservation cancel and no-show hide cross-tenant reservations as 404",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const create = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers: ownerHeaders(container, tenantId),
      payload: {
        partySize: 2,
        startAt: "2026-08-20T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(create.statusCode, 201);
    const reservation = create.json().data;

    const confirm = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/confirm`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(confirm.statusCode, 200);

    const otherTenantId = randomUUID();
    await container.tenants.save({
      id: otherTenantId,
      name: "Other Tenant Reservation Cancel No-Show",
      status: "ACTIVE",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
      createdAt: now,
      updatedAt: now,
    });
    const owner = await container.users.findByExternalIdentity(
      "fixture",
      "demo-owner",
    );
    await container.memberships.save({
      id: randomUUID(),
      tenantId: otherTenantId,
      userId: owner!.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_owner"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const otherTenantHeaders = {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": otherTenantId,
    };

    const cancel = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/cancel`,
      headers: otherTenantHeaders,
      payload: { reasonCode: "GUEST_REQUEST" },
    });
    assert.equal(cancel.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(cancel.json() as Record<string, unknown>)),
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
      cancel.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(cancel.json().detail, "Reservation not found");
    assert.equal(cancel.json().status, 404);

    const noShow = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/no-show`,
      headers: otherTenantHeaders,
      payload: { reason: "guest-did-not-arrive" },
    });
    assert.equal(noShow.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(noShow.json() as Record<string, unknown>)),
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
      noShow.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(noShow.json().detail, "Reservation not found");
    assert.equal(noShow.json().status, 404);

    await app.close();
  },
);

serialTest(
  "Reservation command routes return 404 for unknown reservation ids",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const unknownReservationId = randomUUID();

    const confirm = await app.inject({
      method: "POST",
      url: `/v1/reservations/${unknownReservationId}/confirm`,
      headers,
    });
    assert.equal(confirm.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(confirm.json() as Record<string, unknown>)),
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
      confirm.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(confirm.json().detail, "Reservation not found");
    assert.equal(confirm.json().status, 404);

    const cancel = await app.inject({
      method: "POST",
      url: `/v1/reservations/${unknownReservationId}/cancel`,
      headers,
      payload: { reasonCode: "GUEST_REQUEST" },
    });
    assert.equal(cancel.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(cancel.json() as Record<string, unknown>)),
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
      cancel.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(cancel.json().detail, "Reservation not found");
    assert.equal(cancel.json().status, 404);

    const seat = await app.inject({
      method: "POST",
      url: `/v1/reservations/${unknownReservationId}/seat`,
      headers,
    });
    assert.equal(seat.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(seat.json() as Record<string, unknown>)),
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
      seat.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(seat.json().detail, "Reservation not found");
    assert.equal(seat.json().status, 404);

    const noShow = await app.inject({
      method: "POST",
      url: `/v1/reservations/${unknownReservationId}/no-show`,
      headers,
      payload: { reason: "guest-did-not-arrive" },
    });
    assert.equal(noShow.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(noShow.json() as Record<string, unknown>)),
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
      noShow.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(noShow.json().detail, "Reservation not found");
    assert.equal(noShow.json().status, 404);

    await app.close();
  },
);

serialTest(
  "Reservation read endpoints require reservation:read and allow waiter operational reads",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const create = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers: ownerHeaders(container, tenantId),
      payload: {
        partySize: 2,
        startAt: "2026-08-21T20:00:00Z",
        durationMinutes: 60,
        source: "PHONE",
        guestId: "guest-waiter-read",
        notes: "allergy context",
      },
    });
    assert.equal(create.statusCode, 201);
    const reservation = create.json().data;

    const waiter = {
      id: randomUUID(),
      identityProvider: "fixture",
      externalIdentityId: "demo-waiter-reservation-read",
      displayName: "Demo Waiter Reservation Read",
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    await container.users.save(waiter);
    await container.memberships.save({
      id: randomUUID(),
      tenantId,
      userId: waiter.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_waiter"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const waiterToken = "waiter-token-reservation-read";
    sessionsOf(container).registerToken(waiterToken, {
      provider: "fixture",
      subject: "demo-waiter-reservation-read",
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });
    const waiterHeaders = {
      authorization: `Bearer ${waiterToken}`,
      "x-tenant-id": tenantId,
    };

    const waiterList = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/reservations`,
      headers: waiterHeaders,
    });
    assert.equal(waiterList.statusCode, 200);
    assert.equal(waiterList.json().data.length, 1);
    assert.equal(waiterList.json().data[0].id, reservation.id);
    assert.equal("source" in waiterList.json().data[0], false);
    assert.equal(waiterList.json().data[0].guestId, reservation.guestId);
    assert.equal(waiterList.json().data[0].notes, "allergy context");

    const waiterDetail = await app.inject({
      method: "GET",
      url: `/v1/reservations/${reservation.id}`,
      headers: waiterHeaders,
    });
    assert.equal(waiterDetail.statusCode, 200);
    assert.equal(waiterDetail.json().data.id, reservation.id);
    assert.equal(waiterDetail.json().data.source, "PHONE");
    assert.equal(waiterDetail.json().data.guestId, reservation.guestId);
    assert.equal(waiterDetail.json().data.notes, "allergy context");

    const cook = {
      id: randomUUID(),
      identityProvider: "fixture",
      externalIdentityId: "demo-cook-reservation-read",
      displayName: "Demo Cook Reservation Read",
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
    const cookToken = "cook-token-reservation-read";
    sessionsOf(container).registerToken(cookToken, {
      provider: "fixture",
      subject: "demo-cook-reservation-read",
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });
    const cookHeaders = {
      authorization: `Bearer ${cookToken}`,
      "x-tenant-id": tenantId,
    };

    const cookList = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/reservations`,
      headers: cookHeaders,
    });
    assert.equal(cookList.statusCode, 403);

    const cookDetail = await app.inject({
      method: "GET",
      url: `/v1/reservations/${reservation.id}`,
      headers: cookHeaders,
    });
    assert.equal(cookDetail.statusCode, 403);

    await app.close();
  },
);

serialTest(
  "Reservation manager role can confirm cancel no-show and seat",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const manager = {
      id: randomUUID(),
      identityProvider: "fixture",
      externalIdentityId: "demo-manager-reservation-commands",
      displayName: "Demo Manager Reservation Commands",
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    await container.users.save(manager);
    await container.memberships.save({
      id: randomUUID(),
      tenantId,
      userId: manager.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_manager"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const managerToken = "manager-token-reservation-commands";
    sessionsOf(container).registerToken(managerToken, {
      provider: "fixture",
      subject: "demo-manager-reservation-commands",
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });
    const managerHeaders = {
      authorization: `Bearer ${managerToken}`,
      "x-tenant-id": tenantId,
    };

    const confirmCreate = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers: ownerHeaders(container, tenantId),
      payload: {
        partySize: 2,
        startAt: "2026-08-22T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(confirmCreate.statusCode, 201);
    const confirmReservation = confirmCreate.json().data;

    const confirm = await app.inject({
      method: "POST",
      url: `/v1/reservations/${confirmReservation.id}/confirm`,
      headers: managerHeaders,
    });
    assert.equal(confirm.statusCode, 200);

    const seat = await app.inject({
      method: "POST",
      url: `/v1/reservations/${confirmReservation.id}/seat`,
      headers: managerHeaders,
    });
    assert.equal(seat.statusCode, 200);

    const cancelCreate = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers: ownerHeaders(container, tenantId),
      payload: {
        partySize: 3,
        startAt: "2026-08-23T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(cancelCreate.statusCode, 201);
    const cancelReservation = cancelCreate.json().data;

    const cancel = await app.inject({
      method: "POST",
      url: `/v1/reservations/${cancelReservation.id}/cancel`,
      headers: managerHeaders,
      payload: { reasonCode: "GUEST_REQUEST" },
    });
    assert.equal(cancel.statusCode, 200);

    const noShowCreate = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers: ownerHeaders(container, tenantId),
      payload: {
        partySize: 4,
        startAt: "2026-08-24T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(noShowCreate.statusCode, 201);
    const noShowReservation = noShowCreate.json().data;

    const preConfirm = await app.inject({
      method: "POST",
      url: `/v1/reservations/${noShowReservation.id}/confirm`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(preConfirm.statusCode, 200);

    const noShow = await app.inject({
      method: "POST",
      url: `/v1/reservations/${noShowReservation.id}/no-show`,
      headers: managerHeaders,
      payload: { reason: "guest-did-not-arrive" },
    });
    assert.equal(noShow.statusCode, 200);

    await app.close();
  },
);

serialTest("Waitlist: add, notify, seat, cancel", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const seatTableId = randomUUID();

  const add = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/waitlist-entries`,
    headers: ownerHeaders(container, tenantId),
    payload: {
      partySize: 2,
      quotedMinutes: 15,
      notes: "patio",
      guestId: "guest-waitlist",
    },
  });
  assert.equal(add.statusCode, 201);
  const entry = add.json().data;
  assert.equal(entry.status, "WAITING");
  assert.equal(entry.notes, "patio");
  assert.equal(entry.quotedMinutes, 15);
  assert.equal(entry.guestId, "guest-waitlist");
  assert.deepEqual(Object.keys(entry).sort(), [
    "arrivedAt",
    "branchId",
    "createdAt",
    "guestId",
    "id",
    "notes",
    "partySize",
    "priorityOverride",
    "quotedMinutes",
    "revision",
    "status",
    "tenantId",
    "updatedAt",
  ]);

  const get = await app.inject({
    method: "GET",
    url: `/v1/waitlist-entries/${entry.id}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(get.statusCode, 200);
  assert.equal(get.json().data.notes, "patio");
  assert.equal(get.json().data.quotedMinutes, 15);
  assert.equal(get.json().data.guestId, "guest-waitlist");
  assert.deepEqual(Object.keys(get.json().data).sort(), [
    "arrivedAt",
    "branchId",
    "createdAt",
    "guestId",
    "id",
    "notes",
    "partySize",
    "priorityOverride",
    "quotedMinutes",
    "revision",
    "status",
    "tenantId",
    "updatedAt",
  ]);

  const list = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/waitlist-entries`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(list.statusCode, 200);
  assert.equal(list.json().data.length, 1);
  assert.equal(list.json().data[0].notes, "patio");
  assert.equal(list.json().data[0].quotedMinutes, 15);
  assert.equal(list.json().data[0].guestId, "guest-waitlist");
  assert.deepEqual(Object.keys(list.json().data[0]).sort(), [
    "arrivedAt",
    "branchId",
    "createdAt",
    "guestId",
    "id",
    "notes",
    "partySize",
    "priorityOverride",
    "quotedMinutes",
    "revision",
    "status",
    "tenantId",
    "updatedAt",
  ]);

  const notify = await app.inject({
    method: "POST",
    url: `/v1/waitlist-entries/${entry.id}/notify`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(notify.statusCode, 200);
  assert.equal(notify.json().data.status, "NOTIFIED");
  assert.equal(notify.json().data.revision, 2);
  assert.equal(notify.json().data.createdAt, entry.createdAt);
  assert.equal(notify.json().data.arrivedAt, entry.arrivedAt);
  assert.equal(typeof notify.json().data.notifiedAt, "string");
  assert.ok(!Number.isNaN(Date.parse(notify.json().data.notifiedAt)));
  assert.equal(notify.json().data.updatedAt, notify.json().data.notifiedAt);

  const seat = await app.inject({
    method: "POST",
    url: `/v1/waitlist-entries/${entry.id}/seat`,
    headers: ownerHeaders(container, tenantId),
    payload: { tableIds: [seatTableId] },
  });
  assert.equal(seat.statusCode, 200);
  assert.equal(seat.json().data.status, "SEATED");
  assert.ok(seat.json().data.visitId);
  assert.equal(seat.json().data.revision, 3);
  assert.equal(seat.json().data.createdAt, entry.createdAt);
  assert.equal(seat.json().data.arrivedAt, entry.arrivedAt);
  assert.equal(seat.json().data.notifiedAt, notify.json().data.notifiedAt);
  assert.equal(typeof seat.json().data.seatedAt, "string");
  assert.ok(!Number.isNaN(Date.parse(seat.json().data.seatedAt)));
  assert.equal(seat.json().data.updatedAt, seat.json().data.seatedAt);
  const visit = await container.visits.findById(
    tenantId,
    seat.json().data.visitId,
  );
  assert.ok(visit);
  assert.equal(visit!.branchId, branchId);
  assert.equal(visit!.status, "OPEN");
  assert.deepEqual(visit!.tableIds, [seatTableId]);
  assert.equal(visit!.guestCount, entry.partySize);

  const add2 = await app.inject({
    method: "POST",
    url: `/v1/branches/${branchId}/waitlist-entries`,
    headers: ownerHeaders(container, tenantId),
    payload: { partySize: 3 },
  });
  const entry2 = add2.json().data;
  const cancel = await app.inject({
    method: "POST",
    url: `/v1/waitlist-entries/${entry2.id}/cancel`,
    headers: ownerHeaders(container, tenantId),
    payload: { reason: "left" },
  });
  assert.equal(cancel.statusCode, 200);
  assert.equal(cancel.json().data.status, "CANCELLED");
  assert.equal(cancel.json().data.revision, 2);
  assert.equal(cancel.json().data.createdAt, entry2.createdAt);
  assert.equal(cancel.json().data.arrivedAt, entry2.arrivedAt);
  assert.equal(cancel.json().data.cancelReason, "left");
  await app.close();
});

serialTest(
  "Waitlist priority override requires dedicated permission",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const waiter = {
      id: randomUUID(),
      identityProvider: "fixture",
      externalIdentityId: "demo-waiter-waitlist",
      displayName: "Demo Waiter",
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    await container.users.save(waiter);
    await container.memberships.save({
      id: randomUUID(),
      tenantId,
      userId: waiter.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_waiter"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const waiterToken = "waiter-token-waitlist";
    sessionsOf(container).registerToken(waiterToken, {
      provider: "fixture",
      subject: "demo-waiter-waitlist",
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });

    const add = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/waitlist-entries`,
      headers: ownerHeaders(container, tenantId),
      payload: { partySize: 2 },
    });
    assert.equal(add.statusCode, 201);
    const entry = add.json().data;

    const deniedOverride = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${entry.id}/priority-overrides`,
      headers: {
        authorization: `Bearer ${waiterToken}`,
        "x-tenant-id": tenantId,
      },
      payload: { priorityOverride: 10, reason: "vip" },
    });
    assert.equal(deniedOverride.statusCode, 403);

    const allowedOverride = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${entry.id}/priority-overrides`,
      headers: ownerHeaders(container, tenantId),
      payload: { priorityOverride: 10, reason: "vip" },
    });
    assert.equal(allowedOverride.statusCode, 200);
    assert.equal(allowedOverride.json().data.priorityOverride, 10);
    assert.equal(allowedOverride.json().data.overrideReason, "vip");
    await app.close();
  },
);

serialTest(
  "Waitlist read hides cross-tenant entries as 404 and lists return empty for unknown or cross-tenant branches",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const add = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/waitlist-entries`,
      headers,
      payload: { partySize: 2 },
    });
    assert.equal(add.statusCode, 201);
    const entry = add.json().data;

    const detail = await app.inject({
      method: "GET",
      url: `/v1/waitlist-entries/${entry.id}`,
      headers,
    });
    assert.equal(detail.statusCode, 200);
    assert.equal(detail.json().data.id, entry.id);
    assert.equal(detail.json().data.branchId, branchId);
    assert.equal(detail.json().data.status, "WAITING");

    const unknownBranchList = await app.inject({
      method: "GET",
      url: `/v1/branches/${randomUUID()}/waitlist-entries`,
      headers,
    });
    assert.equal(unknownBranchList.statusCode, 200);
    assert.deepEqual(unknownBranchList.json().data, []);

    const otherTenantId = randomUUID();
    const now = new Date();
    await container.tenants.save({
      id: otherTenantId,
      name: "Other Tenant Waitlist",
      status: "ACTIVE",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
      createdAt: now,
      updatedAt: now,
    });
    const owner = await container.users.findByExternalIdentity(
      "fixture",
      "demo-owner",
    );
    await container.memberships.save({
      id: randomUUID(),
      tenantId: otherTenantId,
      userId: owner!.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_owner"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const crossTenantDetail = await app.inject({
      method: "GET",
      url: `/v1/waitlist-entries/${entry.id}`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": otherTenantId,
      },
    });
    assert.equal(crossTenantDetail.statusCode, 404);

    const crossTenantList = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/waitlist-entries`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": otherTenantId,
      },
    });
    assert.equal(crossTenantList.statusCode, 200);
    assert.deepEqual(crossTenantList.json().data, []);

    await app.close();
  },
);

serialTest(
  "Waitlist list/read are ordered, expire transitions entries, and read permission is distinct from priority override",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const maitre = {
      id: randomUUID(),
      identityProvider: "fixture",
      externalIdentityId: "demo-maitre-waitlist",
      displayName: "Demo Maitre Waitlist",
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    await container.users.save(maitre);
    await container.memberships.save({
      id: randomUUID(),
      tenantId,
      userId: maitre.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_maitre"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const maitreToken = "maitre-token-waitlist";
    sessionsOf(container).registerToken(maitreToken, {
      provider: "fixture",
      subject: "demo-maitre-waitlist",
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });

    const firstAdd = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/waitlist-entries`,
      headers: ownerHeaders(container, tenantId),
      payload: { partySize: 2, notes: "first" },
    });
    assert.equal(firstAdd.statusCode, 201);
    const firstEntry = firstAdd.json().data;

    const secondAdd = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/waitlist-entries`,
      headers: ownerHeaders(container, tenantId),
      payload: { partySize: 4, notes: "second" },
    });
    assert.equal(secondAdd.statusCode, 201);
    const secondEntry = secondAdd.json().data;

    const override = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${secondEntry.id}/priority-overrides`,
      headers: ownerHeaders(container, tenantId),
      payload: { priorityOverride: 50, reason: "vip" },
    });
    assert.equal(override.statusCode, 200);
    assert.equal(override.json().data.arrivedAt, secondEntry.arrivedAt);
    assert.equal(override.json().data.priorityOverride, 50);
    assert.equal(override.json().data.overrideReason, "vip");

    const list = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/waitlist-entries`,
      headers: {
        authorization: `Bearer ${maitreToken}`,
        "x-tenant-id": tenantId,
      },
    });
    assert.equal(list.statusCode, 200);
    assert.equal(list.json().data.length, 2);
    assert.equal(list.json().data[0].id, secondEntry.id);
    assert.equal(list.json().data[1].id, firstEntry.id);

    const detail = await app.inject({
      method: "GET",
      url: `/v1/waitlist-entries/${secondEntry.id}`,
      headers: {
        authorization: `Bearer ${maitreToken}`,
        "x-tenant-id": tenantId,
      },
    });
    assert.equal(detail.statusCode, 200);
    assert.equal(detail.json().data.id, secondEntry.id);
    assert.equal(detail.json().data.arrivedAt, secondEntry.arrivedAt);
    assert.equal(detail.json().data.priorityOverride, 50);
    assert.equal(detail.json().data.overrideReason, "vip");

    const expire = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${firstEntry.id}/expire`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(expire.statusCode, 200);
    assert.equal(expire.json().data.status, "EXPIRED");

    const priorityOverrideAllowed = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${secondEntry.id}/priority-overrides`,
      headers: {
        authorization: `Bearer ${maitreToken}`,
        "x-tenant-id": tenantId,
      },
      payload: { priorityOverride: 60, reason: "host desk override" },
    });
    assert.equal(priorityOverrideAllowed.statusCode, 200);
    assert.equal(
      priorityOverrideAllowed.json().data.arrivedAt,
      secondEntry.arrivedAt,
    );
    assert.equal(priorityOverrideAllowed.json().data.priorityOverride, 60);
    assert.equal(
      priorityOverrideAllowed.json().data.overrideReason,
      "host desk override",
    );

    await app.close();
  },
);

serialTest(
  "Waitlist command routes hide cross-tenant entries as 404",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const add = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/waitlist-entries`,
      headers: ownerHeaders(container, tenantId),
      payload: { partySize: 2 },
    });
    assert.equal(add.statusCode, 201);
    const entry = add.json().data;

    const otherTenantId = randomUUID();
    await container.tenants.save({
      id: otherTenantId,
      name: "Other Tenant Waitlist Commands",
      status: "ACTIVE",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
      createdAt: now,
      updatedAt: now,
    });
    const owner = await container.users.findByExternalIdentity(
      "fixture",
      "demo-owner",
    );
    await container.memberships.save({
      id: randomUUID(),
      tenantId: otherTenantId,
      userId: owner!.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_owner"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const otherTenantHeaders = {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": otherTenantId,
    };

    const notify = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${entry.id}/notify`,
      headers: otherTenantHeaders,
    });
    assert.equal(notify.statusCode, 404);

    const cancel = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${entry.id}/cancel`,
      headers: otherTenantHeaders,
      payload: { reason: "should not cancel" },
    });
    assert.equal(cancel.statusCode, 404);

    const expire = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${entry.id}/expire`,
      headers: otherTenantHeaders,
    });
    assert.equal(expire.statusCode, 404);

    const priorityOverride = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${entry.id}/priority-overrides`,
      headers: otherTenantHeaders,
      payload: { priorityOverride: 50, reason: "should not override" },
    });
    assert.equal(priorityOverride.statusCode, 404);

    await app.close();
  },
);

serialTest(
  "Waitlist command routes reject invalid lifecycle transitions with 409",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const addNotified = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/waitlist-entries`,
      headers,
      payload: { partySize: 3 },
    });
    assert.equal(addNotified.statusCode, 201);
    const notifiedEntry = addNotified.json().data;

    const firstNotify = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${notifiedEntry.id}/notify`,
      headers,
    });
    assert.equal(firstNotify.statusCode, 200);

    const secondNotify = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${notifiedEntry.id}/notify`,
      headers,
    });
    assert.equal(secondNotify.statusCode, 409);

    const addCancelled = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/waitlist-entries`,
      headers,
      payload: { partySize: 4 },
    });
    assert.equal(addCancelled.statusCode, 201);
    const cancelledEntry = addCancelled.json().data;

    const cancel = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${cancelledEntry.id}/cancel`,
      headers,
      payload: { reason: "guest left" },
    });
    assert.equal(cancel.statusCode, 200);

    const expireCancelled = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${cancelledEntry.id}/expire`,
      headers,
    });
    assert.equal(expireCancelled.statusCode, 409);

    const addExpired = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/waitlist-entries`,
      headers,
      payload: { partySize: 5 },
    });
    assert.equal(addExpired.statusCode, 201);
    const expiredEntry = addExpired.json().data;

    const expire = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${expiredEntry.id}/expire`,
      headers,
    });
    assert.equal(expire.statusCode, 200);

    const seatExpired = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${expiredEntry.id}/seat`,
      headers,
      payload: { tableIds: [randomUUID()] },
    });
    assert.equal(seatExpired.statusCode, 409);

    await app.close();
  },
);

serialTest(
  "Waitlist command routes validate seat cancel and priority-override payloads",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const add = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/waitlist-entries`,
      headers,
      payload: { partySize: 2 },
    });
    assert.equal(add.statusCode, 201);
    const entry = add.json().data;

    const invalidSeat = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${entry.id}/seat`,
      headers,
      payload: { tableIds: [] },
    });
    assert.equal(invalidSeat.statusCode, 400);

    const invalidCancel = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${entry.id}/cancel`,
      headers,
      payload: { reason: "" },
    });
    assert.equal(invalidCancel.statusCode, 400);

    const invalidPriorityOverride = await app.inject({
      method: "POST",
      url: `/v1/waitlist-entries/${entry.id}/priority-overrides`,
      headers,
      payload: { reason: "" },
    });
    assert.equal(invalidPriorityOverride.statusCode, 400);

    await app.close();
  },
);

test("Guest: create and anonymize", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);

  const create = await app.inject({
    method: "POST",
    url: "/v1/guests",
    headers: ownerHeaders(container, tenantId),
    payload: { displayName: "Jane Doe", email: "jane@example.com" },
  });
  assert.equal(create.statusCode, 201);
  const guest = create.json().data;
  assert.deepEqual(Object.keys(guest).sort(), [
    "consentGiven",
    "createdAt",
    "displayName",
    "email",
    "id",
    "revision",
    "status",
    "tenantId",
    "updatedAt",
  ]);

  const anonymize = await app.inject({
    method: "POST",
    url: `/v1/guests/${guest.id}/anonymizations`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(anonymize.statusCode, 200);
  assert.equal(anonymize.json().data.status, "ANONYMIZED");
  assert.equal(anonymize.json().data.email, undefined);
  assert.equal(anonymize.json().data.displayName, "Anonymized Guest");
  assert.equal(anonymize.json().data.consentGiven, false);
  assert.equal(anonymize.json().data.revision, 2);
  assert.equal(anonymize.json().data.createdAt, guest.createdAt);
  assert.equal(typeof anonymize.json().data.anonymizedAt, "string");
  assert.ok(!Number.isNaN(Date.parse(anonymize.json().data.anonymizedAt)));
  assert.equal(
    anonymize.json().data.updatedAt,
    anonymize.json().data.anonymizedAt,
  );
  assert.deepEqual(Object.keys(anonymize.json().data).sort(), [
    "anonymizedAt",
    "consentGiven",
    "createdAt",
    "displayName",
    "id",
    "revision",
    "status",
    "tenantId",
    "updatedAt",
  ]);
  await app.close();
});

test("Guest get/update honor pii permissions and return 404 for unknown ids", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const now = new Date();

  const create = await app.inject({
    method: "POST",
    url: "/v1/guests",
    headers: ownerHeaders(container, tenantId),
    payload: {
      displayName: "Guest Update",
      email: "guest-update@example.com",
      phone: "+541100000111",
      notes: "initial note",
    },
  });
  assert.equal(create.statusCode, 201);
  const guest = create.json().data;

  const get = await app.inject({
    method: "GET",
    url: `/v1/guests/${guest.id}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(get.statusCode, 200);
  assert.equal(get.json().data.id, guest.id);
  assert.equal(get.json().data.email, "guest-update@example.com");
  assert.equal(get.json().data.revision, 1);
  assert.deepEqual(Object.keys(get.json().data).sort(), [
    "consentGiven",
    "createdAt",
    "displayName",
    "email",
    "id",
    "notes",
    "phone",
    "revision",
    "status",
    "tenantId",
    "updatedAt",
  ]);

  const patch = await app.inject({
    method: "PATCH",
    url: `/v1/guests/${guest.id}`,
    headers: ownerHeaders(container, tenantId),
    payload: {
      displayName: "Guest Updated",
      notes: "updated note",
      consentGiven: true,
    },
  });
  assert.equal(patch.statusCode, 200);
  assert.equal(patch.json().data.displayName, "Guest Updated");
  assert.equal(patch.json().data.notes, "updated note");
  assert.equal(patch.json().data.consentGiven, true);
  assert.equal(patch.json().data.revision, 2);
  assert.equal(patch.json().data.createdAt, get.json().data.createdAt);
  assert.notEqual(patch.json().data.updatedAt, get.json().data.updatedAt);
  assert.deepEqual(Object.keys(patch.json().data).sort(), [
    "consentGiven",
    "createdAt",
    "displayName",
    "email",
    "id",
    "notes",
    "phone",
    "revision",
    "status",
    "tenantId",
    "updatedAt",
  ]);

  const manager = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-manager-guest-read",
    displayName: "Demo Manager Guest Read",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(manager);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: manager.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_manager"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const managerToken = "manager-token-guest-read";
  sessionsOf(container).registerToken(managerToken, {
    provider: "fixture",
    subject: "demo-manager-guest-read",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const managerGet = await app.inject({
    method: "GET",
    url: `/v1/guests/${guest.id}`,
    headers: {
      authorization: `Bearer ${managerToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(managerGet.statusCode, 200);

  const unknownGet = await app.inject({
    method: "GET",
    url: `/v1/guests/${randomUUID()}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(unknownGet.statusCode, 404);

  const unknownPatch = await app.inject({
    method: "PATCH",
    url: `/v1/guests/${randomUUID()}`,
    headers: ownerHeaders(container, tenantId),
    payload: { displayName: "Nobody" },
  });
  assert.equal(unknownPatch.statusCode, 404);

  await app.close();
});

test("Guest permissions distinguish pii read from anonymize authority", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const now = new Date();

  const create = await app.inject({
    method: "POST",
    url: "/v1/guests",
    headers: ownerHeaders(container, tenantId),
    payload: {
      displayName: "Guest Permissions",
      email: "guest-perms@example.com",
    },
  });
  assert.equal(create.statusCode, 201);
  const guest = create.json().data;

  const maitre = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-maitre-guest",
    displayName: "Demo Maitre Guest",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(maitre);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: maitre.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_maitre"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const maitreToken = "maitre-token-guest";
  sessionsOf(container).registerToken(maitreToken, {
    provider: "fixture",
    subject: "demo-maitre-guest",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const maitreGet = await app.inject({
    method: "GET",
    url: `/v1/guests/${guest.id}`,
    headers: {
      authorization: `Bearer ${maitreToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(maitreGet.statusCode, 200);

  const maitrePatch = await app.inject({
    method: "PATCH",
    url: `/v1/guests/${guest.id}`,
    headers: {
      authorization: `Bearer ${maitreToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { notes: "maitre can edit guest context" },
  });
  assert.equal(maitrePatch.statusCode, 200);

  const maitreAnonymizeDenied = await app.inject({
    method: "POST",
    url: `/v1/guests/${guest.id}/anonymizations`,
    headers: {
      authorization: `Bearer ${maitreToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(maitreAnonymizeDenied.statusCode, 403);

  await app.close();
});

serialTest(
  "Guest read update and anonymize hide cross-tenant guests as 404",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const create = await app.inject({
      method: "POST",
      url: "/v1/guests",
      headers: ownerHeaders(container, tenantId),
      payload: {
        displayName: "Guest Cross Tenant",
        email: "guest-cross-tenant@example.com",
      },
    });
    assert.equal(create.statusCode, 201);
    const guest = create.json().data;

    const otherTenantId = randomUUID();
    await container.tenants.save({
      id: otherTenantId,
      name: "Other Tenant Guests",
      status: "ACTIVE",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
      createdAt: now,
      updatedAt: now,
    });
    const owner = await container.users.findByExternalIdentity(
      "fixture",
      "demo-owner",
    );
    await container.memberships.save({
      id: randomUUID(),
      tenantId: otherTenantId,
      userId: owner!.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_owner"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const otherTenantHeaders = {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": otherTenantId,
    };

    const crossTenantGet = await app.inject({
      method: "GET",
      url: `/v1/guests/${guest.id}`,
      headers: otherTenantHeaders,
    });
    assert.equal(crossTenantGet.statusCode, 404);

    const crossTenantPatch = await app.inject({
      method: "PATCH",
      url: `/v1/guests/${guest.id}`,
      headers: otherTenantHeaders,
      payload: { notes: "should not update" },
    });
    assert.equal(crossTenantPatch.statusCode, 404);

    const crossTenantAnonymize = await app.inject({
      method: "POST",
      url: `/v1/guests/${guest.id}/anonymizations`,
      headers: otherTenantHeaders,
    });
    assert.equal(crossTenantAnonymize.statusCode, 404);

    await app.close();
  },
);

test("Guest lookup is exact, requires pii_read, and rejects empty input", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const now = new Date();

  const create = await app.inject({
    method: "POST",
    url: "/v1/guests",
    headers: ownerHeaders(container, tenantId),
    payload: {
      displayName: "Jane Lookup",
      email: "lookup@example.com",
      phone: "+541100000001",
    },
  });
  assert.equal(create.statusCode, 201);
  const guest = create.json().data;

  const lookupByEmail = await app.inject({
    method: "POST",
    url: "/v1/guests/lookup",
    headers: ownerHeaders(container, tenantId),
    payload: { email: "lookup@example.com" },
  });
  assert.equal(lookupByEmail.statusCode, 200);
  assert.equal(lookupByEmail.json().data.id, guest.id);
  assert.deepEqual(Object.keys(lookupByEmail.json().data).sort(), [
    "consentGiven",
    "createdAt",
    "displayName",
    "email",
    "id",
    "phone",
    "revision",
    "status",
    "tenantId",
    "updatedAt",
  ]);

  const lookupMissingInput = await app.inject({
    method: "POST",
    url: "/v1/guests/lookup",
    headers: ownerHeaders(container, tenantId),
    payload: {},
  });
  assert.equal(lookupMissingInput.statusCode, 400);

  const waiter = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-waiter-guest-lookup",
    displayName: "Demo Waiter Guest Lookup",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(waiter);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: waiter.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_waiter"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const waiterToken = "waiter-token-guest-lookup";
  sessionsOf(container).registerToken(waiterToken, {
    provider: "fixture",
    subject: "demo-waiter-guest-lookup",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const lookupDenied = await app.inject({
    method: "POST",
    url: "/v1/guests/lookup",
    headers: {
      authorization: `Bearer ${waiterToken}`,
      "x-tenant-id": tenantId,
    },
    payload: { email: "lookup@example.com" },
  });
  assert.equal(lookupDenied.statusCode, 403);
  await app.close();
});

serialTest("Guest lookup does not leak matches across tenants", async () => {
  const container = await buildContainer();
  const { tenantId } = await getContext(container);
  const app = await buildApp(container);
  const now = new Date();

  const create = await app.inject({
    method: "POST",
    url: "/v1/guests",
    headers: ownerHeaders(container, tenantId),
    payload: {
      displayName: "Lookup Cross Tenant",
      email: "lookup-cross-tenant@example.com",
      phone: "+541100000777",
    },
  });
  assert.equal(create.statusCode, 201);
  const guest = create.json().data;

  const otherTenantId = randomUUID();
  await container.tenants.save({
    id: otherTenantId,
    name: "Other Tenant Guest Lookup",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
  });
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  await container.memberships.save({
    id: randomUUID(),
    tenantId: otherTenantId,
    userId: owner!.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_owner"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const otherTenantHeaders = {
    authorization: `Bearer ${container.demoAccessToken}`,
    "x-tenant-id": otherTenantId,
  };

  const lookupByEmail = await app.inject({
    method: "POST",
    url: "/v1/guests/lookup",
    headers: otherTenantHeaders,
    payload: { email: "lookup-cross-tenant@example.com" },
  });
  assert.equal(lookupByEmail.statusCode, 200);
  assert.equal(lookupByEmail.json().data, null);

  const lookupByPhone = await app.inject({
    method: "POST",
    url: "/v1/guests/lookup",
    headers: otherTenantHeaders,
    payload: { phone: "+541100000777" },
  });
  assert.equal(lookupByPhone.statusCode, 200);
  assert.equal(lookupByPhone.json().data, null);

  const sameTenantLookup = await app.inject({
    method: "POST",
    url: "/v1/guests/lookup",
    headers: ownerHeaders(container, tenantId),
    payload: { email: "lookup-cross-tenant@example.com" },
  });
  assert.equal(sameTenantLookup.statusCode, 200);
  assert.equal(sameTenantLookup.json().data.id, guest.id);

  await app.close();
});

serialTest("Availability GET returns free tables", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const branch = await container.branches.findById(tenantId, branchId);
  const requestedStartAt = "2026-08-01T20:00:00Z";
  const normalizedRequestedStartAt = new Date(requestedStartAt).toISOString();
  const requestedDurationMinutes = 60;

  const availability = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/availability?partySize=2&startAt=${requestedStartAt}&durationMinutes=${requestedDurationMinutes}`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(availability.statusCode, 200);
  const data = availability.json().data;
  assert.equal(data.available, true);
  assert.ok(data.freeTableIds.length > 0);
  assert.equal(data.timezone, branch!.timezone);
  assert.equal(data.freshness, "LIVE");
  assert.equal(data.startAt, normalizedRequestedStartAt);
  assert.equal(data.durationMinutes, requestedDurationMinutes);
  assert.equal(typeof data.asOf, "string");
  assert.ok(!Number.isNaN(Date.parse(data.asOf)));
  assert.deepEqual(Object.keys(data).sort(), [
    "asOf",
    "available",
    "durationMinutes",
    "freeTableIds",
    "freshness",
    "startAt",
    "timezone",
  ]);

  const unavailable = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/availability?partySize=7&startAt=2026-08-01T21:00:00Z&durationMinutes=60`,
    headers: ownerHeaders(container, tenantId),
  });
  assert.equal(unavailable.statusCode, 200);
  assert.equal(unavailable.json().data.available, false);
  assert.deepEqual(unavailable.json().data.freeTableIds, []);
  assert.equal(unavailable.json().data.timezone, branch!.timezone);
  assert.equal(unavailable.json().data.freshness, "LIVE");
  assert.equal(
    unavailable.json().data.startAt,
    new Date("2026-08-01T21:00:00Z").toISOString(),
  );
  assert.equal(unavailable.json().data.durationMinutes, 60);
  assert.equal(typeof unavailable.json().data.asOf, "string");
  assert.ok(!Number.isNaN(Date.parse(unavailable.json().data.asOf)));
  assert.deepEqual(Object.keys(unavailable.json().data).sort(), [
    "asOf",
    "available",
    "durationMinutes",
    "freeTableIds",
    "freshness",
    "startAt",
    "timezone",
  ]);

  await app.close();
});

serialTest(
  "Availability ignores pending reservations but blocks confirmed reservations and active occupancies",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const pendingReservation = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
      payload: {
        partySize: 2,
        startAt: "2026-08-05T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(pendingReservation.statusCode, 201);

    const pendingAvailability = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/availability?partySize=2&startAt=2026-08-05T20:00:00Z&durationMinutes=60`,
      headers,
    });
    assert.equal(pendingAvailability.statusCode, 200);
    assert.equal(pendingAvailability.json().data.available, true);
    const freeTableIds = pendingAvailability.json().data
      .freeTableIds as string[];
    assert.ok(freeTableIds.length > 0);

    const confirmPending = await app.inject({
      method: "POST",
      url: `/v1/reservations/${pendingReservation.json().data.id}/confirm`,
      headers,
    });
    assert.equal(confirmPending.statusCode, 200);

    const confirmedAvailability = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/availability?partySize=2&startAt=2026-08-05T20:00:00Z&durationMinutes=60`,
      headers,
    });
    assert.equal(confirmedAvailability.statusCode, 200);
    const confirmedFreeTableIds = confirmedAvailability.json().data
      .freeTableIds as string[];
    assert.ok(confirmedFreeTableIds.length < freeTableIds.length);

    const occupiedTableId = confirmedFreeTableIds[0]!;
    const occupiedVisit = await app.inject({
      method: "POST",
      url: "/v1/visits",
      headers,
      payload: { branchId, tableIds: [occupiedTableId], guestCount: 2 },
    });
    assert.equal(occupiedVisit.statusCode, 201);

    const occupancyAvailability = await app.inject({
      method: "GET",
      url: `/v1/branches/${branchId}/availability?partySize=2&startAt=2026-08-05T20:00:00Z&durationMinutes=60`,
      headers,
    });
    assert.equal(occupancyAvailability.statusCode, 200);
    const occupancyFreeTableIds = occupancyAvailability.json().data
      .freeTableIds as string[];
    assert.ok(!occupancyFreeTableIds.includes(occupiedTableId));

    await app.close();
  },
);

serialTest(
  "Availability validates query parameters and returns 404 for unknown branches",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const invalidQuery = await app.inject({
      method: "GET",
      url: "/v1/branches/00000000-0000-0000-0000-000000000003/availability?partySize=0&startAt=invalid&durationMinutes=-1",
      headers,
    });
    assert.equal(invalidQuery.statusCode, 400);

    const unknownBranch = await app.inject({
      method: "GET",
      url: `/v1/branches/${randomUUID()}/availability?partySize=2&startAt=2026-08-05T20:00:00Z&durationMinutes=60`,
      headers,
    });
    assert.equal(unknownBranch.statusCode, 404);

    await app.close();
  },
);

serialTest("Availability hides cross-tenant branches as 404", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const now = new Date();

  const otherTenantId = randomUUID();
  await container.tenants.save({
    id: otherTenantId,
    name: "Other Tenant Availability",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
  });
  const owner = await container.users.findByExternalIdentity(
    "fixture",
    "demo-owner",
  );
  await container.memberships.save({
    id: randomUUID(),
    tenantId: otherTenantId,
    userId: owner!.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_owner"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  const crossTenant = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/availability?partySize=2&startAt=2026-08-05T20:00:00Z&durationMinutes=60`,
    headers: {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": otherTenantId,
    },
  });
  assert.equal(crossTenant.statusCode, 404);

  await app.close();
});

serialTest("Availability requires reservation read permission", async () => {
  const container = await buildContainer();
  const { tenantId, branchId } = await getContext(container);
  const app = await buildApp(container);
  const now = new Date();

  const employee = {
    id: randomUUID(),
    identityProvider: "fixture",
    externalIdentityId: "demo-employee-availability",
    displayName: "Demo Employee Availability",
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  await container.users.save(employee);
  await container.memberships.save({
    id: randomUUID(),
    tenantId,
    userId: employee.id,
    status: "ACTIVE",
    branchScopeType: "ALL_BRANCHES",
    roleIds: ["role_employee"],
    branchIds: [],
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  const employeeToken = "employee-token-availability";
  sessionsOf(container).registerToken(employeeToken, {
    provider: "fixture",
    subject: "demo-employee-availability",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  });

  const response = await app.inject({
    method: "GET",
    url: `/v1/branches/${branchId}/availability?partySize=2&startAt=2026-08-05T20:00:00Z&durationMinutes=60`,
    headers: {
      authorization: `Bearer ${employeeToken}`,
      "x-tenant-id": tenantId,
    },
  });
  assert.equal(response.statusCode, 403);

  await app.close();
});

serialTest(
  "Reservation notifications create and fetch notification intents",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const outboxBefore = outboxOf(container).all().length;

    const createReservation = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers: ownerHeaders(container, tenantId),
      payload: {
        partySize: 2,
        startAt: "2026-08-03T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(createReservation.statusCode, 201);
    const reservation = createReservation.json().data;

    const createIntent = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/notification-intents/request-confirmation`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(createIntent.statusCode, 201);
    assert.deepEqual(Object.keys(createIntent.json()).sort(), ["data"]);
    const intent = createIntent.json().data;
    assert.equal(intent.reservationId, reservation.id);
    assert.equal(intent.purpose, "REQUEST_CONFIRMATION");
    assert.equal(intent.status, "CREATED");
    assert.equal("tenantId" in intent, false);
    assert.equal(typeof intent.createdAt, "string");
    assert.ok(!Number.isNaN(Date.parse(intent.createdAt)));
    assert.deepEqual(Object.keys(intent).sort(), [
      "createdAt",
      "id",
      "purpose",
      "reservationId",
      "status",
    ]);
    const outboxAfterCreate = outboxOf(container).all();
    assert.equal(outboxAfterCreate.length, outboxBefore + 2);
    assert.equal(
      outboxAfterCreate.at(-1)!.eventName,
      "reservations.notification-intent.request-confirmation.v1",
    );
    assert.deepEqual(outboxAfterCreate.at(-1)!.payload, {
      notificationIntentId: intent.id,
      reservationId: reservation.id,
      purpose: "REQUEST_CONFIRMATION",
    });

    const getIntent = await app.inject({
      method: "GET",
      url: `/v1/notification-intents/${intent.id}`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(getIntent.statusCode, 200);
    assert.deepEqual(Object.keys(getIntent.json()).sort(), ["data"]);
    assert.equal(getIntent.json().data.id, intent.id);
    assert.equal(getIntent.json().data.purpose, "REQUEST_CONFIRMATION");
    assert.equal("tenantId" in getIntent.json().data, false);
    assert.equal(getIntent.json().data.createdAt, intent.createdAt);
    assert.deepEqual(Object.keys(getIntent.json().data).sort(), [
      "createdAt",
      "id",
      "purpose",
      "reservationId",
      "status",
    ]);

    const reminderIntent = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/notification-intents/send-reminder`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(reminderIntent.statusCode, 201);
    assert.deepEqual(Object.keys(reminderIntent.json()).sort(), ["data"]);
    assert.equal(reminderIntent.json().data.purpose, "SEND_REMINDER");
    assert.equal("tenantId" in reminderIntent.json().data, false);
    assert.equal(typeof reminderIntent.json().data.createdAt, "string");
    assert.ok(!Number.isNaN(Date.parse(reminderIntent.json().data.createdAt)));
    assert.deepEqual(Object.keys(reminderIntent.json().data).sort(), [
      "createdAt",
      "id",
      "purpose",
      "reservationId",
      "status",
    ]);
    const outboxAfterReminder = outboxOf(container).all();
    assert.equal(outboxAfterReminder.length, outboxBefore + 3);
    assert.equal(
      outboxAfterReminder.at(-1)!.eventName,
      "reservations.notification-intent.send-reminder.v1",
    );
    assert.deepEqual(outboxAfterReminder.at(-1)!.payload, {
      notificationIntentId: reminderIntent.json().data.id,
      reservationId: reservation.id,
      purpose: "SEND_REMINDER",
    });
    const getReminderIntent = await app.inject({
      method: "GET",
      url: `/v1/notification-intents/${reminderIntent.json().data.id}`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(getReminderIntent.statusCode, 200);
    assert.deepEqual(Object.keys(getReminderIntent.json()).sort(), ["data"]);
    assert.equal(
      getReminderIntent.json().data.id,
      reminderIntent.json().data.id,
    );
    assert.equal(getReminderIntent.json().data.purpose, "SEND_REMINDER");
    assert.equal(
      getReminderIntent.json().data.createdAt,
      reminderIntent.json().data.createdAt,
    );
    assert.deepEqual(Object.keys(getReminderIntent.json().data).sort(), [
      "createdAt",
      "id",
      "purpose",
      "reservationId",
      "status",
    ]);

    const cancellationIntent = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/notification-intents/communicate-cancellation`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(cancellationIntent.statusCode, 201);
    assert.deepEqual(Object.keys(cancellationIntent.json()).sort(), ["data"]);
    assert.equal(
      cancellationIntent.json().data.purpose,
      "COMMUNICATE_CANCELLATION",
    );
    assert.equal("tenantId" in cancellationIntent.json().data, false);
    assert.equal(typeof cancellationIntent.json().data.createdAt, "string");
    assert.ok(
      !Number.isNaN(Date.parse(cancellationIntent.json().data.createdAt)),
    );
    assert.deepEqual(Object.keys(cancellationIntent.json().data).sort(), [
      "createdAt",
      "id",
      "purpose",
      "reservationId",
      "status",
    ]);
    const outboxAfterCancellation = outboxOf(container).all();
    assert.equal(outboxAfterCancellation.length, outboxBefore + 4);
    assert.equal(
      outboxAfterCancellation.at(-1)!.eventName,
      "reservations.notification-intent.communicate-cancellation.v1",
    );
    assert.deepEqual(outboxAfterCancellation.at(-1)!.payload, {
      notificationIntentId: cancellationIntent.json().data.id,
      reservationId: reservation.id,
      purpose: "COMMUNICATE_CANCELLATION",
    });
    const getCancellationIntent = await app.inject({
      method: "GET",
      url: `/v1/notification-intents/${cancellationIntent.json().data.id}`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(getCancellationIntent.statusCode, 200);
    assert.deepEqual(Object.keys(getCancellationIntent.json()).sort(), [
      "data",
    ]);
    assert.equal(
      getCancellationIntent.json().data.id,
      cancellationIntent.json().data.id,
    );
    assert.equal(
      getCancellationIntent.json().data.purpose,
      "COMMUNICATE_CANCELLATION",
    );
    assert.equal(
      getCancellationIntent.json().data.createdAt,
      cancellationIntent.json().data.createdAt,
    );
    assert.deepEqual(Object.keys(getCancellationIntent.json().data).sort(), [
      "createdAt",
      "id",
      "purpose",
      "reservationId",
      "status",
    ]);

    const reservationDetail = await app.inject({
      method: "GET",
      url: `/v1/reservations/${reservation.id}`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(reservationDetail.statusCode, 200);
    assert.equal(reservationDetail.json().data.id, reservation.id);
    assert.equal(reservationDetail.json().data.status, "PENDING");
    assert.equal("visitId" in reservationDetail.json().data, false);

    await app.close();
  },
);

serialTest(
  "Reservation notifications require notification permission and reservation existence",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const waiter = {
      id: randomUUID(),
      identityProvider: "fixture",
      externalIdentityId: "demo-waiter-notification",
      displayName: "Demo Waiter Notification",
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    await container.users.save(waiter);
    await container.memberships.save({
      id: randomUUID(),
      tenantId,
      userId: waiter.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_waiter"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const waiterToken = "waiter-token-notification";
    sessionsOf(container).registerToken(waiterToken, {
      provider: "fixture",
      subject: "demo-waiter-notification",
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });

    const forbidden = await app.inject({
      method: "POST",
      url: `/v1/reservations/${randomUUID()}/notification-intents/request-confirmation`,
      headers: {
        authorization: `Bearer ${waiterToken}`,
        "x-tenant-id": tenantId,
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
      method: "POST",
      url: `/v1/reservations/${randomUUID()}/notification-intents/request-confirmation`,
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
    assert.equal(notFound.json().detail, "Reservation not found");
    assert.equal(notFound.json().status, 404);
    await app.close();
  },
);

serialTest(
  "Notification intent detail requires notification permission and hides cross-tenant intents as 404",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const createReservation = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers: ownerHeaders(container, tenantId),
      payload: {
        partySize: 2,
        startAt: "2026-08-07T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(createReservation.statusCode, 201);
    const reservation = createReservation.json().data;

    const createIntent = await app.inject({
      method: "POST",
      url: `/v1/reservations/${reservation.id}/notification-intents/request-confirmation`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(createIntent.statusCode, 201);
    const intent = createIntent.json().data;

    const waiter = {
      id: randomUUID(),
      identityProvider: "fixture",
      externalIdentityId: "demo-waiter-notification-detail",
      displayName: "Demo Waiter Notification Detail",
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    await container.users.save(waiter);
    await container.memberships.save({
      id: randomUUID(),
      tenantId,
      userId: waiter.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_waiter"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const waiterToken = "waiter-token-notification-detail";
    sessionsOf(container).registerToken(waiterToken, {
      provider: "fixture",
      subject: "demo-waiter-notification-detail",
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });

    const forbidden = await app.inject({
      method: "GET",
      url: `/v1/notification-intents/${intent.id}`,
      headers: {
        authorization: `Bearer ${waiterToken}`,
        "x-tenant-id": tenantId,
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

    const otherTenantId = randomUUID();
    await container.tenants.save({
      id: otherTenantId,
      name: "Other Tenant Notification Intents",
      status: "ACTIVE",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
      createdAt: now,
      updatedAt: now,
    });
    const owner = await container.users.findByExternalIdentity(
      "fixture",
      "demo-owner",
    );
    await container.memberships.save({
      id: randomUUID(),
      tenantId: otherTenantId,
      userId: owner!.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_owner"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const crossTenant = await app.inject({
      method: "GET",
      url: `/v1/notification-intents/${intent.id}`,
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": otherTenantId,
      },
    });
    assert.equal(crossTenant.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(crossTenant.json() as Record<string, unknown>)),
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
      crossTenant.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(crossTenant.json().detail, "NotificationIntent not found");
    assert.equal(crossTenant.json().status, 404);

    await app.close();
  },
);

serialTest(
  "Notification intent creation hides cross-tenant reservations as 404 for every intent endpoint",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);
    const now = new Date();

    const createReservation = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
      payload: {
        partySize: 2,
        startAt: "2026-08-08T20:00:00Z",
        durationMinutes: 60,
      },
    });
    assert.equal(createReservation.statusCode, 201);
    const reservation = createReservation.json().data;

    const otherTenantId = randomUUID();
    await container.tenants.save({
      id: otherTenantId,
      name: "Other Tenant Notification Intent Create",
      status: "ACTIVE",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
      createdAt: now,
      updatedAt: now,
    });
    const owner = await container.users.findByExternalIdentity(
      "fixture",
      "demo-owner",
    );
    await container.memberships.save({
      id: randomUUID(),
      tenantId: otherTenantId,
      userId: owner!.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_owner"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const crossTenantHeaders = {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": otherTenantId,
    };

    for (const path of [
      "request-confirmation",
      "send-reminder",
      "communicate-cancellation",
    ] as const) {
      const response = await app.inject({
        method: "POST",
        url: `/v1/reservations/${reservation.id}/notification-intents/${path}`,
        headers: crossTenantHeaders,
      });
      assert.equal(response.statusCode, 404);
      assert.deepEqual(
        new Set(Object.keys(response.json() as Record<string, unknown>)),
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
        response.json().type,
        "https://docs.maitre.app/problems/not-found",
      );
      assert.equal(response.json().detail, "Reservation not found");
      assert.equal(response.json().status, 404);
    }

    await app.close();
  },
);

serialTest(
  "Notification intent detail returns 404 for unknown ids",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const app = await buildApp(container);

    const response = await app.inject({
      method: "GET",
      url: `/v1/notification-intents/${randomUUID()}`,
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(response.statusCode, 404);
    assert.deepEqual(
      new Set(Object.keys(response.json() as Record<string, unknown>)),
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
      response.json().type,
      "https://docs.maitre.app/problems/not-found",
    );
    assert.equal(response.json().detail, "NotificationIntent not found");
    assert.equal(response.json().status, 404);

    await app.close();
  },
);

serialTest(
  "Reservation preferences: create and list guest/reservation scoped preferences",
  async () => {
    const container = await buildContainer();
    const { tenantId, branchId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const reservationCreate = await app.inject({
      method: "POST",
      url: `/v1/branches/${branchId}/reservations`,
      headers,
      payload: {
        partySize: 2,
        startAt: "2026-08-04T20:00:00Z",
        durationMinutes: 90,
      },
    });
    assert.equal(reservationCreate.statusCode, 201);
    const reservation = reservationCreate.json().data;

    const guestPreference = await app.inject({
      method: "POST",
      url: "/v1/reservation-preferences",
      headers,
      payload: {
        subjectType: "GUEST",
        subjectId: "guest-1",
        code: "SEATING_ZONE",
        value: "PATIO",
        kind: "PREFERENCE",
        notes: "quiet area if possible",
      },
    });
    assert.equal(guestPreference.statusCode, 201);
    assert.equal(guestPreference.json().data.subjectType, "GUEST");
    assert.equal(guestPreference.json().data.kind, "PREFERENCE");
    assert.equal(guestPreference.json().data.value, "PATIO");
    assert.equal(guestPreference.json().data.notes, "quiet area if possible");
    assert.equal(typeof guestPreference.json().data.createdAt, "string");
    assert.ok(!Number.isNaN(Date.parse(guestPreference.json().data.createdAt)));
    assert.equal(typeof guestPreference.json().data.updatedAt, "string");
    assert.ok(!Number.isNaN(Date.parse(guestPreference.json().data.updatedAt)));
    assert.equal(guestPreference.json().data.revision, 1);
    assert.deepEqual(Object.keys(guestPreference.json().data).sort(), [
      "code",
      "createdAt",
      "id",
      "kind",
      "notes",
      "revision",
      "subjectId",
      "subjectType",
      "tenantId",
      "updatedAt",
      "value",
    ]);

    const reservationRequirement = await app.inject({
      method: "POST",
      url: "/v1/reservation-preferences",
      headers,
      payload: {
        subjectType: "RESERVATION",
        subjectId: reservation.id,
        code: "ACCESSIBILITY",
        value: "WHEELCHAIR_ACCESS",
        kind: "REQUIREMENT",
      },
    });
    assert.equal(reservationRequirement.statusCode, 201);
    assert.equal(reservationRequirement.json().data.subjectType, "RESERVATION");
    assert.equal(reservationRequirement.json().data.kind, "REQUIREMENT");
    assert.equal(reservationRequirement.json().data.value, "WHEELCHAIR_ACCESS");
    assert.equal("notes" in reservationRequirement.json().data, false);
    assert.equal(typeof reservationRequirement.json().data.createdAt, "string");
    assert.ok(
      !Number.isNaN(Date.parse(reservationRequirement.json().data.createdAt)),
    );
    assert.equal(typeof reservationRequirement.json().data.updatedAt, "string");
    assert.ok(
      !Number.isNaN(Date.parse(reservationRequirement.json().data.updatedAt)),
    );
    assert.equal(reservationRequirement.json().data.revision, 1);
    assert.deepEqual(Object.keys(reservationRequirement.json().data).sort(), [
      "code",
      "createdAt",
      "id",
      "kind",
      "revision",
      "subjectId",
      "subjectType",
      "tenantId",
      "updatedAt",
      "value",
    ]);

    const guestRequirementWithoutValue = await app.inject({
      method: "POST",
      url: "/v1/reservation-preferences",
      headers,
      payload: {
        subjectType: "GUEST",
        subjectId: "guest-2",
        code: "HIGH_CHAIR",
        kind: "REQUIREMENT",
      },
    });
    assert.equal(guestRequirementWithoutValue.statusCode, 201);
    assert.equal(guestRequirementWithoutValue.json().data.subjectType, "GUEST");
    assert.equal(guestRequirementWithoutValue.json().data.kind, "REQUIREMENT");
    assert.equal("value" in guestRequirementWithoutValue.json().data, false);
    assert.equal("notes" in guestRequirementWithoutValue.json().data, false);
    assert.equal(
      typeof guestRequirementWithoutValue.json().data.createdAt,
      "string",
    );
    assert.ok(
      !Number.isNaN(
        Date.parse(guestRequirementWithoutValue.json().data.createdAt),
      ),
    );
    assert.equal(
      typeof guestRequirementWithoutValue.json().data.updatedAt,
      "string",
    );
    assert.ok(
      !Number.isNaN(
        Date.parse(guestRequirementWithoutValue.json().data.updatedAt),
      ),
    );
    assert.equal(guestRequirementWithoutValue.json().data.revision, 1);
    assert.deepEqual(
      Object.keys(guestRequirementWithoutValue.json().data).sort(),
      [
        "code",
        "createdAt",
        "id",
        "kind",
        "revision",
        "subjectId",
        "subjectType",
        "tenantId",
        "updatedAt",
      ],
    );

    const guestList = await app.inject({
      method: "GET",
      url: "/v1/reservation-preferences?subjectType=GUEST&subjectId=guest-1",
      headers,
    });
    assert.equal(guestList.statusCode, 200);
    assert.equal(guestList.json().data.length, 1);
    assert.equal(guestList.json().data[0].code, "SEATING_ZONE");
    assert.equal(guestList.json().data[0].notes, "quiet area if possible");
    assert.equal(guestList.json().data[0].id, guestPreference.json().data.id);
    assert.equal(
      guestList.json().data[0].createdAt,
      guestPreference.json().data.createdAt,
    );
    assert.equal(
      guestList.json().data[0].updatedAt,
      guestPreference.json().data.updatedAt,
    );
    assert.equal(guestList.json().data[0].revision, 1);
    assert.deepEqual(Object.keys(guestList.json().data[0]).sort(), [
      "code",
      "createdAt",
      "id",
      "kind",
      "notes",
      "revision",
      "subjectId",
      "subjectType",
      "tenantId",
      "updatedAt",
      "value",
    ]);

    const secondGuestList = await app.inject({
      method: "GET",
      url: "/v1/reservation-preferences?subjectType=GUEST&subjectId=guest-2",
      headers,
    });
    assert.equal(secondGuestList.statusCode, 200);
    assert.equal(secondGuestList.json().data.length, 1);
    assert.equal(secondGuestList.json().data[0].code, "HIGH_CHAIR");
    assert.equal("value" in secondGuestList.json().data[0], false);
    assert.equal("notes" in secondGuestList.json().data[0], false);
    assert.equal(
      secondGuestList.json().data[0].id,
      guestRequirementWithoutValue.json().data.id,
    );
    assert.equal(
      secondGuestList.json().data[0].createdAt,
      guestRequirementWithoutValue.json().data.createdAt,
    );
    assert.equal(
      secondGuestList.json().data[0].updatedAt,
      guestRequirementWithoutValue.json().data.updatedAt,
    );
    assert.equal(secondGuestList.json().data[0].revision, 1);
    assert.deepEqual(Object.keys(secondGuestList.json().data[0]).sort(), [
      "code",
      "createdAt",
      "id",
      "kind",
      "revision",
      "subjectId",
      "subjectType",
      "tenantId",
      "updatedAt",
    ]);

    const reservationList = await app.inject({
      method: "GET",
      url: `/v1/reservation-preferences?subjectType=RESERVATION&subjectId=${reservation.id}`,
      headers,
    });
    assert.equal(reservationList.statusCode, 200);
    assert.equal(reservationList.json().data.length, 1);
    assert.equal(reservationList.json().data[0].code, "ACCESSIBILITY");
    assert.equal("notes" in reservationList.json().data[0], false);
    assert.equal(
      reservationList.json().data[0].id,
      reservationRequirement.json().data.id,
    );
    assert.equal(
      reservationList.json().data[0].createdAt,
      reservationRequirement.json().data.createdAt,
    );
    assert.equal(
      reservationList.json().data[0].updatedAt,
      reservationRequirement.json().data.updatedAt,
    );
    assert.equal(reservationList.json().data[0].revision, 1);
    assert.deepEqual(Object.keys(reservationList.json().data[0]).sort(), [
      "code",
      "createdAt",
      "id",
      "kind",
      "revision",
      "subjectId",
      "subjectType",
      "tenantId",
      "updatedAt",
      "value",
    ]);

    await app.close();
  },
);

serialTest(
  "Reservation preferences enforce create/read permissions and query validation",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const waiter = {
      id: randomUUID(),
      identityProvider: "fixture",
      externalIdentityId: "demo-waiter-reservation-preferences",
      displayName: "Demo Waiter Reservation Preferences",
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    await container.users.save(waiter);
    await container.memberships.save({
      id: randomUUID(),
      tenantId,
      userId: waiter.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_waiter"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const waiterToken = "waiter-token-reservation-preferences";
    sessionsOf(container).registerToken(waiterToken, {
      provider: "fixture",
      subject: "demo-waiter-reservation-preferences",
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });
    const waiterHeaders = {
      authorization: `Bearer ${waiterToken}`,
      "x-tenant-id": tenantId,
    };

    const createForbidden = await app.inject({
      method: "POST",
      url: "/v1/reservation-preferences",
      headers: waiterHeaders,
      payload: {
        subjectType: "GUEST",
        subjectId: "guest-403",
        code: "SEATING_ZONE",
        value: "PATIO",
        kind: "PREFERENCE",
      },
    });
    assert.equal(createForbidden.statusCode, 403);
    assert.deepEqual(
      new Set(Object.keys(createForbidden.json() as Record<string, unknown>)),
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
      createForbidden.json().type,
      "https://docs.maitre.app/problems/insufficient-scope",
    );
    assert.equal(createForbidden.json().detail, "Insufficient scope");
    assert.equal(createForbidden.json().status, 403);

    const listAllowed = await app.inject({
      method: "GET",
      url: "/v1/reservation-preferences?subjectType=GUEST&subjectId=guest-403",
      headers: waiterHeaders,
    });
    assert.equal(listAllowed.statusCode, 200);
    assert.deepEqual(Object.keys(listAllowed.json()).sort(), ["data"]);
    assert.deepEqual(listAllowed.json().data, []);

    const invalidQuery = await app.inject({
      method: "GET",
      url: "/v1/reservation-preferences?subjectType=GUEST&subjectId=",
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(invalidQuery.statusCode, 400);
    assert.deepEqual(
      new Set(Object.keys(invalidQuery.json() as Record<string, unknown>)),
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
      invalidQuery.json().type,
      "https://docs.maitre.app/problems/bad-request",
    );
    assert.equal(invalidQuery.json().status, 400);
    assert.match(String(invalidQuery.json().detail), /subjectId/i);

    const invalidBody = await app.inject({
      method: "POST",
      url: "/v1/reservation-preferences",
      headers: ownerHeaders(container, tenantId),
      payload: {
        subjectType: "GUEST",
        subjectId: "guest-400",
        code: "SEATING_ZONE",
        kind: "NOT_A_KIND",
      },
    });
    assert.equal(invalidBody.statusCode, 400);
    assert.deepEqual(
      new Set(Object.keys(invalidBody.json() as Record<string, unknown>)),
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
      invalidBody.json().type,
      "https://docs.maitre.app/problems/bad-request",
    );
    assert.equal(invalidBody.json().status, 400);
    assert.match(String(invalidBody.json().detail), /kind/i);

    await app.close();
  },
);

serialTest(
  "Reservation preferences list returns empty across tenants for the same subject",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const create = await app.inject({
      method: "POST",
      url: "/v1/reservation-preferences",
      headers: ownerHeaders(container, tenantId),
      payload: {
        subjectType: "GUEST",
        subjectId: "shared-guest-id",
        code: "SEATING_ZONE",
        value: "PATIO",
        kind: "PREFERENCE",
      },
    });
    assert.equal(create.statusCode, 201);
    assert.deepEqual(Object.keys(create.json()).sort(), ["data"]);
    assert.deepEqual(Object.keys(create.json().data).sort(), [
      "code",
      "createdAt",
      "id",
      "kind",
      "revision",
      "subjectId",
      "subjectType",
      "tenantId",
      "updatedAt",
      "value",
    ]);

    const otherTenantId = randomUUID();
    await container.tenants.save({
      id: otherTenantId,
      name: "Other Tenant Reservation Preferences",
      status: "ACTIVE",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
      createdAt: now,
      updatedAt: now,
    });
    const owner = await container.users.findByExternalIdentity(
      "fixture",
      "demo-owner",
    );
    await container.memberships.save({
      id: randomUUID(),
      tenantId: otherTenantId,
      userId: owner!.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_owner"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const crossTenantList = await app.inject({
      method: "GET",
      url: "/v1/reservation-preferences?subjectType=GUEST&subjectId=shared-guest-id",
      headers: {
        authorization: `Bearer ${container.demoAccessToken}`,
        "x-tenant-id": otherTenantId,
      },
    });
    assert.equal(crossTenantList.statusCode, 200);
    assert.deepEqual(Object.keys(crossTenantList.json()).sort(), ["data"]);
    assert.deepEqual(crossTenantList.json().data, []);

    await app.close();
  },
);

serialTest(
  "Cancellation policy: upsert, get current and evaluate",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const app = await buildApp(container);
    const headers = ownerHeaders(container, tenantId);

    const none = await app.inject({
      method: "GET",
      url: "/v1/cancellation-policies/current",
      headers,
    });
    assert.equal(none.statusCode, 200);
    assert.equal(none.json().data, null);
    assert.deepEqual(Object.keys(none.json()).sort(), ["data"]);

    const evaluateWithoutPolicy = await app.inject({
      method: "GET",
      url: "/v1/cancellation-policies/evaluate?startAt=2026-08-10T20:00:00Z&asOf=2026-08-09T19:00:00Z",
      headers,
    });
    assert.equal(evaluateWithoutPolicy.statusCode, 200);
    assert.equal(evaluateWithoutPolicy.json().data.allowed, true);
    assert.equal(
      evaluateWithoutPolicy.json().data.withinFreeCancellationWindow,
      true,
    );
    assert.equal(evaluateWithoutPolicy.json().data.reason, "NO_POLICY");
    assert.deepEqual(Object.keys(evaluateWithoutPolicy.json().data).sort(), [
      "allowed",
      "reason",
      "withinFreeCancellationWindow",
    ]);

    const create = await app.inject({
      method: "POST",
      url: "/v1/cancellation-policies",
      headers,
      payload: {
        name: "Standard",
        hoursBeforeStartCutoff: 24,
        feeDescription: "50% fee after cutoff",
      },
    });
    assert.equal(create.statusCode, 200);
    assert.equal(create.json().data.revision, 1);
    assert.equal(create.json().data.name, "Standard");
    assert.equal(typeof create.json().data.createdAt, "string");
    assert.ok(!Number.isNaN(Date.parse(create.json().data.createdAt)));
    assert.equal(typeof create.json().data.updatedAt, "string");
    assert.ok(!Number.isNaN(Date.parse(create.json().data.updatedAt)));
    assert.deepEqual(Object.keys(create.json().data).sort(), [
      "createdAt",
      "feeDescription",
      "hoursBeforeStartCutoff",
      "id",
      "name",
      "revision",
      "tenantId",
      "updatedAt",
    ]);

    const current = await app.inject({
      method: "GET",
      url: "/v1/cancellation-policies/current",
      headers,
    });
    assert.equal(current.statusCode, 200);
    assert.equal(current.json().data.hoursBeforeStartCutoff, 24);
    assert.equal(current.json().data.id, create.json().data.id);
    assert.equal(current.json().data.createdAt, create.json().data.createdAt);
    assert.equal(current.json().data.updatedAt, create.json().data.updatedAt);
    assert.deepEqual(Object.keys(current.json().data).sort(), [
      "createdAt",
      "feeDescription",
      "hoursBeforeStartCutoff",
      "id",
      "name",
      "revision",
      "tenantId",
      "updatedAt",
    ]);

    const update = await app.inject({
      method: "POST",
      url: "/v1/cancellation-policies",
      headers,
      payload: {
        name: "Updated",
        hoursBeforeStartCutoff: 12,
      },
    });
    assert.equal(update.statusCode, 200);
    assert.equal(update.json().data.revision, 2);
    assert.equal(update.json().data.name, "Updated");
    assert.equal("feeDescription" in update.json().data, false);
    assert.equal(update.json().data.id, create.json().data.id);
    assert.equal(update.json().data.createdAt, create.json().data.createdAt);
    assert.equal(typeof update.json().data.updatedAt, "string");
    assert.ok(!Number.isNaN(Date.parse(update.json().data.updatedAt)));

    const updatedCurrent = await app.inject({
      method: "GET",
      url: "/v1/cancellation-policies/current",
      headers,
    });
    assert.equal(updatedCurrent.statusCode, 200);
    assert.equal(updatedCurrent.json().data.name, "Updated");
    assert.equal(updatedCurrent.json().data.hoursBeforeStartCutoff, 12);
    assert.equal("feeDescription" in updatedCurrent.json().data, false);
    assert.equal(updatedCurrent.json().data.id, create.json().data.id);
    assert.equal(
      updatedCurrent.json().data.createdAt,
      create.json().data.createdAt,
    );
    assert.equal(
      updatedCurrent.json().data.updatedAt,
      update.json().data.updatedAt,
    );
    assert.deepEqual(Object.keys(updatedCurrent.json().data).sort(), [
      "createdAt",
      "hoursBeforeStartCutoff",
      "id",
      "name",
      "revision",
      "tenantId",
      "updatedAt",
    ]);

    const withinWindow = await app.inject({
      method: "GET",
      url: "/v1/cancellation-policies/evaluate?startAt=2026-08-10T20:00:00Z&asOf=2026-08-09T19:00:00Z",
      headers,
    });
    assert.equal(withinWindow.statusCode, 200);
    assert.equal(withinWindow.json().data.allowed, true);
    assert.equal(withinWindow.json().data.withinFreeCancellationWindow, true);
    assert.equal(withinWindow.json().data.reason, "WITHIN_WINDOW");
    assert.deepEqual(Object.keys(withinWindow.json().data).sort(), [
      "allowed",
      "reason",
      "withinFreeCancellationWindow",
    ]);

    const pastCutoff = await app.inject({
      method: "GET",
      url: "/v1/cancellation-policies/evaluate?startAt=2026-08-10T20:00:00Z&asOf=2026-08-10T10:00:00Z",
      headers,
    });
    assert.equal(pastCutoff.statusCode, 200);
    assert.equal(pastCutoff.json().data.allowed, true);
    assert.equal(pastCutoff.json().data.withinFreeCancellationWindow, false);
    assert.equal(pastCutoff.json().data.reason, "PAST_CUTOFF");
    assert.deepEqual(Object.keys(pastCutoff.json().data).sort(), [
      "allowed",
      "reason",
      "withinFreeCancellationWindow",
    ]);

    await app.close();
  },
);

serialTest(
  "Cancellation policy enforces create/read permissions and validates body/query",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const waiter = {
      id: randomUUID(),
      identityProvider: "fixture",
      externalIdentityId: "demo-waiter-cancellation-policy",
      displayName: "Demo Waiter Cancellation Policy",
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    await container.users.save(waiter);
    await container.memberships.save({
      id: randomUUID(),
      tenantId,
      userId: waiter.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_waiter"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const waiterToken = "waiter-token-cancellation-policy";
    sessionsOf(container).registerToken(waiterToken, {
      provider: "fixture",
      subject: "demo-waiter-cancellation-policy",
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    });
    const waiterHeaders = {
      authorization: `Bearer ${waiterToken}`,
      "x-tenant-id": tenantId,
    };

    const createForbidden = await app.inject({
      method: "POST",
      url: "/v1/cancellation-policies",
      headers: waiterHeaders,
      payload: {
        name: "Forbidden",
        hoursBeforeStartCutoff: 24,
      },
    });
    assert.equal(createForbidden.statusCode, 403);

    const currentAllowed = await app.inject({
      method: "GET",
      url: "/v1/cancellation-policies/current",
      headers: waiterHeaders,
    });
    assert.equal(currentAllowed.statusCode, 200);

    const evaluateAllowed = await app.inject({
      method: "GET",
      url: "/v1/cancellation-policies/evaluate?startAt=2026-08-10T20:00:00Z&asOf=2026-08-09T19:00:00Z",
      headers: waiterHeaders,
    });
    assert.equal(evaluateAllowed.statusCode, 200);

    const invalidBody = await app.inject({
      method: "POST",
      url: "/v1/cancellation-policies",
      headers: ownerHeaders(container, tenantId),
      payload: {
        name: "",
        hoursBeforeStartCutoff: -1,
      },
    });
    assert.equal(invalidBody.statusCode, 400);

    const invalidQuery = await app.inject({
      method: "GET",
      url: "/v1/cancellation-policies/evaluate?startAt=not-a-date",
      headers: ownerHeaders(container, tenantId),
    });
    assert.equal(invalidQuery.statusCode, 400);

    await app.close();
  },
);

serialTest(
  "Cancellation policy current and evaluate are isolated by tenant",
  async () => {
    const container = await buildContainer();
    const { tenantId } = await getContext(container);
    const app = await buildApp(container);
    const now = new Date();

    const create = await app.inject({
      method: "POST",
      url: "/v1/cancellation-policies",
      headers: ownerHeaders(container, tenantId),
      payload: {
        name: "Tenant One Policy",
        hoursBeforeStartCutoff: 24,
        feeDescription: "50% fee after cutoff",
      },
    });
    assert.equal(create.statusCode, 200);

    const otherTenantId = randomUUID();
    await container.tenants.save({
      id: otherTenantId,
      name: "Other Tenant Cancellation Policy",
      status: "ACTIVE",
      defaultLocale: "es-AR",
      defaultCurrency: "ARS",
      defaultTimezone: "America/Argentina/Buenos_Aires",
      createdAt: now,
      updatedAt: now,
    });
    const owner = await container.users.findByExternalIdentity(
      "fixture",
      "demo-owner",
    );
    await container.memberships.save({
      id: randomUUID(),
      tenantId: otherTenantId,
      userId: owner!.id,
      status: "ACTIVE",
      branchScopeType: "ALL_BRANCHES",
      roleIds: ["role_owner"],
      branchIds: [],
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const otherTenantHeaders = {
      authorization: `Bearer ${container.demoAccessToken}`,
      "x-tenant-id": otherTenantId,
    };

    const current = await app.inject({
      method: "GET",
      url: "/v1/cancellation-policies/current",
      headers: otherTenantHeaders,
    });
    assert.equal(current.statusCode, 200);
    assert.equal(current.json().data, null);
    assert.deepEqual(Object.keys(current.json()).sort(), ["data"]);

    const evaluation = await app.inject({
      method: "GET",
      url: "/v1/cancellation-policies/evaluate?startAt=2026-08-10T20:00:00Z&asOf=2026-08-10T10:00:00Z",
      headers: otherTenantHeaders,
    });
    assert.equal(evaluation.statusCode, 200);
    assert.equal(evaluation.json().data.allowed, true);
    assert.equal(evaluation.json().data.withinFreeCancellationWindow, true);
    assert.equal(evaluation.json().data.reason, "NO_POLICY");
    assert.deepEqual(Object.keys(evaluation.json().data).sort(), [
      "allowed",
      "reason",
      "withinFreeCancellationWindow",
    ]);

    await app.close();
  },
);
