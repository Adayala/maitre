import { randomUUID } from "node:crypto";
import type { EmploymentRepositoryPort } from "./ports.js";
import type { Employment } from "../domain/employment.js";

export class DuplicateEmployeeCodeError extends Error {
  constructor(employeeCode: string, tenantId: string) {
    super(`Employee code "${employeeCode}" already exists for tenant ${tenantId}`);
    this.name = "DuplicateEmployeeCodeError";
  }
}

interface EmploymentDeps {
  employments: EmploymentRepositoryPort;
}

interface CreateEmploymentInput {
  tenantId: string;
  personRef: string;
  employeeCode: string;
  relationshipType: Employment["relationshipType"];
  eligibleBranchIds: string[];
  status?: Employment["status"];
  validFrom: Date;
  validUntil?: Date | null;
  now?: Date;
}

export async function createEmployment(
  deps: EmploymentDeps,
  input: CreateEmploymentInput,
): Promise<Employment> {
  const existing = await deps.employments.findByEmployeeCode(input.tenantId, input.employeeCode);
  if (existing) throw new DuplicateEmployeeCodeError(input.employeeCode, input.tenantId);

  const now = input.now ?? new Date();
  const employment: Employment = {
    id: randomUUID(),
    tenantId: input.tenantId,
    personRef: input.personRef,
    employeeCode: input.employeeCode,
    relationshipType: input.relationshipType,
    eligibleBranchIds: input.eligibleBranchIds,
    status: input.status ?? "ACTIVE",
    validFrom: input.validFrom,
    ...(input.validUntil ? { validUntil: input.validUntil } : {}),
    createdAt: now,
    updatedAt: now,
  };
  await deps.employments.save(employment);
  return employment;
}
