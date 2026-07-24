# Reglas — SPEC-058

- El cliente no aporta totales autoritativos.
- Money usa minor units/currency; Check no es Invoice.
- SETTLED exige balance cero y cero Payment ambiguos.
- Ajustes son append-only; MVP no ofrece split.
- Tenant, sucursal y actor derivan del contexto; Visit/Check fuera de alcance responde `404`.
- Ajustes aceptan type/reason y entrada monetaria permitida, pero no reemplazan líneas ni
  totales.
- `409` expresa unicidad/conflicto, `412` revisión y `422` ciclo de vida o fuentes incoherentes.
- Settle/void y outbox comparten la transacción autoritativa.
