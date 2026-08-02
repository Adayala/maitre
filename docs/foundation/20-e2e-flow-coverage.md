# Cobertura E2E de flujos entre aplicaciones

## Objetivo

Mantener una fuente única y verificable que responda cuatro preguntas:

1. qué recorridos de negocio están cubiertos hoy;
2. qué evidencia usa API y persistencia reales y cuál es sólo un contrato visual;
3. qué aplicaciones, roles, estados y límites multi-tenant participan;
4. qué falta implementar antes de afirmar que todos los flujos de Maitre están cubiertos.

Este documento complementa [los recorridos principales](07-core-journeys.md). No reemplaza las
especificaciones de dominio, API, eventos ni la cobertura granular exigida a cada aplicación.

## Regla para interpretar la evidencia

No todos los tests Playwright demuestran lo mismo.

| Nivel                     | Significado                                                                     | Puede simular API de producto | Demuestra persistencia real    |
| ------------------------- | ------------------------------------------------------------------------------- | ----------------------------- | ------------------------------ |
| `SMOKE`                   | La aplicación carga, enruta y expone una estructura accesible básica            | Sí                            | No                             |
| `UI_CONTRACT`             | La UI representa estados y envía el contrato esperado                           | Sí                            | No                             |
| `REAL_CROSS_APP`          | Varias aplicaciones observan el mismo estado mediante la API real               | No                            | Sí                             |
| `REAL_PERSISTENT_DATASET` | Igual que `REAL_CROSS_APP`, sobre el dataset de pruebas existente y sin cleanup | No                            | Sí, y los registros permanecen |
| `RESTART_DURABILITY`      | El estado sigue disponible después de reiniciar la API                          | No                            | Sí                             |

Un `SMOKE` o `UI_CONTRACT` no debe presentarse como prueba de integración de negocio. Un journey
real tampoco reemplaza los tests por aplicación de loading, empty, validation, error, permisos,
responsive, teclado y accesibilidad.

## Inventario automatizado actual

Estado relevado el **2 de agosto de 2026**:

| Grupo              |  Tests | Alcance principal                                                |
| ------------------ | -----: | ---------------------------------------------------------------- |
| Dash               |     16 | acceso, fiscal y explorer jerárquico; la mayoría son UI contract |
| Host               |      2 | acceso y alta de reserva como UI contract                        |
| Floor              |      3 | acceso, estados de mesa, visita y pedido como UI contract        |
| Kitchen            |      2 | acceso y ciclo de comanda como UI contract                       |
| Cash               |      3 | acceso, caja/conciliación y cobro pendiente como UI contract     |
| Guest              |      1 | experiencia pública básica                                       |
| Journeys multi-app |      4 | MVP-J-001, MVP-J-003, MVP-J-004 y MVP-J-005                      |
| Durabilidad        |      1 | relectura del checkpoint de MVP-J-001 después de reiniciar API   |
| **Total**          | **32** | 27 casos por app y 5 casos transversales/durabilidad             |

Archivos autoritativos:

- `tests/e2e/apps/<app>/`: smoke y cobertura propia de cada aplicación;
- `tests/e2e/journeys/mvp-j-001.spec.ts`: operación base de mesa a cierre;
- `tests/e2e/journeys/mvp-j-003.spec.ts`: aprovisionamiento y lectura transversal;
- `tests/e2e/journeys/mvp-j-004.spec.ts`: reservas y excepciones operativas/pagos;
- `tests/e2e/journeys/restart-durability.spec.ts`: persistencia posterior al reinicio.

## Journeys reales existentes

### MVP-J-001 — Mesa a cierre

Aplicaciones: **Dash → Floor → Kitchen → Cash → Floor → Dash**.

Demuestra:

- configuración operativa representativa desde Dash;
- mesa libre convertida en visita ocupada;
- un pedido real con un producto;
- comanda `RECEIVED → CLAIMED → IN_PROGRESS → READY → COMPLETED`;
- entrega visible desde Floor;
- solicitud de pago, captura exacta y un movimiento de caja;
- cierre de visita y liberación de mesa;
- auditoría correlacionada;
- denegación representativa para Tenant B;
- durabilidad separada después del reinicio de API.

No demuestra dos rondas, bebida, postre, división de cuenta ni emisión fiscal.

### MVP-J-003 — Configuración integral de una instancia

Aplicaciones: **API black-box → Dash → Host → Floor**.

Demuestra sobre una instancia nueva:

- tenant con suscripción STARTER;
- servicios/capacidades contratados para la sucursal;
- marca, sucursal, salón y mesa;
- usuarios con rol Maître, Waiter y Cashier;
- employments, jornada abierta y plaza asignada al mozo y a la mesa;
- lectura de la misma jerarquía y personal desde Dash;
- lectura de jornada/plaza desde Host;
- lectura de salón, mesa y plaza desde Floor;
- accesibilidad sin violaciones serias o críticas en las superficies observadas.

