# Objetivo — SPEC-142

Definir InvoiceTemplate como representación versionada y segura de presentación fiscal, separada del
contenido normativo obligatorio de Invoice.

## Criterios de aceptación

### CAD-142-01 — Template content, assets y variables quedan versionados por alcance sin alterar snapshot fiscal

template content, assets y variables permitidas quedan versionados por alcance brand/tenant
sin alterar el snapshot fiscal autoritativo.

### CAD-142-02 — Placeholders usan allowlist tipada y rechazan variables ambiguas

placeholders usan allowlist tipada y validada; variables desconocidas, ambiguas o fuera de
alcance quedan rechazadas.

### CAD-142-03 — HTML/CSS/assets se sanitizan y renderizan en sandbox sin código activo

HTML/CSS/assets se sanitizan, limitan y ejecutan en un sandbox sin código activo, requests
externos ni acceso a secretos.

### CAD-142-04 — Publish congela versiones y preserva historia en invoices emitidas

publish congela template version, layout normative version y políticas de render; invoices
ya emitidas conservan la versión publicada al momento de autorizarse.

### CAD-142-05 — Branding inválido degrada a representación mínima fiscal válida

branding faltante o inválido degrada a una representación mínima fiscal válida sin ocultar
campos obligatorios ni alterar importes.

### CAD-142-06 — La aprobación exige evidencia de variables, sanitización, fallback y determinismo

La aprobación exige fixtures de variables, sanitización, límites, fallback visual,
versionado histórico y determinismo de preview/render.
