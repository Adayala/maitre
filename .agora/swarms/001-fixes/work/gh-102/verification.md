# Evidencia de verificación

Fecha: 2026-08-29

- `node --test apps/web/dist/test/org-explorer-model.test.js`: PASS.
- `npm run test:coverage`: PASS; cobertura global 85.52% lines, 84.92% branches y 86.38% functions. La función nueva queda ejercitada en expansión verdadera para dos scopes de marca y en contracción falsa.
- `npm run test:e2e:run -- --project=dash tests/e2e/apps/dash/hierarchical-navigation.spec.ts --grep "actualiza el panel al expandir otra sucursal"`: PASS, 1/1.
- `npm run typecheck`: PASS.
- `npm run format:check`: PASS.
- `npm run lint`: PASS.
- `npm run deps:check`: PASS.
- `git diff --check`: PASS.
- `agora validate`: PASS.

La regresión selecciona un salón en `Centro`, expande `Palermo`, verifica la URL branch-scoped, el código `PAL`, la desaparición de `Desactivar`, la persistencia tras reload y el gate de accesibilidad sin violaciones serias o críticas.