La creación inicial usa la API real como frontera pública y luego comprueba las UIs. Todavía no
prueba que cada alta pueda completarse exclusivamente haciendo clic en Dash ni que los tres
usuarios invitados inicien sesión en su aplicación correspondiente.

### MVP-J-004 — Reserva Guest, gestión Host y estado Floor

Aplicaciones: **Guest → Host → Floor → Guest → Host → Floor**.

Demuestra:

- consulta de disponibilidad live;
- creación de reserva por el cliente;
- confirmación y asignación de mesa desde Host;
- proyección `RESERVED` en Floor durante la ventana efectiva;
- confirmación visible para el cliente;
- registro de `NO_SHOW` y liberación de mesa;
- segunda reserva cancelada por Guest y visible en el historial de Host;
- accesibilidad WCAG A/AA sin violaciones serias o críticas.

No convierte una reserva confirmada en visita sentada ni valida seña, recordatorio o reasignación.

### MVP-J-005 — Excepción de cocina y pago dividido

Aplicaciones: **Floor → Kitchen → Floor → Cash → Floor → Dash**.

Demuestra:

- visita y cuenta reales sobre una mesa nueva;
- producto agotado enviado a cocina;
- `CLAIMED → IN_PROGRESS → ON_HOLD → IN_PROGRESS`;
- el cocinero no recibe una acción de cancelación que no está autorizado a ejecutar;
- cancelación gerencial con motivo y anulación del ítem agotado;
- pedido de reemplazo preparado, entregado y visible desde Floor;
- ajuste negativo que conserva el total correcto;
- intento de tarjeta fallido;
- captura parcial y saldo restante;
- cobro manual del remanente desde Cash;
- cuenta `SETTLED`, cierre de visita y mesa nuevamente libre;
- lectura final desde Dash;
- denegaciones Waiter→Payment, Cashier→Kitchen y Tenant B→Tenant A;
- accesibilidad sin violaciones serias o críticas.

No valida refund, propina, descuento, conciliación de cierre ni comprobante fiscal.

## Trazabilidad con los recorridos principales

| Journey de producto             | Evidencia real actual             | Estado       | Brecha principal                                                        |
| ------------------------------- | --------------------------------- | ------------ | ----------------------------------------------------------------------- |
| 1. Registro a primera operación | MVP-J-003                         | Parcial      | altas completas por UI, entidad fiscal, menú y login real de cada rol   |
| 2. Expansión del tenant         | Ninguna transversal               | Pendiente    | compra de capacidad, segunda sucursal, herencia y desactivación         |
| 3. Reserva remota               | MVP-J-004                         | Parcial alto | seña, recordatorio, llegada y conversión a visita                       |
| 4. Atención espontánea          | MVP-J-001 abre visita desde Floor | Parcial bajo | recepción/maître, waitlist, asignación y combinación de mesas           |
| 5. Pedido híbrido               | MVP-J-001 y MVP-J-005             | Parcial      | pedido QR del cliente, aprobación del mozo y dos rondas completas       |
| 6. Cuenta y pago                | MVP-J-001 y MVP-J-005             | Parcial alto | factura/comprobante, propina, refund, división por comensal e impresión |
| 7. Feedback posterior           | Ninguna                           | Pendiente    | encuesta, caso, seguimiento y permisos                                  |
| 8. Reseña externa               | Ninguna                           | Pendiente    | importación, normalización, aprobación y publicación                    |
| 9. Baja de un servicio          | Ninguna                           | Pendiente    | dependencias, fin de ciclo, read-only y conservación histórica          |
| 10. Reducción de sucursales     | Ninguna                           | Pendiente    | selección, bloqueo de altas, histórico y reactivación                   |

Por lo tanto, los tests actuales cubren bien el **núcleo operativo**, pero todavía no autorizan la
afirmación “todos los flujos de la plataforma están cubiertos”.

## Cobertura actual por aplicación

