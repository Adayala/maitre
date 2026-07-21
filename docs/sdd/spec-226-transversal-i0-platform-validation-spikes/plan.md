# Plan — SPEC-226

## Preparación

1. Aprobar SPEC-226 y timeboxes.
2. Asignar owner y reviewer de cada spike en el registro de evidencia.
3. Ejecutar SPK-01 local y gates locales de SPK-05 sin esperar recursos remotos.
4. Conectar recursos development sintéticos y expirables mediante integraciones/invitaciones.
5. Auditar variables por environment sin exportar valores a Git.
6. Fijar versiones candidatas desde fuentes oficiales.

## Ejecución

1. SPK-01 runtime/portabilidad.
2. SPK-02 pooling/conexiones.
3. SPK-03 Auth/mapping.
4. SPK-04 migrations/RLS.
5. SPK-05 toolchain/CI.
6. SPK-06 backup/exit.

SPK-01 y configuración local preceden al resto. SPK-02–04 reutilizan únicamente harness validado, no decisiones de dominio no aprobadas. SPK-02–04/06 permanecen `NOT_RUN` hasta disponer del recurso Supabase development.

## Decisión

1. Consolidar evidencia y gaps.
2. Actualizar ADR-002/003.
3. Actualizar TECH_STACK/specs si cambia selección.
4. Resolver I0-B03 o registrar alternativa.
5. Eliminar recursos/secretos temporales.
