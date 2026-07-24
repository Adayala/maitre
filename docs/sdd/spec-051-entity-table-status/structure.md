# Structure — SPEC-051

No existe almacenamiento autoritativo de TableStatus. La proyección consume:

- Table y CapacityPolicyVersion aplicable;
- Occupancy ACTIVE y revisión de Visit/Check necesaria para distinguir `PAYING`;
- Reservation confirmada y su ventana temporal;
- señales autoritativas de limpieza y bloqueo/mantenimiento;
- `asOf` explícito y revisiones de todas las fuentes.

Una caché materializada opcional conserva `status`, `reasonCode`, `relatedResource`,
`sourceRevisions`, `asOf` y freshness. Su contenido puede acelerar lecturas, pero nunca
autorizar una mutación.
