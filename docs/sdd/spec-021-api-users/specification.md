# Especificación — SPEC-021

## Endpoints

### POST /users (Invitar)
```
Request:
{
  "email": "string",
  "name": "string"
}

Response (201):
{
  "data": { id, email, name, status: "INVITED" },
  "meta": { correlationId }
}
```

### GET /users
Listar usuarios del tenant.

### GET /users/:id
Detalle usuario.

### PATCH /users/:id
Actualizar name, estado.
