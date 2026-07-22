import type { User, UserRepositoryPort } from "@maitre/identity";
import { externalIdentityKey } from "@maitre/identity";

export class InMemoryUserRepository implements UserRepositoryPort {
  private readonly byId = new Map<string, User>();
  private readonly byExternalIdentity = new Map<string, string>();

  async findByExternalIdentity(provider: string, subject: string): Promise<User | null> {
    const id = this.byExternalIdentity.get(externalIdentityKey(provider, subject));
    return id ? (this.byId.get(id) ?? null) : null;
  }

  async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }

  async save(user: User): Promise<void> {
    this.byId.set(user.id, user);
    this.byExternalIdentity.set(
      externalIdentityKey(user.identityProvider, user.externalIdentityId),
      user.id,
    );
  }
}