| App     | Cubierto con integración real                                                             | Pendiente prioritario                                                                                   |
| ------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Dash    | lectura de configuración; setup representativo; overview/auditoría; aislamiento de tenant | alta integral sólo por UI, catálogo/menú, suscripción completa, fiscal end-to-end, reportes y cierres   |
| Host    | confirmar/no-show/cancelación visible; jornada/plaza compartida                           | walk-in, waitlist, llegada con reserva, sentar/reasignar/combinar mesa, preferencias y sobreventa       |
| Floor   | abrir/cerrar visita, pedido, entrega, cuenta, mesa y plaza                                | dos rondas, QR híbrido, transferencias, merge/split, cursos, notas posteriores, offline y conflictos    |
| Kitchen | lifecycle, pausa/reanudación, handoff y cancelación por rol autorizado                    | múltiples estaciones, reasignación, concurrencia, re-fire, impresión, alertas y recuperación offline    |
| Cash    | saldo exacto, fallo, parcial, remanente y liquidación                                     | apertura/cierre real, arqueo, conciliación, propina, refund, descuentos, múltiples monedas y fiscal     |
| Guest   | reserva, historial, cancelación y no-show                                                 | menú real, QR ordering, pago digital, factura, perfil/preferencias, feedback y autenticación productiva |

## Cobertura actual por rol y límite de seguridad

| Actor         | Evidencia actual                               | Pendiente                                                               |
| ------------- | ---------------------------------------------- | ----------------------------------------------------------------------- |
| Owner/Auditor | aprovisiona y cancela excepción; consulta Dash | matriz completa de permisos y vistas por módulo                         |
| Maître        | usuario/rol creado y asignado                  | login real, walk-in, waitlist, mesa y reasignación                      |
| Waiter        | opera Floor; no puede capturar pagos           | login del usuario recién invitado, transferencia, split/merge y offline |
| Cook          | opera Kitchen; cancelación no visible          | ownership concurrente, estaciones y escalamiento                        |
| Cashier       | liquida saldo; no puede tomar comandas         | sesión/arqueo/conciliación real y refunds                               |
| Customer      | reserva/cancela y consulta historial           | identidad productiva, QR order, pagos, comprobante y feedback           |
| Tenant B      | lectura/mutación representativa denegada       | matriz sistemática para recursos, cachés, eventos y búsquedas           |

Crear un usuario con un rol no equivale a demostrar su login y navegación. Cada rol debe autenticarse
con su propia identidad en los journeys pendientes.

## Datos reales y persistencia

La validación manual del 2 de agosto de 2026 se ejecutó con:

- `PERSISTENCE_DRIVER=supabase`;
- API real en `127.0.0.1:3101`;
- builds reales de las seis aplicaciones;
- dataset Supabase de pruebas ya existente;
- datos únicos agregados al conjunto existente;
- cero `route.fulfill`, mocks de API de producto, resets, cleanup o base paralela;
- conservación de tenants, mesas, usuarios, reservas, órdenes, pagos y registros de intentos
  intermedios.

Este modo `REAL_PERSISTENT_DATASET` es evidencia suplementaria valiosa porque expone degradación por
acumulación de datos. No sustituye el perfil reproducible/fail-closed de CI ni autoriza usar una base
productiva.

La acumulación real reveló que disponibilidad consultaba ocupaciones mesa por mesa en serie. La ruta
se corrigió para resolverlas concurrentemente. También se detectaron y corrigieron:

- tenant nuevo sin suscripción inicial seleccionable;
- usuarios fixture persistidos sin email necesario para reservas;
- cancelación visible para Cook aunque la API la denegaba;
- contrastes insuficientes en Guest y Kitchen;
- navegación Guest dependiente de un CTA contextual;
- timeout de arranque configurado pero ignorado por Playwright.

## Evidencia de ejecución del 2 de agosto de 2026

| Verificación                       | Resultado                                                  |
| ---------------------------------- | ---------------------------------------------------------- |
| MVP-J-003                          | PASS, 57,4 s de test                                       |
| MVP-J-004                          | PASS, 56,3 s de test                                       |
| MVP-J-005                          | PASS, 1,8 min de test                                      |
| Build de todos los workspaces      | PASS                                                       |
| `npm run format:check`             | PASS                                                       |
| `npm run lint -- --no-cache`       | PASS                                                       |
| `npm run typecheck`                | PASS                                                       |
| `npm run deps:check`               | PASS                                                       |
| `npm run e2e:journey:policy`       | PASS: 4 specs / 6 archivos fuente                          |
| `npm run test:coverage`            | PASS: lines 85,52%; branches 84,90%; functions 86,38%      |
| Availability API                   | 100% lines, branches y functions en el reporte por archivo |
| Suite completa de Organization API | PASS fuera del runner global en cuarentena                 |

El gate global de cobertura pasa, pero el reporte actual no demuestra 100% en las cuatro métricas
para todos los archivos modificados. Ese requisito estricto continúa abierto y no debe ocultarse.

## Backlog de cobertura posterior

### P0 — Necesario para completar el restaurante de punta a punta

#### MVP-J-006 — Dos rondas, bebida, postre, factura y pago

Aplicaciones: Floor → Kitchen/Bar → Floor → Cash → Fiscal/Dash → Guest.

Criterios mínimos:

