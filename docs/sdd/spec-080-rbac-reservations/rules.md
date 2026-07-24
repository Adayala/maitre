# Rules — SPEC-080

- Deny-by-default ante permiso, alcance, policy, Membership o revision desconocidos.
- No existen wildcard, `waitlist.manage` ni rol local `host`.
- Collections filtran alcance antes de paginar; detail fuera de alcance usa `404`.
- WAITER no recibe PII/export por default ni puede autoasignarse.
- Capability se almacena como hash, no se loguea y liga acción/recurso/expiry/audience.
- Revocación, expiry, replay o acción distinta fallan cerrado sin enumerar.
- Permiso exitoso no omite consent, retention, capacity ni lifecycle.
