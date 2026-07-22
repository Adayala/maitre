# Contrato de restore y exit strategy

## Inventario

Cada dataset se clasifica como autoritativo, derivado/regenerable, fiscal/audit, PII o secret
reference; define owner, retention, export format, encryption, deletion/legal hold y dependencias.

## Ejercicio de restore

Desde artifacts identificados se restaura en entorno limpio PostgreSQL schema/data, auth mappings,
config no secreta y secret references recreadas por canal seguro. Se reconstruyen proyecciones y se
verifican conteos, hashes/invariantes, tenant isolation y journeys críticos.

Evidencia: source commit, backup/export ID y timestamp, comandos/runbook, ambiente, start/end,
RPO observado, RTO observado, checks, pérdidas, costos y cleanup. Estado inicial `NOT_RUN`; backup
existente sin restore no es PASS.

## Exit strategy

Export portable usa PostgreSQL/CSV/JSON/schema versions y manifest/hash. Se prueba import en stack
limpio sin SDK propietario para datos autoritativos; auth users se mapean sin exportar secrets.
Realtime, caches y analytics derivados pueden reconstruirse. Fiscal/audit conserva integridad y
retención. La eliminación verifica primary, replicas/backups según plazo y provider account cleanup.

PASS requiere objetivos RPO/RTO aprobados y medidos. Si free tier impide demostrarlo, resultado es
FAIL/INCONCLUSIVE para I0, no una compra implícita.
