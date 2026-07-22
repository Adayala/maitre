import type {
  Tenant,
  Branch,
  Brand,
  FiscalEntity,
  Salon,
  Table,
} from "../index.js";
import type {
  TenantRepositoryPort,
  BranchRepositoryPort,
  BrandRepositoryPort,
  FiscalEntityRepositoryPort,
  SalonRepositoryPort,
  TableRepositoryPort,
} from "../application/ports.js";
import type { OutboxPort, OutboxRecord } from "../application/outbox.js";

// Minimal in-memory fakes for application-layer unit tests (SPEC-224 §2:
// domain/application must not touch real infra; ports are injected fakes).

export class FakeOutboxRepository implements OutboxPort {
  readonly records: OutboxRecord[] = [];
  async append(record: OutboxRecord): Promise<void> {
    this.records.push(record);
  }
}

export class FakeTenantRepository implements TenantRepositoryPort {
  constructor(private readonly tenants: Tenant[] = []) {}
  async findById(id: string) {
    return this.tenants.find((t) => t.id === id) ?? null;
  }
  async save(tenant: Tenant) {
    const i = this.tenants.findIndex((t) => t.id === tenant.id);
    if (i >= 0) this.tenants[i] = tenant;
    else this.tenants.push(tenant);
  }
}

export class FakeBranchRepository implements BranchRepositoryPort {
  constructor(private readonly branches: Branch[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.branches.find((b) => b.tenantId === tenantId && b.id === id) ?? null;
  }
  async findByCode(tenantId: string, code: string) {
    return (
      this.branches.find((b) => b.tenantId === tenantId && b.code === code) ?? null
    );
  }
  async listByTenant(tenantId: string) {
    return this.branches.filter((b) => b.tenantId === tenantId);
  }
  async save(branch: Branch) {
    const i = this.branches.findIndex((b) => b.id === branch.id);
    if (i >= 0) this.branches[i] = branch;
    else this.branches.push(branch);
  }
}

export class FakeBrandRepository implements BrandRepositoryPort {
  constructor(private readonly brands: Brand[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.brands.find((b) => b.tenantId === tenantId && b.id === id) ?? null;
  }
  async findBySlug(tenantId: string, slug: string) {
    return this.brands.find((b) => b.tenantId === tenantId && b.slug === slug) ?? null;
  }
  async listByTenant(tenantId: string) {
    return this.brands.filter((b) => b.tenantId === tenantId);
  }
  async save(brand: Brand) {
    const i = this.brands.findIndex((b) => b.id === brand.id);
    if (i >= 0) this.brands[i] = brand;
    else this.brands.push(brand);
  }
}

export class FakeFiscalEntityRepository implements FiscalEntityRepositoryPort {
  constructor(private readonly entities: FiscalEntity[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.entities.find((e) => e.tenantId === tenantId && e.id === id) ?? null;
  }
  async findByCuit(tenantId: string, cuit: string) {
    return (
      this.entities.find((e) => e.tenantId === tenantId && e.cuit === cuit) ?? null
    );
  }
  async listByTenant(tenantId: string) {
    return this.entities.filter((e) => e.tenantId === tenantId);
  }
  async save(entity: FiscalEntity) {
    const i = this.entities.findIndex((e) => e.id === entity.id);
    if (i >= 0) this.entities[i] = entity;
    else this.entities.push(entity);
  }
}

export class FakeSalonRepository implements SalonRepositoryPort {
  constructor(private readonly salons: Salon[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.salons.find((s) => s.tenantId === tenantId && s.id === id) ?? null;
  }
  async listByBranch(tenantId: string, branchId: string) {
    return this.salons.filter((s) => s.tenantId === tenantId && s.branchId === branchId);
  }
  async save(salon: Salon) {
    const i = this.salons.findIndex((s) => s.id === salon.id);
    if (i >= 0) this.salons[i] = salon;
    else this.salons.push(salon);
  }
}

export class FakeTableRepository implements TableRepositoryPort {
  constructor(private readonly tables: Table[] = []) {}
  async findById(tenantId: string, id: string) {
    return this.tables.find((t) => t.tenantId === tenantId && t.id === id) ?? null;
  }
  async findByNumber(tenantId: string, salonId: string, number: string) {
    return (
      this.tables.find(
        (t) => t.tenantId === tenantId && t.salonId === salonId && t.number === number,
      ) ?? null
    );
  }
  async listBySalon(tenantId: string, salonId: string) {
    return this.tables.filter((t) => t.tenantId === tenantId && t.salonId === salonId);
  }
  async save(table: Table) {
    const i = this.tables.findIndex((t) => t.id === table.id);
    if (i >= 0) this.tables[i] = table;
    else this.tables.push(table);
  }
}

export function aTenant(overrides: Partial<Tenant> = {}): Tenant {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Acme",
    status: "ACTIVE",
    defaultLocale: "es-AR",
    defaultCurrency: "ARS",
    defaultTimezone: "America/Argentina/Buenos_Aires",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function aBranch(overrides: Partial<Branch> = {}): Branch {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "22222222-2222-2222-2222-222222222222",
    tenantId: "11111111-1111-1111-1111-111111111111",
    brandId: "33333333-3333-3333-3333-333333333333",
    code: "MAIN",
    name: "Main Branch",
    timezone: "America/Argentina/Buenos_Aires",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function aSalon(overrides: Partial<Salon> = {}): Salon {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id: "66666666-6666-6666-6666-666666666666",
    tenantId: "11111111-1111-1111-1111-111111111111",
    branchId: "22222222-2222-2222-2222-222222222222",
    name: "Salón Principal",
    capacity: 40,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
