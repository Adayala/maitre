# Reglas — SPEC-140

- Clave privada, cert material y tickets nunca entran al dominio, DB, Git, browser ni logs.
- Identidad separada por CUIT/service/environment.
- Homologation y production usan referencias e identidades secretas distintas.
- Expiración/revocación bloquea nuevas solicitudes, no lectura histórica.
- Rotación admite overlap controlado y rollback auditado.
