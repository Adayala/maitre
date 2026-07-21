# Objetivo — SPEC-017

## Propósito

Usuario es persona que accede al sistema. Email, nombre, rol, estado, contraseña hash.

## Resultado esperado

1. ✅ Usuario creado con email, nombre, rol
2. ✅ Password almacenado securamente (bcrypt)
3. ✅ Usuario puede cambiar password
4. ✅ Estados: INVITED, ACTIVE, DEACTIVATED
5. ✅ API CRUD: POST (invite), GET, PATCH (update)
6. ✅ Aislación por tenant

## Criterios de aceptación

### CAD-1: Invitar usuario
POST /users (invite) sin password inmediato.
Email enviado con link reset password.

### CAD-2: Password bcrypt
Almacenar hash, nunca plaintext.

### CAD-3: API CRUD
Endpoints: invite, get, update.

### CAD-4: Isolation
Usuarios aislados por tenant.
