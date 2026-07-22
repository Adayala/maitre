# Especificación — SPEC-140 FiscalCertificate

Metadatos + secret reference por CUIT/service/environment: fingerprint, issuer, notBefore/notAfter,
status y rotation timestamps. Private key, certificate material, CMS y access tickets nunca entran
en DB, Git, browser, logs o artifacts.

Secret adapter aplica encryption, least privilege, audit y backup/rotation. Homologation y
production usan proyectos/identidades/referencias separadas. Rotación admite overlap controlado y
rollback; expiración/revocación bloquea nuevas solicitudes, no lectura histórica.
