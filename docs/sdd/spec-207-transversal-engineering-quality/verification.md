# Verificación — SPEC-207

## Criterios

### CAD-207-01 — Todo comportamiento nuevo parte de specs aprobadas y trazables

- [ ] un PR válido enlaza una spec `READY_FOR_IMPLEMENTATION` y pasa todos los gates;
- [ ] el cambio enlaza criterios de aceptación concretos;
- [ ] cambios sin trazabilidad aprobada fallan cerrado.

### CAD-207-02 — Los quality gates son automáticos, reproducibles y equivalentes entre local y CI

- [ ] un error de lint bloquea el merge;
- [ ] un error de tipos bloquea el merge;
- [ ] un test fallido bloquea el merge;
- [ ] cada job CI ejecuta un script raíz equivalente disponible localmente.

### CAD-207-03 — La calidad estructural incluye límites de arquitectura, dependencias y duplicación útil

- [ ] la cobertura y duplicación de código nuevo cumplen los umbrales;
- [ ] el build React.js y Node.js se reproduce fuera de Vercel;
- [ ] exclusiones de análisis están versionadas y justificadas.

### CAD-207-04 — Excepciones y deuda técnica se gobiernan con owner, riesgo y vencimiento

- [ ] una excepción documentada incluye issue, responsable y vencimiento;
- [ ] cada canario falla únicamente el gate esperado y luego se elimina;
- [ ] la deuda técnica conserva follow-up verificable.

### CAD-207-05 — Secretos, vulnerabilidades y drift documental fallan cerrado

- [ ] una vulnerabilidad crítica/alta nueva bloquea el merge;
- [ ] un secreto de prueba detectado bloquea el merge;
- [ ] una referencia SDD rota bloquea el merge;
- [ ] `main` no admite push directo que evada las protecciones acordadas.

### CAD-207-06 — La evidencia enlaza spec, implementación, validación y release

- [ ] un Quality Gate Sonar fallido bloquea el merge;
- [ ] Sonar no se marca configurado hasta que SPK-05 confirme modalidad gratuita y reproducible;
- [ ] rules por paths no omiten un gate aplicable al cambio;
- [ ] la evidencia enlaza validación y release de forma auditable.
