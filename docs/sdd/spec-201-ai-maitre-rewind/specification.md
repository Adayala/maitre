# Especificación — SPEC-201

Context builder recupera sólo DataRegistry/metrics autorizados después de aplicar tenant/alcance,
classification y privacy threshold. Fuentes se serializan como datos no instrucciones.

La salida separa hechos/inferencias, cita refs + period/freshness/coverage y nunca inventa causalidad. Se
filtran prompt injection, secrets/PII y output exfiltration. Fallback determinista genera resumen
sin LLM. Runtime/model requiere eval y cost/privacy spike PASS; si no, queda fallback-only.

La superficie produce resúmenes retrospectivos acotados a ventanas temporales, alcances y vistas
autorizadas. El retrieval no debe traer raw evidence innecesaria ni prompt text libre de origen no
confiable. Los adapters de LLM consumen contexto estructurado, nunca acceso directo a repositorios de
datos ni instrucciones embebidas en contenido externo.

Cuando el modelo no esté disponible, falle o no pase gates de costo/privacidad, el fallback
determinista conserva utilidad mínima con lenguaje controlado y citas a métricas/registros sin
hallucinar causalidad.
