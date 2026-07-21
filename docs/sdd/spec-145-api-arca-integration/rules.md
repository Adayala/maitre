# RULES — SPEC-145

1. Cada solicitud fiscal se ejecuta bajo la CUIT, certificado, ambiente y punto de venta correctos.
2. La numeración es correlativa por punto de venta y tipo de comprobante; ante incertidumbre se consulta el último número autorizado antes de reintentar.
3. Un timeout después de enviar una solicitud no autoriza a emitir otra numeración: primero se reconcilia con `FECompConsultar`/último autorizado.
4. Las solicitudes deben ser idempotentes dentro de Maitre y conservar request, response, errores y eventos de ARCA.
5. Certificados y claves privadas se almacenan cifrados en un gestor de secretos, con rotación, auditoría y mínimo privilegio.
6. Homologación y producción no comparten credenciales, URLs ni datos de configuración.
7. Tablas paramétricas de ARCA se sincronizan y versionan; no se codifican como constantes eternas.
8. Maitre no declara presentado un Libro IVA Digital sin confirmación verificable del usuario o un canal oficial futuro.
9. La exportación del Libro IVA debe indicar versión de diseño, período, CUIT, hashes y totales de control.
10. Toda decisión impositiva requiere validación de un profesional tributario y revisión de normativa vigente.
11. Está prohibido automatizar Portal IVA mediante scraping o manejo de credenciales de clave fiscal.
