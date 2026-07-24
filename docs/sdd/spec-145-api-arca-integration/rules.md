# Reglas — SPEC-145

- Cada solicitud fiscal usa la CUIT, certificado, ambiente y punto de venta correctos.
- La numeración es correlativa y ante incertidumbre primero se consulta/reconcilia.
- Timeout ambiguo nunca autoriza emitir con número nuevo a ciegas.
- Solicitudes deben ser idempotentes y auditables dentro de Maitre.
- Certificados, claves y tickets se almacenan cifrados en secret manager.
- Homologación y producción no comparten credenciales, URLs ni configuración.
- Tablas paramétricas ARCA se sincronizan/versionan; no son constantes eternas.
- Libro IVA no se marca presentado sin confirmación verificable.
- Queda prohibido automatizar Portal IVA mediante scraping o clave fiscal delegada.
