# Tasks — SPEC-002

## Fase 1: Preparación

- [ ] **TASK-1:** Diseñar schema brands table
  - Subtask 1.1: Definir fields
  - Subtask 1.2: Indexes
  - Subtask 1.3: Foreign keys
  - Entrega: schema.sql
  - Estimación: 1h

- [ ] **TASK-2:** Diseñar Brand entity (Go struct)
  - Subtask 2.1: Fields
  - Subtask 2.2: Validation methods
  - Subtask 2.3: Slug generation
  - Entrega: brand.go
  - Estimación: 2h

## Fase 2: Implementación

- [ ] **TASK-3:** Crear Brand repository (CRUD)
  - Subtask 3.1: Create
  - Subtask 3.2: Read by ID
  - Subtask 3.3: Update
  - Subtask 3.4: List by tenant
  - Entrega: brand_repository.go
  - Estimación: 6h

- [ ] **TASK-4:** Crear Brand API endpoints
  - Subtask 4.1: POST /brands
  - Subtask 4.2: GET /brands/:id
  - Subtask 4.3: PATCH /brands/:id
  - Subtask 4.4: GET /brands (list)
  - Entrega: brand_handler.go
  - Estimación: 8h

- [ ] **TASK-5:** Emitir BrandCreated event
  - Subtask 5.1: Define event struct
  - Subtask 5.2: Publish on create
  - Entrega: brand events
  - Estimación: 2h

## Fase 3: Testing

- [ ] **TASK-6:** Unit tests
  - Coverage: > 80%
  - Estimación: 4h

- [ ] **TASK-7:** Integration tests
  - Test API endpoints
  - Test isolation by tenant
  - Estimación: 4h

## Fase 4: Review

- [ ] **TASK-8:** Code review + fixes
  - Estimación: 2h

**Total estimación: ~29h (~4 días)**
