# Especificación — SPEC-195 Analytics Dashboards API

Create/edit/publish/version y render. Render autoriza cada widget/filter y devuelve partial result
con freshness, coverage, suppression y error typed. Métrica retirada muestra unavailable con
successor, no valor stale silencioso.

Cache tenant/permiso-aware; compartir/clonar conserva refs pero no acceso. Export es capability
separada y reaplica privacidad.

`POST /analytics-dashboards` crea dashboards draft; `PATCH /analytics-dashboards/{dashboardId}` edita;
`POST /analytics-dashboards/{dashboardId}:publish|version` controla lifecycle; `GET
/analytics-dashboards/{dashboardId}:render` devuelve la composición de widgets con estados
independientes. `POST /analytics-dashboards/{dashboardId}:clone` conserva refs pero no hereda permisos
subyacentes.

El render no colapsa el dashboard entero por la falla de un widget. La respuesta debe distinguir entre
`error`, `suppressed`, `stale`, `unavailable successor` y `ok` para cada componente. `export` vive en
capability separada y reaplica el mismo modelo de permisos y thresholds.
