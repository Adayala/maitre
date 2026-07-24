# Reglas — SPEC-026

- Permiso, estado de Membership y alcance se resuelven server-side en cada decisión.
- Toda acción requiere permiso explícito y además satisface reglas de dominio/segregación.
- OWNER recibe el conjunto versionado del catálogo; no existe wildcard implícito “all”.
- Ningún actor modifica sus propios roles/alcances ni aprueba su propia elevación.
- ADMIN sólo invita/asigna roles delegables y no modifica OWNER o peer protegido.
- No se revoca/degrada el último OWNER sin workflow de transferencia/cierre aprobado.
- Claims, headers y visibilidad UI no sustituyen autoridad.
