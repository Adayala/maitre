# Especificación — SPEC-199 Reports API

Job versionado por period/branch/timezone/format/report definition. Manifest conserva params,
metric/data revisions, freshness, suppression, counts, hash, errors y generatedAt.

Range/row/cost/retention limits son obligatorios. Signed download expira y se audita; CSV neutraliza
formula injection. Reintento idempotente no duplica artifacts. Report respeta permisos al generar y
al descargar.

`POST /reports` crea jobs de generación; `GET /reports/{reportId}` devuelve status y manifest; `POST
/reports/{reportId}:download` emite descarga firmada o stream temporal. La identidad lógica del
artifact depende del report definition version, parámetros, revisiones de datos y políticas de
supresión/frescura.

Un report generado bajo un conjunto de permisos no debe reutilizarse ciegamente para otro actor con
menos acceso. La descarga está ligada a permisos vigentes además del artifact generado. La neutralización
de CSV evita fórmulas ejecutables o payloads que abusen del cliente consumidor.
