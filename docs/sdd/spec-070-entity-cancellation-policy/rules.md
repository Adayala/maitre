# Rules — SPEC-070

- Una sola versión efectiva gana por combinación tenant/Branch/channel y `asOf`.
- Precedencia: channel+Branch, Branch default, tenant default; empate inválido falla cerrado.
- Ventanas usan intervalos semiabiertos y reloj/asOf inyectado con timezone IANA.
- Evaluate no escribe Reservation, Payment, Check ni Invoice.
- Consecuencias son informativas en I0; “penalty” no implica captura, deuda ni refund.
- Override no muta policy ni snapshot y requiere `reservation.policy.override`, reason,
  scope, expiry y aprobación cuando corresponda.
- Publicar versiones solapadas ambiguas se rechaza mediante revisión/concurrencia.
