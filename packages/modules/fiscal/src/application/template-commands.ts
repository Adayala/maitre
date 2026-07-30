// SPEC-142/148 — InvoiceTemplate use cases: create, list, publish (freezes),
// deactivate, preview (canned synthetic fixture). Template interpretation stays
// deferred; the minimal authorized-invoice renderer is a separate use case.

import { randomUUID } from "node:crypto";
import {
  type InvoiceTemplate,
  type InvoiceTemplatePreview,
  assertTemplateTransition,
} from "../domain/invoice-template.js";
import type { InvoiceTemplateRepositoryPort } from "./ports.js";

export interface TemplateDeps {
  templates: InvoiceTemplateRepositoryPort;
  now?: () => Date;
}

function nowFrom(deps: { now?: () => Date }): Date {
  return (deps.now ?? (() => new Date()))();
}

export interface CreateTemplateInput {
  id?: string;
  tenantId: string;
  brandId?: string;
  name: string;
  channel: string;
  contentRef: string;
  variableSchemaVersion: number;
  layoutNormativeVersion: string;
}

export async function createTemplate(
  deps: TemplateDeps,
  input: CreateTemplateInput,
): Promise<InvoiceTemplate> {
  const now = nowFrom(deps);
  const template: InvoiceTemplate = {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId,
    brandId: input.brandId ?? null,
    name: input.name,
    channel: input.channel,
    status: "DRAFT",
    contentRef: input.contentRef,
    variableSchemaVersion: input.variableSchemaVersion,
    layoutNormativeVersion: input.layoutNormativeVersion,
    publishedAt: null,
    publishedBy: null,
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
  await deps.templates.save(template);
  return template;
}

export async function listTemplates(
  deps: TemplateDeps,
  tenantId: string,
): Promise<InvoiceTemplate[]> {
  return deps.templates.listByTenant(tenantId);
}

export async function publishTemplate(
  deps: TemplateDeps,
  input: { tenantId: string; id: string; publishedBy: string },
): Promise<InvoiceTemplate> {
  const template = await deps.templates.findById(input.tenantId, input.id);
  if (!template) throw new Error(`InvoiceTemplate ${input.id} not found`);
  assertTemplateTransition(template.status, "PUBLISHED");
  const now = nowFrom(deps);
  // Publish freezes the template (SPEC-142); further changes require a new version.
  const published: InvoiceTemplate = {
    ...template,
    status: "PUBLISHED",
    publishedAt: now,
    publishedBy: input.publishedBy,
    updatedAt: now,
    revision: template.revision + 1,
  };
  await deps.templates.save(published);
  return published;
}

export async function deactivateTemplate(
  deps: TemplateDeps,
  input: { tenantId: string; id: string },
): Promise<InvoiceTemplate> {
  const template = await deps.templates.findById(input.tenantId, input.id);
  if (!template) throw new Error(`InvoiceTemplate ${input.id} not found`);
  assertTemplateTransition(template.status, "DEACTIVATED");
  const now = nowFrom(deps);
  const deactivated: InvoiceTemplate = {
    ...template,
    status: "DEACTIVATED",
    updatedAt: now,
    revision: template.revision + 1,
  };
  await deps.templates.save(deactivated);
  return deactivated;
}

// SPEC-142 preview — synthetic fixture only, never a real render, never real
// customer/CAE/token data.
export async function previewTemplate(
  deps: TemplateDeps,
  input: { tenantId: string; id: string },
): Promise<InvoiceTemplatePreview> {
  const template = await deps.templates.findById(input.tenantId, input.id);
  if (!template) throw new Error(`InvoiceTemplate ${input.id} not found`);
  return {
    templateId: template.id,
    status: template.status,
    renderedPlaceholder: `[[ synthetic preview of "${template.name}" (${template.channel}) — real rendering deferred ]]`,
    fixtureOnly: true,
  };
}
