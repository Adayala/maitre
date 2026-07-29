# Objetivo — SPEC-228

## Propósito

Reemplazar límites y servicios fijos en código por un catálogo persistido, consultable y versionado.

## Resultado esperado

- Cada contratación referencia una definición activa y estable.
- Tipo de facturación, alcance, dependencias y precio tienen una fuente de verdad.
- El panel interno puede listar el catálogo sin incorporar reglas comerciales en frontend.

## Criterios de aceptación

- [x] El catálogo distingue `SERVICE` y `QUANTITY`.
- [x] Los alcances admitidos están enumerados y determinan si se requiere `scopeRefId`.
- [x] Los contratos existentes conservan su precio unitario aunque la plantilla evolucione.

## No objetivos

Checkout, prorrateo, impuestos y períodos distintos de `MONTHLY`.
