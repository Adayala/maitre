# Rules — SPEC-017

## Invariantes

### 1. Email único per tenant
Unique constraint (tenant_id, email).

### 2. Password bcrypt
Always hash, never store plaintext.

### 3. Invitación antes de activación
User starts INVITED, debe verificar email antes de ACTIVE.

### 4. Status transiciones
INVITED → ACTIVE → DEACTIVATED (reversible)

## Cambios permitidos

### Invitar usuario
- Precondición: tenant, email no existe en tenant
- Acción: crear INVITED, enviar email
- Postcondición: usuario listo para confirmar
