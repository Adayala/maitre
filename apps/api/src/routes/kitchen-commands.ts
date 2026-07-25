import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  claimCommand,
  releaseCommand,
  startCommand,
  holdCommand,
  resumeCommand,
  markCommandReady,
  completeCommandHandoff,
  rollbackCommandToInProgress,
  cancelCommand,
  transferCommand,
  reprioritizeCommand,
  InvalidCommandTransitionError,
  InvalidStationStateError,
  CommandTerminalError,
  StationNotRoutableError,
  type Command,
} from "@maitre/kitchen";
import { applyKitchenItemStatus, type OrderItemStatus } from "@maitre/ordering";
import type { Container } from "../composition/container.js";
import { requireTenantContext, requirePermission } from "../http/request-context.js";
import { sendProblem, notFound, conflict, badRequest } from "../http/problem-details.js";

// SPEC-102/104/110 — Kitchen Command API. Each transition is a command endpoint
// (no PATCH). If-Match/Idempotency-Key enforcement is deferred, consistent with
// every prior Fase 2 domain.

const reasonBodySchema = z.object({ reason: z.string().min(1) });
const transferBodySchema = z.object({ targetStationId: z.string().min(1), reason: z.string().min(1) });
const reprioritizeBodySchema = z.object({ priority: z.number().int(), reason: z.string().min(1) });

function commandDeps(container: Container) {
  return { commands: container.commands, outbox: container.outbox };
}

function mapCommandError(err: unknown, reply: Parameters<typeof sendProblem>[0], correlationId: string): void {
  if (err instanceof z.ZodError) return sendProblem(reply, correlationId, badRequest(err.message));
  if (err instanceof InvalidCommandTransitionError) return sendProblem(reply, correlationId, conflict(err.message));
  if (err instanceof CommandTerminalError) return sendProblem(reply, correlationId, conflict(err.message));
  if (err instanceof StationNotRoutableError) return sendProblem(reply, correlationId, conflict(err.message));
  if (err instanceof InvalidStationStateError) return sendProblem(reply, correlationId, conflict(err.message));
  if (err instanceof Error && err.message.includes("not found")) return sendProblem(reply, correlationId, notFound("Command"));
  return sendProblem(reply, correlationId, err);
}

