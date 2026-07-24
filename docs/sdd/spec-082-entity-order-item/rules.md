# Rules — SPEC-082

- `quantity` debe ser positiva y consistente con la unidad comercial del producto snapshot.
- Snapshot congelado no cambia por archivado o edición futura del catálogo.
- Cancelación nunca elimina el item ni altera revisiones históricas; crea ajuste explícito.
- Eventos duplicados o fuera de orden no retroceden estados terminales ni duplican entrega.
- Notas libres tienen longitud y sanitización acotadas; códigos de alergia/seguridad son tipados.
- Item no transporta PII innecesaria ni datos sensibles de pago.
- Scope heredado del Order debe coincidir; incoherencia cross-tenant/branch falla cerrado.
