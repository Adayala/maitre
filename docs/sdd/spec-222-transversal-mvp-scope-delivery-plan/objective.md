# Objetivo — SPEC-222

Validar que Maitre reduce fricción en el servicio de un restaurante mediante un recorrido desde configuración hasta cierre de visita, evitando construir capacidades que no prueban esa hipótesis.

## Hipótesis principal

Un equipo pequeño puede configurar una sucursal y coordinar salón, pedido, cocina y cuenta con menos ambigüedad y mejor trazabilidad que usando herramientas separadas o comunicación informal.

## Resultado del MVP Demo

Con datos sintéticos, un administrador configura la operación y tres roles completan un servicio simulado en web/tablet dentro de free tiers, con evidencia de calidad, seguridad y observabilidad.

## Resultado del MVP Pilot

Una sucursal real completa el recorrido acordado bajo plataforma, soporte, fiscalidad, privacidad, backup y términos comerciales aprobados. Pilot no significa producción general ni SLA definitivo.

## No objetivo

Demostrar reservas, nómina, reputación, IA, pagos online, marketplace, contabilidad e integraciones múltiples en la primera entrega.

## Criterios de aceptación

### CAD-222-01 — El MVP valida una hipótesis de servicio concreta y no una lista difusa de features

El alcance se define por la hipótesis de reducir fricción y mejorar trazabilidad en el servicio. Cada capacidad implementada debe apoyar esa validación o quedar explícitamente fuera.

### CAD-222-02 — El MVP Demo recorre configuración, operación y cierre con datos sintéticos dentro del perímetro gratuito

El demo permite configurar la operación y simular un servicio completo con roles acotados y evidencia de calidad, seguridad y observabilidad sin salir del perímetro MVP aprobado.

### CAD-222-03 — El MVP Pilot es un gate separado, con condiciones reales adicionales y sin promesas de producción general

Pilot requiere plataforma, fiscalidad, privacidad, soporte y términos comerciales aprobados. No se confunde con disponibilidad general ni SLA definitivo.

### CAD-222-04 — El scope se gestiona por incrementos y no permite placeholders engañosos

Toda feature fuera de I0–I6 o fuera de incremento aprobado requiere change decision explícita. No se aceptan botones, endpoints o superficies falsas para módulos diferidos.

### CAD-222-05 — La calidad y trazabilidad son obligatorias en cada incremento del MVP

Cada incremento conserva spec, tests, gates, auth/RBAC, migración, deploy, rollback y observabilidad suficientes para sostener el ritmo sin deuda invisible.

### CAD-222-06 — El go/no-go del pilot conserva riesgos, owners y criterios de salida verificables

Antes de pasar del demo al pilot, los riesgos, hardware, soporte, offline, requisitos del restaurante y fiscalidad deben quedar explícitos con owners y criterio de salida.