1. sentar una mesa y abrir visita/cuenta;
2. primera ronda con plato y bebida, preparada por estaciones distintas;
3. entrega completa visible en Floor;
4. segunda ronda con bebida y postre;
5. entrega completa sin reemplazar la primera orden;
6. solicitar cuenta y validar totales de ambas rondas;
7. emitir comprobante fiscal asociado a la cuenta y al pago;
8. cliente paga el importe total y puede consultar/descargar el comprobante;
9. cerrar visita, liberar mesa y comprobar Dash/auditoría;
10. fallos de facturación reintentables sin duplicar pago ni comprobante.

#### MVP-J-007 — Llegada con reserva y conversión en visita

Aplicaciones: Guest → Host → Floor.

Criterios mínimos: buscar reserva, registrar llegada, asignar/reasignar mesa, sentar, crear visita,
asignar mozo/plaza, mantener referencias de reserva y comprobar estado ocupado en Floor.

#### MVP-J-008 — Walk-in sin reserva

Aplicaciones: Host → Floor.

Criterios mínimos: registrar grupo, asignar mesa disponible o ingresar a waitlist, notificar turno,
sentar, abrir visita y liberar capacidad al cancelar/no presentarse.

#### MVP-J-009 — Fiscal posterior al cobro

Aplicaciones: Dash → Cash → Dash/Guest.

Criterios mínimos: entidad fiscal, sucursal y POS válidos; cuenta liquidada; Factura A/B/C según
condición; CAE/resultado persistido; descarga/envío; rechazo y retry idempotente; aislamiento tenant.

#### MVP-J-010 — Identidades y RBAC completos

Aplicaciones: las seis.

Criterios mínimos: autenticar Owner, Maître, Waiter, Cook, Cashier y Customer reales; comprobar menú,
datos y acciones permitidas/ocultas; 403 representativos; cambio de tenant sin fuga de localStorage,
caché, eventos ni resultados anteriores.

### P1 — Operación avanzada y resiliencia

| ID propuesto | Flujo                   | Cobertura requerida                                                                       |
| ------------ | ----------------------- | ----------------------------------------------------------------------------------------- |
| MVP-J-011    | Turno completo de caja  | apertura, movimientos, arqueo, diferencia, conciliación, aprobación/rechazo y cierre      |
| MVP-J-012    | Modificación de consumo | agregar/quitar luego de submit, descuentos, cortesías, propina, split/merge y refund      |
| MVP-J-013    | Cocina concurrente      | múltiples estaciones, dos cooks, ownership, carrera de acciones, pausa, re-fire y handoff |
| MVP-J-014    | Cierre de jornada       | visitas/cuentas abiertas, bloqueo, resolución, cierre, resumen y nueva jornada            |
| MVP-J-015    | Durabilidad ampliada    | reiniciar API durante J003–J005, relectura, outbox idempotente y ausencia de duplicados   |
| MVP-J-016    | Catálogo y QR híbrido   | menú publicado, disponibilidad, modificadores, pedido Customer QR y aprobación Waiter     |

### P2 — Plataforma completa

- feedback posterior y creación/resolución de casos;
- Reputation con importación, borrador, aprobación y publicación;
- expansión/reducción de sucursales y baja/reactivación de servicios;
- conectividad intermitente, offline, reintentos y sincronización conflictiva;
- recuperación ante caída de API, Supabase, proveedor de pagos y ARCA;
- matriz responsive por dispositivo y orientación;
- navegación completa sólo con teclado y lector de pantalla;
- accesibilidad Axe en loading, empty, validation, error y success de cada app;
- performance con volumen histórico, muchas mesas, reservas, órdenes y pagos;
- retención, exportación y consulta read-only de históricos.

## Cuándo podremos afirmar “todos los flujos están cubiertos”

La afirmación sólo es válida cuando:

1. cada recorrido de [07-core-journeys.md](07-core-journeys.md) tiene al menos un journey real;
2. cada superficie afectada conserva tests propios bajo `tests/e2e/apps/<app>/`;
3. cada flujo visual cubre loading, empty, success, validation y error;
4. cada variante de rol verifica tanto lo visible como lo permitido por API;
5. cada recorrido demuestra aislamiento de tenant y persistencia relevante;
6. responsive, teclado y WCAG A/AA pasan en los dispositivos definidos;
7. no se interceptan APIs de producto en evidencia release;
8. pagos, fiscal y proveedores externos usan sandbox/contratos explícitos y prueban idempotencia;
9. la suite no tiene flakes, skips, focus ni sleeps fijos;
10. unit, integración, coverage y todos los quality gates quedan verdes.

Hasta completar al menos P0 y la cobertura propia de sus aplicaciones, el estado correcto es:
**núcleo operativo cubierto, plataforma completa pendiente**.
