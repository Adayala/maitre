# Decisiones — SPEC-222

## Decisiones

- El roadmap original describe visión/fases; esta spec define el corte implementable inmediato.
- Reservas no son necesarias para probar una visita espontánea y se difieren.
- QR ordering agrega concurrencia, abuso y UX Guest antes de validar cocina/salón; primero se ofrece menú read-only.
- Un pago manual prueba la cuenta sin integrar un gateway ni tocar datos de tarjeta.
- ARCA/IVA permanece estratégico y obligatorio si Maitre emite en un piloto, pero no bloquea una demo sintética.
- Offline completo se prioriza con evidencia de conectividad del piloto; la arquitectura ya lo soporta mediante SPEC-218.

## Riesgos

- Confundir documentación completa con necesidad inmediata.
- Intentar entregar las seis apps a la vez.
- Presentar demo como producto operativo/comercial.
- Construir suscripciones/billing antes de validar operación.
- Posponer aislamiento, seguridad o idempotencia por usar un único tenant visible.
- Incluir fiscalidad real sin homologación y soporte.

## Primera expansión candidata

Después del recorrido core, se elige una sola línea mediante evidencia:

1. reservas/adquisición;
2. Guest QR ordering;
3. pagos digitales/división de cuenta;
4. fiscalidad/IVA ampliada;
5. offline/hardware local.

La elección actualiza esta spec y las prioridades antes de escribir implementación adicional.
