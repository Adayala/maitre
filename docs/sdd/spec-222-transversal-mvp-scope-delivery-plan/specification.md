# Especificación — SPEC-222

## 1. Usuarios primarios

| Persona | Necesidad validada por el MVP |
| --- | --- |
| Admin/manager | configurar sucursal, salón, mesas, menú y equipo |
| Maître/mozo | abrir visita, asignar mesa, tomar pedido y solicitar cuenta |
| Cocina | recibir comanda y marcar preparación/listo |
| Caja | revisar cuenta y registrar pago manual |

Guest participa inicialmente mediante consulta de menú QR. Pedido QR, reserva y pago digital se validan después de estabilizar el recorrido interno.

## 2. Restricciones de alcance

- Una organización demo, una marca, una entidad fiscal y una sucursal visibles en el happy path.
- Un salón, conjunto pequeño de mesas y uno/dos centros de preparación.
- Roles predefinidos; no existe editor arbitrario de permisos.
- Un menú activo con categorías, productos, precios, alérgenos y disponibilidad básica.
- Moneda ARS y locale `es-AR`; arquitectura conserva tipos portables.
- Sin billing automático: plan/entitlements se aprovisionan por administración/seed controlado.
- Sin hardware fiscal, impresoras o terminales propietarias en MVP Demo.

La base sigue tenant-scoped y se prueba con dos tenants para no introducir deuda estructural aunque la UI demuestre uno.

## 3. Recorrido mínimo autoritativo

```text
Admin configura sucursal, salón, mesas, menú y usuarios
  → Manager abre jornada
  → Mozo abre visita y asigna mesa
  → Mozo crea y envía pedido
  → Kitchen recibe comanda
  → Kitchen inicia y marca ítems listos
  → Mozo marca entrega y solicita cuenta
  → Sistema genera cuenta
  → Caja registra pago manual
  → Visita se cierra y mesa queda liberada
  → Dash muestra resultado y auditoría básica
```

Una acción no se completa mediante edición directa de base, dashboard del proveedor o scripts ad hoc durante la demo de aceptación.

## 4. Incrementos

### I0 — Walking skeleton

- monorepo, CI, Vercel, Supabase y configuración;
- login, contexto tenant/branch y Dash shell;
- health, telemetría, seguridad y backup mínimo;
- contratos, diseño y gates de SPEC-207–221.

Salida: `SPEC-213` completa y desplegada.

### I1 — Setup operativo

- tenant/brand/fiscal entity/branch mínimos;
- salón y mesas;
- users, memberships y roles predefinidos;
- menú, categorías y productos;
- setup status y audit básico;
- entitlements aprovisionados sin checkout.

Salida: un admin completa configuración sin tocar DB.

### I2 — Floor

- jornada abierta/cerrada simplificada;
- estado de mesas derivado;
- visita espontánea y asignación de mesa;
- pedido/items con snapshot de precio/alérgenos relevante;
- idempotencia y estados válidos;
- Floor tablet responsive.

Salida: un mozo envía un pedido aceptado por servidor.

### I3 — Kitchen

- generación durable de KitchenTicket mediante outbox;
- vista por centro/estación mínima;
- pending → in progress → ready → delivered;
- actualización visible en Floor;
- manejo de duplicados y reconexión básica.

Salida: cocina y salón convergen sin polling agresivo ni duplicación.

### I4 — Cuenta y cierre

- cuenta generada desde ítems aceptados;
- subtotal/impuestos/total según specs aprobadas;
- pago manual único por total en el primer corte;
- cierre de cuenta/visita y liberación de mesa;
- audit y resumen en Dash.

Salida: recorrido operativo completo con invariantes monetarias y sin gateway.

### I5 — Guest QR read-only

- QR/link firmado o no adivinable según threat model;
- menú público activo, branch context y alérgenos;
- cache/read-only y accesibilidad mobile;
- sin pedido, cuenta o pago Guest.

Salida: cliente consulta menú sin exponer datos internos.

### I6 — Readiness de piloto y fiscalidad

- hardening ASVS, DR, observabilidad, soporte y offline requerido;
- ARCA facturación electrónica mediante `SPEC-145` y specs fiscales asociadas;
- Libro IVA: export/consulta viable según el spike y obligación confirmada;
- homologación, certificados y reconciliación;
- plataforma/términos comerciales y presupuesto aprobados.

