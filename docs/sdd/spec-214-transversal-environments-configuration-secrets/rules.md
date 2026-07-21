# Reglas — SPEC-214

## Invariantes

1. Código, Git, documentación, tests y artefactos no contienen secretos reales.
2. El navegador recibe únicamente configuración clasificada como pública.
3. `process.env` se consulta sólo desde el módulo de configuración de cada runtime.
4. La aplicación falla al arrancar ante configuración obligatoria ausente o inválida.
5. Ambientes no comparten credenciales productivas ni datos reales.
6. Preview posee privilegios y duración mínimos.
7. La autorización nunca depende sólo de un feature flag o variable del cliente.
8. Runtime y migraciones no usan una credencial administrativa común.
9. Ningún log o error imprime valores secretos.
10. Toda exposición inicia revocación/rotación; borrar el texto no recupera el secreto.
11. Los nombres de configuración son portables y no codifican IDs internos de Vercel.
12. Production permanece deshabilitado hasta una decisión explícita de readiness comercial y operacional.

## Excepciones

Una excepción requiere riesgo, alcance, owner, vencimiento, control compensatorio y aprobación. Nunca se exceptúa la publicación de secretos reales en Git o bundles web.
