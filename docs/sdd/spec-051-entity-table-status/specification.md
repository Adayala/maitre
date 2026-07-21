# Especificación — SPEC-051

## Tipo de spec
Derived Entity (no se almacena en BD)

## Definición formal
Estado en tiempo real de una mesa, calculado dinámicamente desde:
- Visitas activas (OPEN/SERVED/PAYING)
- Reservas futuras
- Bloques administrativos
- Limpieza programada

No se almacena en tabla; se calcula en cada lectura.

## Cálculo de Status

```
IF existe bloque administrativo (block.end_time > NOW)
  → BLOCKED

ELSE IF existe visita con status = PAYING
  → PAYING

ELSE IF existe visita con status IN (OPEN, SERVED)
  → OCCUPIED

ELSE IF mesa_id EN limpieza (cleaning_log.end_time > NOW)
  → CLEANING

ELSE IF existe reserva confirmada para HOY (reservation.date = TODAY)
  → RESERVED

ELSE
  → AVAILABLE
```

## Valores posibles

- **AVAILABLE** — Lista para nuevas visitas
- **OCCUPIED** — Visitantes presentes
- **RESERVED** — Reserva confirmada
- **PAYING** — Esperando pago
- **CLEANING** — En limpieza
- **BLOCKED** — Bloqueada administrativamente

## Implementación

### Query SQL

```sql
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM blocks b WHERE b.table_id = t.id AND b.end_time > NOW()) THEN 'BLOCKED'
    WHEN EXISTS (SELECT 1 FROM visits v WHERE v.table_id = t.id AND v.status = 'PAYING') THEN 'PAYING'
    WHEN EXISTS (SELECT 1 FROM visits v WHERE v.table_id = t.id AND v.status IN ('OPEN', 'SERVED')) THEN 'OCCUPIED'
    WHEN EXISTS (SELECT 1 FROM cleaning_logs cl WHERE cl.table_id = t.id AND cl.end_time > NOW()) THEN 'CLEANING'
    WHEN EXISTS (SELECT 1 FROM reservations r WHERE r.table_id = t.id AND r.reservation_date >= CURRENT_DATE AND r.status NOT IN ('CANCELLED', 'NOSHOW')) THEN 'RESERVED'
    ELSE 'AVAILABLE'
  END as status
FROM tables t
WHERE t.id = ?;
```

### API Response

```json
{
  "id": "mesa-uuid",
  "number": "1",
  "capacity": 4,
  "status": "OCCUPIED",
  "calculated_at": "ISO8601"
}
```

## Ventajas

- ✅ Siempre sincronizado (no requiere actualizaciones)
- ✅ Una fuente de verdad (visitas + reservas + bloques)
- ✅ Reduce bugs (no hay inconsistencias estado)
- ✅ Performance: índices en visits, reservas, bloques