Salida: decisión go/no-go para un piloto real. I6 no se activa sólo por completar código.

## 5. Must / Should / Later

### Must para MVP Demo

- I0–I4 completos;
- Guest QR read-only si la validación requiere experiencia visible al cliente;
- aislamiento tenant, RBAC, audit de acciones sensibles;
- idempotencia de pedido/cuenta/pago registrado;
- accesibilidad y dispositivos objetivo;
- métricas del recorrido y feedback estructurado de prueba.

### Should antes del Pilot

- operación offline limitada de Floor/Kitchen según conectividad observada;
- ARCA/IVA si se emiten comprobantes reales con Maitre;
- división/parcialidad de cuenta sólo si el restaurante piloto no puede operar sin ella;
- impresión/hardware mediante adapter si es requisito del piloto.

### Later

- reservas, waitlist y recordatorios;
- QR ordering y pago digital;
- suscripción/billing automatizado;
- múltiples sucursales en UX avanzada;
- turnos/nómina laboral completa;
- reputación y conectores externos;
- analítica avanzada, Rewind, Live, Ahead y Autopilot.

## 6. Recortes explícitos por dominio

| Dominio | Incluido | Diferido |
| --- | --- | --- |
| Organization | estructura mínima | herencia/config avanzada multi-brand |
| Identity | login, membership, roles fijos | roles personalizados, SSO enterprise |
| Subscription | entitlements seed/admin | checkout, facturación SaaS, upgrades self-service |
| Catalog | menú/categoría/producto | combos, inventario, pricing avanzado |
| Floor | visita/mesa/pedido | reservas, waitlist, splits complejos |
| Kitchen | ticket/ítems/estado | routing avanzado, tiempos predictivos |
| Cash | cuenta + pago manual total | gateway, parciales, conciliación avanzada |
| Fiscal | gate de piloto ARCA/IVA | impresoras y múltiples proveedores |
| Guest | menú QR read-only | pedidos, asistencia, cuenta/pago, feedback |
| Analytics | métricas operativas mínimas | BI, ML e IA |

## 7. Datos y ambientes

### MVP Demo

- datos completamente sintéticos;
- free tiers y sin uso comercial según términos vigentes;
- resets/seeds permitidos y documentados;
- no CUIT/certificados/identidades reales;
- URL demo estable con acceso controlado donde corresponda.

### MVP Pilot

- tenant y usuarios reales sólo después del gate I6;
- plan comercial/plataforma elegible aprobado;
- DPA/términos, privacidad y retención revisados;
- backups/restore, soporte, incidentes y responsables activos;
- credenciales/certificados segregados y rotables;
- alcance funcional contractual coincide con lo realmente soportado.

## 8. Métricas de validación

Las metas se fijan con baseline, pero el MVP captura:

- tiempo de configuración hasta primera jornada;
- tiempo/taps para abrir visita, enviar pedido y cambiar estados;
- comandos rechazados, duplicados, conflictos y retries;
- tiempo pedido → kitchen → ready → delivered;
- discrepancias de cuenta y correcciones manuales;
- completitud del recorrido sin soporte técnico;
- errores, latencia, disponibilidad y recuperación;
- feedback cualitativo por rol y severidad del problema.

No se usa cantidad de features o líneas de código como medida de éxito.

## 9. Gate por incremento

Cada incremento requiere:

- spec aprobada y trazabilidad a tareas/tests;
- happy path y fallos críticos demostrados;
- auth/tenant/RBAC negativo;
- lint, typecheck, tests, coverage y Sonar;
- accesibilidad y viewport relevante;
- logs, métricas, trazas y runbook mínimo;
- migración/rollback compatibles;
- presupuesto de free tier medido;
- demo con datos sintéticos y decisión de aprendizaje.

No se comienza un incremento si el anterior deja una deuda P0 que invalida su base.

## 10. Control de alcance

Una capacidad entra al MVP sólo si:

1. desbloquea el recorrido autoritativo;
2. evita riesgo legal/seguridad/operación del hito actual;
3. es necesaria para validar una hipótesis con usuario;
4. no puede simularse honestamente mediante datos/configuración sintética.

Toda adición indica qué capacidad sale, qué fecha/costo cambia o qué riesgo justifica ampliar alcance. “Ya existe una spec” no implica prioridad de implementación.
