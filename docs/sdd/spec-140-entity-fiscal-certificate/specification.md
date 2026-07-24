# Especificación — SPEC-140 FiscalCertificate

Metadatos + secret reference por CUIT/service/environment: fingerprint, issuer, notBefore/notAfter,
status y rotation timestamps. Private key, certificate material, CMS y access tickets nunca entran
en DB, Git, browser, logs o artifacts.

Secret adapter aplica encryption, least privilege, audit y backup/rotation. Homologation y
production usan proyectos/identidades/referencias separadas. Rotación admite overlap controlado y
rollback; expiración/revocación bloquea nuevas solicitudes, no lectura histórica.

FiscalCertificate conserva `fiscalEntityId`, `cuit`, `service`, `environment`, `fingerprint`,
`issuer`, `notBefore`, `notAfter`, `status`, `secretReference`, `rotatedAt?`, `supersededBy?` y
metadata de auditoría. Es estrictamente metadata de acceso y vigencia; el material criptográfico
real vive fuera del dominio en el adapter secreto aprobado.

La rotación permite overlap controlado entre certificado saliente y entrante para evitar downtime,
con rollback auditable si la nueva credencial falla. `REVOKED` o `EXPIRED` bloquean nuevas
solicitudes de autorización o login fiscal, pero no impiden inspección histórica de comprobantes ya
emitidos o metadata pasada.
