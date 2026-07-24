# Objetivo — SPEC-111

Definir Shift como agregado temporal tenant/branch-scoped que delimita una ventana operativa de trabajo con inicio, fin, estado y política de cierre explícitos.

## Criterios de aceptación

### CAD-111-01 — Shift pertenece a un Tenant y Branch con timezone y business date inequívocos

Cada Shift identifica tenant, branch, timezone IANA y fecha operativa aplicable. Los bordes temporales no dependen de la hora local del dispositivo.

### CAD-111-02 — El lifecycle del Shift distingue planificación, apertura, cierre y cancelación

Los estados de Shift y sus transiciones autorizadas se declaran explícitamente. El cierre o cancelación no pueden inferirse por ausencia de actividad.

### CAD-111-03 — El Shift no reemplaza payroll, HR ni identidad laboral global

Shift modela operación temporal y presencia de trabajo, no compensación, contrato laboral ni perfil global de la persona.

### CAD-111-04 — El cierre del Shift valida dependencias operativas aprobadas sin alterar sus autoridades

Cerrar un Shift puede requerir revisar assignments, cajas o sesiones activas, pero no completa automáticamente dominios ajenos ni borra evidencia.

### CAD-111-05 — La concurrencia sobre open/close/cancel usa revisiones explícitas e idempotencia

Open, close y cancel deben resistir retries y comandos concurrentes sin producir dos shifts activos incompatibles o cierres ambiguos.

### CAD-111-06 — Timezone, DST, auditoría e isolation de Shift quedan cubiertos por evidencia verificable

La aprobación exige fixtures de DST, business date, revisiones concurrentes, retries, auditoría y aislamiento cross-tenant/cross-branch.
