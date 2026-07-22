# Contrato de entidad — SPEC-113 Time Entry

TimeEntry registra clock-in/clock-out reales de un empleado, sucursal y asignación opcional,
con fuente, timezone, estado OPEN/CLOSED y versión. Sólo existe una entrada abierta por Employment
y tenant; las correcciones son TimeAdjustment append-only y requieren actor, motivo y aprobación,
sin convertir ADJUSTED en un estado que oculte el original. Tests cubren doble marcación, DST,
trabajo sin turno, concurrencia, ajustes y aislamiento.
