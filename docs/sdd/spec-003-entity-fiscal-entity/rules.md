# Rules — SPEC-003

## Invariantes

### 1. CUIT único por tenant
Unique constraint (tenant_id, cuit).

### 2. Certificado vigente para emitir
```
SELECT * FROM fiscal_entities 
WHERE status = 'ACTIVE' AND certificate.valid_to > NOW()
```

### 3. Un certificado activo
Cuando se carga nuevo certificado, el anterior pasa a histórico (archived).

### 4. Renovación de certificado
```
1. Cargar nuevo certificado (certificate_id_new)
2. Validar valid_to > now
3. Marcar certificado viejo como inactive
4. Cambiar fiscal_entity.certificate_id a nuevo
```

## Cambios permitidos

### Crear entidad fiscal
Precondición: tenant existe, CUIT no existe en tenant
Acción: Crear con status ACTIVE
Postcondición: Entidad fiscal sin certificado (PENDING)

### Cargar certificado
Precondición: Certificado X.509 válido
Acción: Guardar en KMS, registrar en fiscal_certificates
Postcondición: Certificado almacenado, fecha expiración controlada

### Cambiar status a INACTIVE
Las sucursales que usan esta entidad dejan de poder facturar.

### Archivar
Status → ARCHIVED (read-only)
