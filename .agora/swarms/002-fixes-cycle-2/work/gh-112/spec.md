# Spec: bloquear reserva sin mesas

`POST /v1/branches/:branchId/reservations` rechaza antes de persistir cuando la sucursal activa no tiene mesas. La consulta queda limitada al branch y tenant autorizados y devuelve Problem Details estable en español.
