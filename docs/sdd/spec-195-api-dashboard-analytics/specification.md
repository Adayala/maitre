# Especificación — SPEC-195 Analytics Dashboards API

Create/edit/publish/version y render. Render autoriza cada widget/filter y devuelve partial result
con freshness, coverage, suppression y error typed. Métrica retirada muestra unavailable con
successor, no valor stale silencioso.

Cache tenant/permission-aware; compartir/clonar conserva refs pero no acceso. Export es capability
separada y reaplica privacidad.
