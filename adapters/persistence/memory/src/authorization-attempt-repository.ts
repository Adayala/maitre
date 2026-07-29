import type {
  AuthorizationAttempt,
  AuthorizationAttemptRepositoryPort,
} from "@maitre/fiscal";

export class InMemoryAuthorizationAttemptRepository
  implements AuthorizationAttemptRepositoryPort
{
  private readonly byId = new Map<string, AuthorizationAttempt>();

  async findLatestByInvoice(
    tenantId: string,
    invoiceId: string,
  ): Promise<AuthorizationAttempt | null> {
    return (
      [...this.byId.values()]
        .filter((item) => item.tenantId === tenantId && item.invoiceId === invoiceId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null
    );
  }

  async save(attempt: AuthorizationAttempt): Promise<void> {
    this.byId.set(attempt.id, attempt);
  }
}
