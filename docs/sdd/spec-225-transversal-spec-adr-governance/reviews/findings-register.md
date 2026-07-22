# Registro accionable de findings bloqueantes

Proyección curada de los blockers que ordenan a los demás. No cambia automáticamente su estado:
la resolución se registra primero en el informe fuente y en la metadata autoritativa aplicable.

| Orden | Finding | Resultado requerido | Desbloquea |
| --- | --- | --- | --- |
| 1 | PLAT-REV-001 | owner/reviewer y approvals verificables | todos los bloques |
| 2 | PLAT-REV-002, ID-REV-001 | DAG acíclico de specs | ruta crítica y tooling SDD |
| 3 | PLAT-REV-003 | auditoría retroactiva commit↔spec↔tests | gobernanza de implementación existente |
| 4 | PLAT-REV-004/005 | spikes I0 y decisión ADR-002/003/004 | datos, identidad, toolchain y UI |
| 5 | SUB-REV-002 | catálogo autoritativo de servicios | entitlement, cuotas y setup |
| 6 | CAT-REV-002/003 | identidad Product y disponibilidad separadas | QR Menu y Ordering |
| 7 | RES-CORE-REV-002 | autoridad/constraint de capacidad | confirmación, cancelación y seating |
| 8 | ORD-CORE-REV-002/003, KIT-REV-001/002 | máquina y ownership únicos | Ordering/Kitchen APIs y eventos |
| 9 | FLOOR-REV-003, CASH-REV-002/003 | ledger financiero + CashSession | pagos, caja y conciliación |
| 10 | FISC-REV-002/003/004 | Invoice lifecycle, punto de venta y fuentes | ARCA, numeración, QR y Libro IVA |
| 11 | WF-REV-002/003 | relación laboral y policy provenance | turnos, fichadas y compliance |
| 12 | REP-REV-002/003 | fórmula y spikes de plataformas | reputación externa |
| 13 | INT-REV-002/003/004 | webhooks separados, ownership y spikes | conectores/sync |
| 14 | AI-REV-002/003/004 | data registry, runtime/costo y action risks | ML/LLM/Autopilot |

## Estados del finding

```text
OPEN → IN_REVIEW → RESOLVED
  └──────────────→ ACCEPTED_EXCEPTION
```

- `OPEN`: evidencia bloqueante vigente.
- `IN_REVIEW`: existe propuesta/PR y owner; todavía bloquea.
- `RESOLVED`: reviewer verificó criterios contra commit exacto.
- `ACCEPTED_EXCEPTION`: decisión explícita con owner, mitigación y vencimiento; findings críticos
  de seguridad, aislamiento, dinero o fiscalidad no se exceptúan sin autoridad competente.

## Regla de actualización

Cada cambio registra finding ID, commit, evidencia, reviewer y efecto sobre dependientes. Cerrar
un finding padre no cierra hijos automáticamente. Si cambia un contrato incompatible, se reabre
la revisión de consumidores y se actualiza este orden sólo cuando la dependencia fue comprobada.
