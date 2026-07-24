import type { SupabaseClient } from "@supabase/supabase-js";
import type { Guest, GuestRepositoryPort } from "@maitre/reservations";

const TABLE = "reservations_guests";

interface GuestRow {
  id: string;
  tenant_id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  locale: string | null;
  consent_given: boolean;
  notes: string | null;
  status: string;
  anonymized_at: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
}

function fromRow(row: GuestRow): Guest {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    displayName: row.display_name,
    consentGiven: row.consent_given,
    status: row.status as Guest["status"],
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    ...(row.email !== null ? { email: row.email } : {}),
    ...(row.phone !== null ? { phone: row.phone } : {}),
    ...(row.locale !== null ? { locale: row.locale } : {}),
    ...(row.notes !== null ? { notes: row.notes } : {}),
    ...(row.anonymized_at !== null ? { anonymizedAt: new Date(row.anonymized_at) } : {}),
  };
}

function toRow(guest: Guest): GuestRow {
  return {
    id: guest.id,
    tenant_id: guest.tenantId,
    display_name: guest.displayName,
    email: guest.email ?? null,
    phone: guest.phone ?? null,
    locale: guest.locale ?? null,
    consent_given: guest.consentGiven,
    notes: guest.notes ?? null,
    status: guest.status,
    anonymized_at: guest.anonymizedAt ? guest.anonymizedAt.toISOString() : null,
    revision: guest.revision,
    created_at: guest.createdAt.toISOString(),
    updated_at: guest.updatedAt.toISOString(),
  };
}

export class SupabaseGuestRepository implements GuestRepositoryPort {
  constructor(private readonly client: SupabaseClient) {}

  async findById(tenantId: string, id: string): Promise<Guest | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as GuestRow) : null;
  }

  async lookupByContact(tenantId: string, email?: string, phone?: string): Promise<Guest | null> {
    let query = this.client.from(TABLE).select("*").eq("tenant_id", tenantId);
    if (email) query = query.eq("email", email);
    else if (phone) query = query.eq("phone", phone);
    else return null;
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as GuestRow) : null;
  }

  async save(guest: Guest): Promise<void> {
    const { error } = await this.client.from(TABLE).upsert(toRow(guest));
    if (error) throw error;
  }
}
