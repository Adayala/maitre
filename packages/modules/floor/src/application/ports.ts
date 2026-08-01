import type { Visit } from "../domain/visit.js";
import type { Occupancy } from "../domain/occupancy.js";
import type { Check } from "../domain/check.js";
import type { Payment } from "../domain/payment.js";
import type { ServicePeriod } from "../domain/service-period.js";
import type { Plaza } from "../domain/plaza.js";

export interface VisitRepositoryPort {
  findById(tenantId: string, id: string): Promise<Visit | null>;
  listByBranch(tenantId: string, branchId: string): Promise<Visit[]>;
  save(visit: Visit): Promise<void>;
}

export interface OccupancyRepositoryPort {
  findById(tenantId: string, id: string): Promise<Occupancy | null>;
  listByVisit(tenantId: string, visitId: string): Promise<Occupancy[]>;
  listByTable(tenantId: string, tableId: string): Promise<Occupancy[]>;
  findActiveByTable(
    tenantId: string,
    tableId: string,
  ): Promise<Occupancy | null>;
  save(occupancy: Occupancy): Promise<void>;
}

export interface CheckRepositoryPort {
  findById(tenantId: string, id: string): Promise<Check | null>;
  findByVisit(tenantId: string, visitId: string): Promise<Check | null>;
  listByBranch(tenantId: string, branchId: string): Promise<Check[]>;
  save(check: Check): Promise<void>;
}

export interface PaymentRepositoryPort {
  findById(tenantId: string, id: string): Promise<Payment | null>;
  findByIdempotencyKey(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<Payment | null>;
  listByCheck(tenantId: string, checkId: string): Promise<Payment[]>;
  save(payment: Payment): Promise<void>;
}

export interface ServicePeriodRepositoryPort {
  findById(tenantId: string, id: string): Promise<ServicePeriod | null>;
  listByBranch(tenantId: string, branchId: string): Promise<ServicePeriod[]>;
  findActiveByBranch(
    tenantId: string,
    branchId: string,
  ): Promise<ServicePeriod | null>;
  save(period: ServicePeriod): Promise<void>;
}

export interface PlazaRepositoryPort {
  findById(tenantId: string, id: string): Promise<Plaza | null>;
  listBySalon(tenantId: string, salonId: string): Promise<Plaza[]>;
  listByServicePeriod(
    tenantId: string,
    servicePeriodId: string,
  ): Promise<Plaza[]>;
  findByTableInServicePeriod(
    tenantId: string,
    servicePeriodId: string,
    tableId: string,
  ): Promise<Plaza | null>;
  save(plaza: Plaza): Promise<void>;
}
