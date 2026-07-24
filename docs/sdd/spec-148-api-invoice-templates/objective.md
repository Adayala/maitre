# Objetivo — SPEC-148

Definir la API para administrar templates fiscales versionados, con preview seguro y publish
controlado, sin comprometer la autoridad del comprobante fiscal.

## Criterios de aceptación

### CAD-148-01 — La API expone lifecycle explícito entre drafts y versiones publicadas

la API expone create/edit draft, preview, publish/version y deactivate con lifecycle
explícito entre borradores y versiones publicadas.

### CAD-148-02 — Edición de drafts usa concurrencia optimista y no muta publicados

edición de drafts usa control optimista con `If-Match` y nunca muta templates ya
publicados.

### CAD-148-03 — Preview usa fixtures sintéticos y renderer sandboxed

preview usa fixtures sintéticos y renderer sandboxed, sin datos productivos ni requests
externos.

### CAD-148-04 — Publish valida variables, sanitización, layout y accesibilidad mínima

publish valida allowlist de variables, sanitización, campos fiscales obligatorios, layout
normative version y accesibilidad mínima.

### CAD-148-05 — Fallos de template disparan fallback fiscal mínimo sin alterar snapshot ni autoridad fiscal

fallos de template disparan fallback fiscal mínimo y alertado operativo, sin bloquear
autorización de la invoice ni alterar su snapshot ni su autoridad fiscal.

### CAD-148-06 — La aprobación exige evidencia de concurrencia, preview seguro y fallback

La aprobación exige fixtures de concurrencia, preview seguro, publicación inválida,
versionado histórico y fallback.
