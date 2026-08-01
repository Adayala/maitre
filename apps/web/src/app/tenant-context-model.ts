export interface TenantIdentity {
  id: string;
}

export function resolveSelectedTenantId(
  storedTenantId: string | null,
  tenants: TenantIdentity[] | undefined,
) {
  if (!storedTenantId || !tenants) return null;
  return tenants.some((tenant) => tenant.id === storedTenantId)
    ? storedTenantId
    : null;
}
