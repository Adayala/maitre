# Verificación — SPEC-222

## Criterios

### CAD-222-01 — El MVP valida una hipótesis de servicio concreta y no una lista difusa de funcionalidades

- [ ] cada funcionalidad implementada pertenece a I0–I6 o tiene change decision;
- [ ] billing, reservas, reputación e IA no bloquean el recorrido core;
- [ ] el alcance conserva foco en la hipótesis validada.

### CAD-222-02 — El MVP Demo recorre configuración, operación y cierre con datos sintéticos dentro del perímetro gratuito

- [x] admin configura sin DB/dashboard de proveedor;
- [x] mozo completa visita/pedido desde tablet;
- [x] kitchen recibe y actualiza comanda sin duplicación;
- [x] caja registra pago manual y cierra visita;
- [x] Dash refleja resultado y auditoría;
- [ ] todo dato es sintético y el uso cumple términos free tier.

MVP-J-001 demuestra los primeros cinco puntos con builds reales y datos sintéticos. La parte de
datos sintéticos del sexto punto también está cubierta; la conformidad con términos/cuotas de un
servicio remoto permanece pendiente hasta seleccionar y aprobar los proveedores del Pilot. Consulta
[el cierre de gaps del MVP](../../operations/mvp-gap-closure-2026-07-30.md).

### CAD-222-03 — El MVP Pilot es un gate separado, con condiciones reales adicionales y sin promesas de producción general

- [ ] requerimientos del restaurante están acordados y dentro del scope;
- [ ] plataforma/términos permiten uso comercial;
- [ ] privacidad, seguridad ASVS, DR y soporte están aprobados.

### CAD-222-04 — El scope se gestiona por incrementos y no permite placeholders engañosos

- [ ] no existen botones/endpoints placeholder para módulos diferidos;
- [ ] UI single-branch conserva tests con dos tenants;
- [ ] superficies diferidas no engañan sobre alcance real.

### CAD-222-05 — La calidad y trazabilidad son obligatorias en cada incremento del MVP

- [ ] spec, tests y evidencia trazan el cambio;
- [ ] gates de CI/Sonar/seguridad/accesibilidad pasan;
- [ ] auth/RBAC/tenant negativos pasan;
- [ ] migración, deploy y rollback fueron verificados;
- [ ] métricas/runbook permiten detectar y recuperar fallos;
- [ ] feedback de rol/dispositivo queda registrado.

### CAD-222-06 — El go/no-go del pilot conserva riesgos, owners y criterios de salida verificables

- [ ] offline/hardware requerido fue probado;
- [ ] ARCA/IVA está homologado o explícitamente fuera del rol de Maitre en el piloto;
- [ ] go/no-go registra riesgos, owners y criterios de salida.
