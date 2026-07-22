# Especificación — SPEC-148 Invoice Templates API

Create/edit DRAFT, preview, publish/version/deactivate. `If-Match` protege edición. Preview usa
fixtures sintéticos y renderer sandboxed; publish valida allowlist, sanitización, campos fiscales,
layout normative version y accesibilidad mínima.

Templates publicados son inmutables. Un fallo de template usa fallback fiscal mínimo y genera
alerta; no bloquea autorización ni altera Invoice.
