# Especificación — SPEC-205 MetricMaterialized

`analytics.metric.materialized.v1` por nueva revisión de materialización. Envelope SPEC-217 + metric
ID/version, sucursal, period/grain, allowed dimension buckets, value/unit, coverage, freshness,
input watermark y revisión de materialización.

Privacy suppression aplica antes de evento/log: cohorts pequeñas omiten value/dimensions. Recompute
idéntico no reemite; late data genera revisión superior. Consumidores no usan este evento como
autoridad transaccional.

El evento está pensado para invalidación de caches, refresh de dashboards y pipelines derivados, no
para contabilizar hechos de negocio. La identidad lógica combina `metricId`, `metricVersion`,
`alcance/grain/window` y `materializationRevision`.

La supresión puede afectar el valor, las dimensiones o ambos según policy. Cuando la métrica se
materializa pero la política obliga withholding parcial, el evento sigue pudiendo notificar la
revisión y la frescura sin revelar la observación sensible.
