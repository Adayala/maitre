# Verificación — SPEC-208

## Criterios

### CAD-208-01 — El MVP demo opera con costo mensual objetivo de USD 0

- [ ] la estimación mensual del perfil de desarrollo/demo es USD 0;
- [ ] el núcleo se ejecuta localmente sin Vercel;
- [ ] la elegibilidad de Vercel Hobby está confirmada para el uso concreto antes de desplegar.

### CAD-208-02 — Las cuotas críticas se inventarian, miden y gobiernan con degradación segura

- [ ] cada cuota crítica tiene métrica, alerta o revisión manual documentada;
- [ ] una preview expirada elimina sus recursos temporales;
- [ ] al alcanzar una cuota, el sistema falla de forma controlada y observable.

### CAD-208-03 — El entorno gratuito usa datos sintéticos y no se presenta como operación comercial

- [ ] la lista de dependencias específicas de proveedor está actualizada;
- [ ] el entorno demo no usa datos reales fuera de policy;
- [ ] no se presenta como operación comercial.

### CAD-208-04 — Cada proveedor tiene estrategia de salida, backup y reemplazo verificable

- [ ] existe restauración probada de la base de datos;
- [ ] existe exportación de usuarios y objetos;
- [ ] proyecto Supabase inactivo puede restaurarse siguiendo runbook sin pérdida de fuente versionada.

### CAD-208-05 — Billing, upgrades y overages requieren control explícito

- [ ] ningún proveedor puede cobrar overage automáticamente;
- [ ] no hay método de pago asociado al perfil free-tier o existe bloqueo aprobado equivalente;
- [ ] preview no posee credenciales ni workflow para migrar la base compartida.

### CAD-208-06 — Existe un gate comercial que bloquea salir del perímetro gratuito sin revisión

- [ ] el gate comercial impide operar fuera de los términos gratuitos;
- [ ] Sonar usa OSS sólo si el repositorio es público; de otro modo el fallback está probado;
- [ ] la evidencia de promoción fuera del perímetro gratuito queda enlazada.
