# Especificación — SPEC-147 Fiscal QR API

GET payload/SVG/raster para Invoice AUTHORIZED, derivado server-side con SPEC-141. Pending, rejected
o draft devuelve conflicto/no disponible y nunca un QR aparentemente válido.

ETag es hash de canonical payload + renderer version; content type y cache policy son explícitos.
No acepta campos fiscales del cliente. Authorization y redacción aplican a payload accesible; SVG
se genera sin scripts ni referencias externas.
