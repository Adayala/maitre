# Especificación — SPEC-065 Floor RBAC

Permissions canónicas I0:

```text
visit.read
visit.create
visit.request_close
visit.close
visit.cancel
visit.reopen
visit.reopen_approve
occupancy.read
occupancy.seat
occupancy.move
occupancy.release
table_status.read
check.read
check.adjust
check.request_payment
check.settle
check.void
check.void_approve
payment.read
payment.create
payment.authorize
payment.capture
payment.void
payment.refund
payment.refund_approve
payment.reconcile
service_period.read
service_period.create
service_period.open
service_period.begin_close
service_period.close
service_period.force_close
service_period.force_close_approve
service_period.cancel
```

Cada endpoint/comando exige su permiso homónimo; list/detail comparten el permiso
`read` del recurso. No existe `floor.manage`, permiso wildcard ni bypass por OWNER/ADMIN.
Los perfiles nominales sólo son plantillas versionadas para assignments:

- MAITRE: lectura Floor, create/lifecycle ordinario de Visit y seat/move/release dentro de
  Branch; no recibe reopen, operaciones financieras ni force-close por defecto.
- WAITER: lectura y request-close de Visits asignadas, lectura/request-payment del Check
  asociado y acciones de Occupancy expresamente asignadas; no ve el Floor completo.
- CASHIER: lectura de Check/Payment y create/authorize/capture/settle dentro de
  LimitsPolicy; refund/void/reconcile requieren assignments separados.
- MANAGER: recibe sólo permisos supervisores asignados; no adquiere “todo” por el nombre.
- OWNER/ADMIN: se aprovisionan mediante catálogo explícito y tampoco poseen wildcard.
- COOK: no recibe permisos de esta lista por defecto; su lectura operativa pertenece al
  contrato Kitchen mínimo correspondiente.

Los alcances combinan tenant, conjunto de Branches y, para WAITER, assignments de
Visit/Table expresamente autorizantes. La asignación organizativa de una Plaza no
es uno de esos assignments y nunca amplía ni reduce permisos. Un
alcance más amplio nunca se infiere del role label. `authorizationRevision` obsoleta,
Membership suspendida, permiso desconocido o política/assignment no disponible producen
deny.

Reopen, Check void, Payment refund sobre el límite y ServicePeriod force-close requieren
step-up vigente y `reasonCode`. Cuando ApprovalPolicyVersion exige dual control, el
aprobador debe ser distinto del solicitante y poseer respectivamente `visit.reopen_approve`,
`check.void_approve`, `payment.refund_approve` o `service_period.force_close_approve`;
el approval artifact queda ligado a una acción, recurso, revisión, monto máximo, expiry y
uso único. RBAC no reemplaza revisión, balance, capacity, lifecycle ni validaciones de dominio.
