import { test } from "node:test";
import assert from "node:assert/strict";
import { createUser } from "../application/create-user.js";
import type { User, UserRepositoryPort } from "../index.js";

class FakeUserRepository implements UserRepositoryPort {
  private readonly items: User[] = [];
  async findByExternalIdentity(provider: string, subject: string) {
    return (
      this.items.find(
        (u) => u.identityProvider === provider && u.externalIdentityId === subject,
      ) ?? null
    );
  }
  async findById(id: string) {
    return this.items.find((u) => u.id === id) ?? null;
  }
  async findByEmail(email: string) {
    return this.items.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase()) ?? null;
  }
  async save(user: User) {
    const index = this.items.findIndex((item) => item.id === user.id);
    if (index >= 0) this.items[index] = user;
    else this.items.push(user);
  }
}

const now = new Date("2026-05-01T00:00:00Z");

test("createUser creates an ACTIVE placeholder user with a pending-invite identity", async () => {
  const users = new FakeUserRepository();
  const user = await createUser(
    { users, now: () => now },
    { displayName: "Jane Doe", email: "jane@example.com" },
  );

  assert.equal(user.status, "ACTIVE");
  assert.equal(user.identityProvider, "pending-invite");
  assert.ok(user.externalIdentityId);
  assert.equal(user.email, "jane@example.com");
});

test("createUser generates a unique externalIdentityId per call", async () => {
  const users = new FakeUserRepository();
  const a = await createUser({ users, now: () => now }, { displayName: "A" });
  const b = await createUser({ users, now: () => now }, { displayName: "B" });
  assert.notEqual(a.externalIdentityId, b.externalIdentityId);
});

test("createUser persists the user so it can be found by id", async () => {
  const users = new FakeUserRepository();
  const user = await createUser({ users, now: () => now }, { displayName: "Jane Doe" });
  const found = await users.findById(user.id);
  assert.deepEqual(found, user);
});
