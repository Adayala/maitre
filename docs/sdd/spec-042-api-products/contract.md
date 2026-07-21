# Contrato API — SPEC-042

API para crear/listar/obtener/PATCH productos dentro de Menu draft y gestionar disponibilidad
configurada. Body valida money, currency, tax category, allergens, modifiers y media refs;
no acepta tenant ni estado operativo derivado.

Idempotency-Key protege create; If-Match protege PATCH. Publicados son snapshots inmutables;
descontinuar crea revisión o cambia availability según workflow. Tests cubren precisión de
precio, payload límites, cross-tenant, concurrencia, auditoría y OpenAPI.
