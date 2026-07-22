# Contrato de entidad — SPEC-142 Invoice Template

InvoiceTemplate define presentación versionada por tenant, sucursal, idioma y canal, separada
del contenido fiscal obligatorio. Publicar congela una versión; variables se resuelven desde
un allowlist y contenido activo se sanitiza. La falta de branding no impide producir una
representación mínima válida. Tests cubren variables faltantes, XSS, localización,
accesibilidad, versionado, fallback y aislamiento entre tenants.
