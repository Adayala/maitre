export class TenantNotOperableError extends Error {
  constructor(tenantId: string) {
    super(`Tenant ${tenantId} does not exist or is not operable`);
    this.name = "TenantNotOperableError";
  }
}
