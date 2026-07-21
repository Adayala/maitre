# OBJECTIVE — SPEC-145

## Objetivo

Determinar qué integraciones fiscales oficiales de ARCA puede consumir Maitre para emitir comprobantes electrónicos, asistir la registración del Libro IVA Digital y validar datos fiscales sin depender de scraping ni automatización de interfaces web.

## Preguntas del spike

1. ¿Existe un servicio oficial para obtener CAE/CAEA y emitir facturas, notas de crédito y notas de débito?
2. ¿Cómo se autentica un tenant y cómo se separan homologación y producción?
3. ¿Existe una API pública para generar o presentar Libro IVA Digital?
4. ¿Qué alternativa oficial permite automatizar la preparación del Libro IVA?
5. ¿Qué otros servicios de ARCA aportan valor a Maitre?

## Decisión esperada

Definir un conector fiscal multi-tenant que almacene certificados de forma segura, abstraiga SOAP detrás de contratos internos y preserve trazabilidad completa de cada solicitud fiscal.
