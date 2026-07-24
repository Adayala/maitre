# Especificación — SPEC-176 Integrations API

Create/list/detail/configure/activate/disable/upgrade. Config se valida por versión de adapter y no
acepta provider base URLs arbitrarias salvo capability explícita. Secret input usa canal dedicado y
se convierte a referencia opaca que nunca vuelve a mostrarse.

Las mutaciones usan idempotencia + `If-Match`. Activate exige provider spike PASS, OwnershipMatrix,
credentials/capabilities válidas y test permitido. Disable revoca recepción/jobs sin borrar runs.

`POST /integrations` crea instalaciones draft; `GET /integrations` y `GET /integrations/{integrationId}`
sirven inventario y detalle; `POST /integrations/{integrationId}:configure` aplica config no secreta;
`POST /integrations/{integrationId}:activate|disable|upgrade` gestionan lifecycle. Un canal o endpoint
separado maneja el ingreso de secretos para devolver sólo referencias opacas.

Errores usan `404` para alcance ajeno, `409` para conflicto de ciclo de vida, `412` para revisión obsoleta
y `422` para config/capability/credential incompatibles. La API no promete capacidad operativa remota
si el spike o las credenciales no están aprobados, aunque la integración exista en `DRAFT`.
