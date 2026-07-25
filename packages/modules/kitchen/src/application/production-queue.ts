// SPEC-100 / SPEC-104 — ProductionQueue.
//
// SCOPE NOTE (approved simplification): this is a COMPUTED query function, NOT a
// stored/cached projection. It returns the non-terminal Commands for a Station in
// a deterministic, reproducible order. No priority bands, no aging algorithm, no
// projectionRevision/projectionCursor/freshness metadata beyond `asOf`. The queue
// never authorizes a transition — callers act against the Command aggregate.

import { type Command, NON_TERMINAL_STATUSES } from "../domain/command.js";
import type { CommandRepositoryPort } from "./ports.js";

export interface ProductionQueue {
  stationId: string;
  asOf: Date;
  commands: Command[];
}

export interface ProductionQueueDeps {
  commands: CommandRepositoryPort;
  now?: () => Date;
}

// Stable order: priority DESC, then receivedAt ASC, then id ASC (final tiebreak
// guarantees a reproducible order independent of storage).
export function orderProductionQueue(commands: Command[]): Command[] {
  return [...commands].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    const at = a.receivedAt.getTime();
    const bt = b.receivedAt.getTime();
    if (at !== bt) return at - bt;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

export async function getProductionQueue(
  deps: ProductionQueueDeps,
  input: { tenantId: string; stationId: string },
): Promise<ProductionQueue> {
  const all = await deps.commands.listByStation(input.tenantId, input.stationId);
  const nonTerminal = all.filter((c) => NON_TERMINAL_STATUSES.includes(c.status));
  return {
    stationId: input.stationId,
    asOf: (deps.now ?? (() => new Date()))(),
    commands: orderProductionQueue(nonTerminal),
  };
}
