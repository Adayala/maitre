# Especificación — SPEC-142 InvoiceTemplate

Presentación versionada separada del contenido fiscal obligatorio. Variables usan allowlist tipada;
HTML/CSS/assets se sanitizan y tienen límites. Publish congela template/normative layout versions.

Branding ausente o inválido degrada a representación mínima fiscal válida. Preview usa datos
sintéticos. Un template no puede ocultar campos obligatorios, alterar importes ni ejecutar código o
requests externos.

La entidad incluye `templateId`, `tenantId`, `brandId?`, `name`, `channel`, `status`, `contentRef`,
`assetManifest`, `variableSchemaVersion`, `layoutNormativeVersion`, `publishedAt?`, `publishedBy?`,
`createdAt`, `updatedAt` y `revision`. `DRAFT` admite cambios; `PUBLISHED` queda inmutable y nuevas
modificaciones generan otra versión. La publicación no muta invoices históricas ni reemplaza la
versión previamente congelada en documentos ya autorizados.

Preview es una proyección no autoritativa: usa fixtures sintéticos y nunca datos sensibles reales de
clientes, CAE, certificados o tokens. El renderer resuelve sólo variables fiscales, comerciales y de
branding aprobadas por schema. Campos obligatorios definidos por normativa y por `Invoice` tienen
presencia garantizada aun cuando el template omita bloques opcionales.
