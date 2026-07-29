# Reglas — SPEC-232

- Tenant y Brand se validan server-side; nunca se confía en metadata visual del token.
- Configuración DRAFT no es visible para sesiones productivas.
- Assets deben pertenecer al tenant/brand o a la biblioteca pública de plataforma.
- SVG se sanitiza; uploads validan MIME real, tamaño, dimensiones y checksum.
- No se permiten CSS, HTML, scripts, URLs `data:` ni fuentes remotas arbitrarias.
- Tokens de estado `danger`, `warning`, `success`, foco y legibilidad operativa no son sustituibles.
- Todo color publicado cumple WCAG 2.2 AA con las parejas de foreground/background efectivas.
- Kitchen puede forzar su tema de alta visibilidad conservando logo/nombre de la Brand.
- Branch sólo sobrescribe campos allowlisted; no reemplaza identidad de otra Brand.
- Cache keys incluyen tenant, brand, branch, revision y app surface.
- Ante error se usa fallback seguro y se registra diagnóstico sin filtrar datos de otro tenant.
