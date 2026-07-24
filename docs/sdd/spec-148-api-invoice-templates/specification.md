# Especificación — SPEC-148 Invoice Templates API

Create/edit DRAFT, preview, publish/version/deactivate. `If-Match` protege edición. Preview usa
fixtures sintéticos y renderer sandboxed; publish valida allowlist, sanitización, campos fiscales,
layout normative version y accesibilidad mínima.

Templates publicados son inmutables. Un fallo de template usa fallback fiscal mínimo y genera
alerta; no bloquea autorización ni altera Invoice.

`POST /invoice-templates` crea un draft acotado por tenant/brand/channel; `GET /invoice-templates`
lista versiones y estado; `PATCH /invoice-templates/{templateId}` modifica sólo drafts; `POST
/invoice-templates/{templateId}:preview` renderiza sobre fixtures sintéticos; `POST
/invoice-templates/{templateId}:publish` congela una nueva versión; `POST
/invoice-templates/{templateId}:deactivate` retira una versión para usos futuros sin reescribir
historia.

Errores usan `404` para alcance ajeno, `409` para conflictos de lifecycle, `412` para revisión
obsoleta y `422` para fallas de sanitización, variables no permitidas, incumplimiento de layout
normativo o accesibilidad mínima requerida. La API nunca devuelve secretos ni assets sin pasar por la
política de sanitización/versionado.
