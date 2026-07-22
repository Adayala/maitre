# Especificación — SPEC-205 MetricMaterialized

`analytics.metric.materialized.v1` por nueva materialization revision. Envelope SPEC-217 + metric
ID/version, branch, period/grain, allowed dimension buckets, value/unit, coverage, freshness,
input watermark y materialization revision.

Privacy suppression aplica antes de event/log: cohorts pequeñas omiten value/dimensions. Recompute
idéntico no reemite; late data genera revision superior. Consumidores no usan este evento como
autoridad transaccional.
