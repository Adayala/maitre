# Contrato de entidad — SPEC-112 Shift Assignment

ShiftAssignment vincula un empleado con un turno, rol y estación opcional, con estado
PROPOSED/CONFIRMED/DECLINED/CANCELLED. Es único por shift y employee, versionado para evitar
doble confirmación y conserva actor, motivo e historial. La creación valida pertenencia,
habilitación y conflictos según política laboral. Tests cubren reasignación, solapamientos,
cancelación del turno, revocación del empleado y aislamiento entre tenants.
