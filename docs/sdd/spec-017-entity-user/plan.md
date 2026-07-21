# Plan — SPEC-017

## Componentes

- User entity
- users table (FK tenant)
- Password hashing (bcrypt)
- Email verification flow
- POST /users (invite)
- GET /users/:id
- PATCH /users/:id (update)

## Dependencias

**Must be:** SPEC-001 Tenant

**Depends:** SPEC-021 Users API