export async function registerKitchenCommandRoutes(app: FastifyInstance, container: Container): Promise<void> {
  // Reverse cross-module sync: after a Command reaches IN_PROGRESS/READY/COMPLETED
  // advance the owning Order's item (idempotent, tolerant of illegal transitions).
  async function syncOrder(command: Command, to: OrderItemStatus, correlationId: string): Promise<void> {
    await applyKitchenItemStatus(
      { orders: container.orders, outbox: container.outbox },
      { tenantId: command.tenantId, orderId: command.orderId, orderItemId: command.orderItemId, to, correlationId },
    );
  }

  app.get<{ Params: { id: string } }>("/v1/kitchen/commands/:id", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:queue_read");
      const command = await container.commands.findById(ctx.tenantId, req.params.id);
      if (!command) return sendProblem(reply, correlationId, notFound("Command"));
      return { data: command };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  // All Commands for an Order (used by the order lifecycle / tests to drive the
  // per-item production flow).
  app.get<{ Params: { orderId: string } }>("/v1/orders/:orderId/kitchen/commands", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:queue_read");
      const commands = await container.commands.listByOrder(ctx.tenantId, req.params.orderId);
      return { data: commands };
    } catch (err) {
      return sendProblem(reply, correlationId, err);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/commands/:id/claim", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:command_claim");
      const command = await claimCommand(commandDeps(container), {
        tenantId: ctx.tenantId,
        commandId: req.params.id,
        actorRef: ctx.userId,
      });
      return { data: command };
    } catch (err) {
      return mapCommandError(err, reply, correlationId);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/commands/:id/release", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:command_claim");
      const command = await releaseCommand(commandDeps(container), { tenantId: ctx.tenantId, commandId: req.params.id });
      return { data: command };
    } catch (err) {
      return mapCommandError(err, reply, correlationId);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/commands/:id/start", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:command_start");
      const command = await startCommand(commandDeps(container), {
        tenantId: ctx.tenantId,
        commandId: req.params.id,
        correlationId,
      });
      await syncOrder(command, "IN_PREP", correlationId);
      return { data: command };
    } catch (err) {
      return mapCommandError(err, reply, correlationId);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/commands/:id/hold", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:command_hold");
      const command = await holdCommand(commandDeps(container), { tenantId: ctx.tenantId, commandId: req.params.id });
      return { data: command };
    } catch (err) {
      return mapCommandError(err, reply, correlationId);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/commands/:id/resume", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:command_hold");
      const command = await resumeCommand(commandDeps(container), { tenantId: ctx.tenantId, commandId: req.params.id });
      return { data: command };
    } catch (err) {
      return mapCommandError(err, reply, correlationId);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/commands/:id/mark-ready", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:command_ready");
      const command = await markCommandReady(commandDeps(container), {
        tenantId: ctx.tenantId,
        commandId: req.params.id,
        correlationId,
      });
      await syncOrder(command, "READY", correlationId);
      return { data: command };
    } catch (err) {
      return mapCommandError(err, reply, correlationId);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/commands/:id/complete-handoff", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:command_handoff");
      const command = await completeCommandHandoff(commandDeps(container), {
        tenantId: ctx.tenantId,
        commandId: req.params.id,
        correlationId,
      });
      await syncOrder(command, "DELIVERED", correlationId);
      return { data: command };
    } catch (err) {
      return mapCommandError(err, reply, correlationId);
    }
  });

  // Exceptional READY -> IN_PROGRESS rollback. Requires a reason; gated by
  // reprioritize (a manager/maitre-tier permission COOK lacks), per the approved
  // "manager + motivo" simplification.
  app.post<{ Params: { id: string } }>("/v1/kitchen/commands/:id/rollback", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:command_reprioritize");
      const body = reasonBodySchema.parse(req.body);
      const command = await rollbackCommandToInProgress(commandDeps(container), {
        tenantId: ctx.tenantId,
        commandId: req.params.id,
        reason: body.reason,
      });
      return { data: command };
    } catch (err) {
      return mapCommandError(err, reply, correlationId);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/commands/:id/cancel", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:command_cancel");
      const body = reasonBodySchema.parse(req.body);
      const command = await cancelCommand(commandDeps(container), {
        tenantId: ctx.tenantId,
        commandId: req.params.id,
        reason: body.reason,
      });
      return { data: command };
    } catch (err) {
      return mapCommandError(err, reply, correlationId);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/commands/:id/transfer", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:command_transfer");
      const body = transferBodySchema.parse(req.body);
      const command = await transferCommand(
        { commands: container.commands, outbox: container.outbox, stations: container.stations },
        {
          tenantId: ctx.tenantId,
          commandId: req.params.id,
          targetStationId: body.targetStationId,
          reason: body.reason,
          actor: ctx.userId,
        },
      );
      return { data: command };
    } catch (err) {
      return mapCommandError(err, reply, correlationId);
    }
  });

  app.post<{ Params: { id: string } }>("/v1/kitchen/commands/:id/reprioritize", async (req, reply) => {
    const correlationId = randomUUID();
    try {
      const ctx = await requireTenantContext(container, req);
      requirePermission(ctx, "kitchen:command_reprioritize");
      const body = reprioritizeBodySchema.parse(req.body);
      const command = await reprioritizeCommand(commandDeps(container), {
        tenantId: ctx.tenantId,
        commandId: req.params.id,
        priority: body.priority,
        reason: body.reason,
      });
      return { data: command };
    } catch (err) {
      return mapCommandError(err, reply, correlationId);
    }
  });
}
