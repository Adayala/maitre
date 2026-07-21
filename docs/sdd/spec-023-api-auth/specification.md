# Especificación — SPEC-023

## Endpoints

### POST /auth/login
```
Request:
{ "email": "string", "password": "string" }

Response (200):
{ 
  "data": { 
    "token": "JWT",
    "user": { id, email, name }
  },
  "meta": { }
}
```

### POST /auth/password-reset
Email con reset link.

### POST /auth/verify-email
Token verification.
