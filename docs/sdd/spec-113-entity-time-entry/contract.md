# Contrato de entidad — SPEC-113 Time Entry

TimeEntry registra clock-in/clock-out reales de un empleado, sucursal y asignación opcional,
con fuente, timezone, estado OPEN/CLOSED/ADJUSTED y versión. Sólo existe una entrada abierta
por empleado y tenant; las correcciones no sobrescriben el original y requieren actor y
motivo. Tests cubren doble marcación, cruce de medianoche, DST, trabajo sin turno, concurrencia,
ajustes, precisión temporal y aislamiento entre tenants.
