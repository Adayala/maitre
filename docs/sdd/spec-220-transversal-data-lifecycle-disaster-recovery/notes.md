# Decisiones — SPEC-220

## Decisiones

- `pg_dump` es el mecanismo lógico portable inicial; backups administrados futuros pueden complementarlo, no eliminar automáticamente exports de salida.
- Los objetivos de demo priorizan costo cero y datos sintéticos. No se extrapolan a operación comercial.
- I0 no conserva dumps: usa rebuild desde Git/seed y un artefacto cifrado temporal para SPK-06.
- No existe destino durable gratuito aprobado; esto bloquea datos no regenerables, no el scaffold sintético.
- Objetos requieren pipeline separado aunque su metadata viva en PostgreSQL.
- Identidad puede requerir reautenticación si credenciales/factores no son exportables de forma soportada.
- Retención fiscal, laboral, privacidad y pagos requiere matriz con revisión especializada antes de fijar plazos.

## Triggers de upgrade

- primeros datos reales o piloto comercial;
- RPO menor a la frecuencia de export lógico;
- RTO incompatible con restore manual;
- necesidad de point-in-time recovery;
- volumen que exceda ventana/costo de dump;
- redundancia regional o SLA contractual;
- custodia/auditoría que el free tier no pueda ofrecer.

## Evidencia por ejercicio

- backup/manifest/hash seleccionados;
- commit y schema version;
- timeline y operador;
- destino aislado;
- checks ejecutados y resultados;
- RPO/RTO observado;
- pérdida o divergencia detectada;
- acciones, owner y vencimiento.

El registro canónico del primer ejercicio es `SPEC-226/evidence/SPK-06.md`; hasta ejecutarlo permanece `NOT_RUN`.
