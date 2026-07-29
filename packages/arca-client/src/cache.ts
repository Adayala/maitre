import type { WsaaTicket, WsaaTicketCache, WsaaTicketKey } from "./ports.js";

function keyOf(key: WsaaTicketKey): string {
  return `${key.environment}:${key.representedCuit}:${key.service}`;
}

export class MemoryWsaaTicketCache implements WsaaTicketCache {
  private readonly tickets = new Map<string, WsaaTicket>();

  async get(key: WsaaTicketKey): Promise<WsaaTicket | null> {
    return this.tickets.get(keyOf(key)) ?? null;
  }

  async set(key: WsaaTicketKey, ticket: WsaaTicket): Promise<void> {
    this.tickets.set(keyOf(key), ticket);
  }
}
