# Objetivo — SPEC-093

Definir la API de Special Requests como registro tipado, consciente del consentimiento y con aceptación operativa
explícita.

## Criterios de aceptación

### CAD-093-01 — La API define endpoints, tipos, targets y ciclo de vida con claridad

endpoints, tipos de request, targets permitidos y ciclo de vida quedan definidos con claridad.

### CAD-093-02 — Crear una solicitud no implica aceptación operativa

crear una solicitud no implica aceptación; aceptar/rechazar requiere actor operativo
autorizado.

### CAD-093-03 — Texto libre, purpose y retención quedan acotados y tipados

texto libre, purpose, consentimiento, visibilidad y retención quedan acotados y tipados.

### CAD-093-04 — Special requests no sustituyen autoridad clínica o de seguridad

el contrato separa special requests de alergias/códigos de seguridad y evita usar texto
como autoridad clínica.

### CAD-093-05 — Eventos, logs y respuestas redactan según audiencia y permiso

eventos, logs y respuestas aplican redacción según permiso y audiencia.

### CAD-093-06 — La aprobación exige evidencia de contenido, rechazo y retención

La aprobación exige fixtures de contenido malicioso, longitud, concurrencia, rechazo,
retención y aislamiento.
