import { randomUUID } from "node:crypto";
import { isBranchOperable } from "../domain/branch.js";
import type { Salon } from "../domain/salon.js";
import type { BranchRepositoryPort, SalonRepositoryPort } from "./ports.js";

export class BranchNotOperableError extends Error {
  constructor(branchId: string) {
    super(`Branch ${branchId} does not exist or is not operable`);
    this.name = "BranchNotOperableError";
  }
}

export interface CreateSalonInput {
  tenantId: string;
  branchId: string;
  name: string;
  capacity: number;
  description?: string;
  actorId?: string;
}

export interface CreateSalonDeps {
  branches: BranchRepositoryPort;
  salons: SalonRepositoryPort;
  now?: () => Date;
}

export async function createSalon(
  deps: CreateSalonDeps,
  input: CreateSalonInput,
): Promise<Salon> {
  const branch = await deps.branches.findById(input.tenantId, input.branchId);
  if (!branch || !isBranchOperable(branch)) {
    throw new BranchNotOperableError(input.branchId);
  }

  const now = (deps.now ?? (() => new Date()))();
  const salon: Salon = {
    id: randomUUID(),
    tenantId: input.tenantId,
    branchId: input.branchId,
    name: input.name,
    capacity: input.capacity,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.actorId !== undefined
      ? { createdBy: input.actorId, updatedBy: input.actorId }
      : {}),
  };

  await deps.salons.save(salon);
  return salon;
}
