# Plan — SPEC-145

## Implementado

- cliente TypeScript reutilizable para WSAA/WSFEv1 y adapter Maitre;
- separación explícita entre homologación, producción y simulación local;
- auth WSAA, cache de ticket, `FEDummy`, consulta, numeración oficial y solicitud CAE;
- normalización de faults, rechazos y resultados ambiguos;
- asociación tenant/suscripción/fiscal entity/branch/POS con evidencia de migración;
- login con credenciales y `FEDummy` validados en homologación.

## Pendiente antes de producción

- aprobar el boundary, perfiles fiscales soportados y revisión competente;
- completar identidad/domicilio productivos y certificado definitivo;
- verificar el punto de venta productivo con evidencia y revisión de cuatro ojos;
- implementar coordinación distribuida de secuencia y cache de ticket cifrado/compartido;
- completar matriz de homologación de Factura A/B/C y notas crédito/débito;
- aprobar runbook, monitoreo, rotación de credenciales y rollout controlado;
- cerrar el alcance de Libro IVA Digital y capacidades complementarias.
