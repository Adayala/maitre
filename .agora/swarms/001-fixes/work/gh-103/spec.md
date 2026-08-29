# Spec: aislamiento y teardown obligatorio de journeys E2E

## Decisión

Los journeys autoritativos no pueden ejecutarse contra el tenant demo ni contra infraestructura compartida. Deben usar una base efímera recreada desde migraciones y destruirla sin backup bajo una condición `always()`, verificando después que no queden recursos activos.

La solución evita purgas por patrones de nombre sobre datos compartidos: ese enfoque podría borrar información legítima o perteneciente a otra corrida/tenant.

## Unidades y branches

- Validar que el job declare `APP_ENV: e2e`, perfil `release-postgres`, `E2E_RUN_ID` por corrida e identidades run-scoped.
- Validar recreación de base sin seed compartido.
- Validar teardown con `if: always()`, `supabase stop --no-backup` y comprobación posterior.
- Fallar con diagnósticos accionables cuando falte cualquiera de esas garantías.

## Recorrido E2E

El journey real crea datos en la base efímera, prueba persistencia tras reiniciar la API y el job destruye la base aun cuando falle el recorrido. La evidencia de cleanup se publica como artefacto.

## Criterios

Los criterios `isolation`, `cleanup`, `failure-path`, `tests` y `e2e` se satisfacen mediante la infraestructura efímera existente y un gate unit-tested que impide su regresión.
