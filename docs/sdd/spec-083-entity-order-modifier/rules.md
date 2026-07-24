# Rules — SPEC-083

- Modifier debe pertenecer al producto y a la misma `catalogRevisionId` del item.
- Min/max, exclusividad y duplicados se validan atómicamente al submit.
- Pricing del modifier usa la currency del Order y dinero exacto.
- Texto libre sólo complementa tipos permitidos; no sustituye códigos de seguridad/alergia.
- Cambios post-submit sólo mediante ajuste auditado y revisión nueva del item/order.
- Modifier no contiene PII ni credenciales; sólo metadatos culinarios mínimos.
