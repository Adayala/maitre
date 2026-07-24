# Verificación — SPEC-142

## Criterios

### CAD-142-01 — Template content, assets y variables quedan versionados por scope sin alterar snapshot fiscal

- [ ] template y assets versionados no alteran el snapshot fiscal autoritativo.

### CAD-142-02 — Placeholders usan allowlist tipada y rechazan variables ambiguas

- [ ] placeholders sólo aceptan variables allowlisted y tipadas.

### CAD-142-03 — HTML/CSS/assets se sanitizan y renderizan en sandbox sin código activo

- [ ] sanitización y sandbox bloquean código activo, requests externos y secretos.

### CAD-142-04 — Publish congela versiones y preserva historia en invoices emitidas

- [ ] publicación congela versiones y preserva historia en invoices emitidas.

### CAD-142-05 — Branding inválido degrada a representación mínima fiscal válida

- [ ] fallback mínimo fiscal cubre ausencia o invalidez de branding sin ocultar datos.

### CAD-142-06 — La aprobación exige evidencia de variables, sanitización, fallback y determinismo

- [ ] fixtures cubren variables, límites, fallback, historia y determinismo.
