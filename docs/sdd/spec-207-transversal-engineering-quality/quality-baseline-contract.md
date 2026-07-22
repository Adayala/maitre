# Contrato de baseline de calidad

## Primera captura

Sobre un commit identificado se ejecutan, sin alterar resultados: install locked, format check,
lint, typecheck, unit, contract, integration, build, dependency audit, secret scan y análisis
estático gratuito. Cada gate registra comando, versión, duration, exit code y artifact/hash.

## Clasificación

- P0: aislamiento, auth bypass, secret, corrupción/pérdida o build/release imposible; bloquea todo.
- P1: defecto funcional/seguridad alta; bloquea código nuevo en el área y requiere issue/owner.
- P2/P3: deuda aceptable temporalmente con razón, owner y retiro.

La baseline sólo admite hallazgos existentes revisados. Su identidad estable incluye tool/rule,
fingerprint, path lógico y issue. Un hallazgo nuevo o conteo mayor falla; mover archivos no lo oculta.
No se agrega deuda nueva para aprobar un PR.

## Estado inicial

Todos los gates comienzan `NOT_RUN`. Documentación o presencia de scripts no equivale a PASS. La
captura sólo cambia tras adjuntar evidencia reproducible contra el mismo commit.
