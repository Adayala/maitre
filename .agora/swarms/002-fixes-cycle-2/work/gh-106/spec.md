# Spec: capacidad real de reservas

La disponibilidad y las transiciones de reservas se basan en mesas reales de la sucursal activa, no sólo en la capacidad declarada del salón. Crear o confirmar sin mesas responde 409 con código estable `RESERVATION_CAPACITY_UNAVAILABLE`, sin consultar ni revelar datos de otro tenant. Se prueban creación, confirmación y seating con fixture aislado.
