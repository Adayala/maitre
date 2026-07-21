# RULES — SPEC-210

1. El navegador no recibe `service_role`, connection strings ni secretos.
2. El navegador no accede directamente a tablas operacionales durante el MVP.
3. Auth autentica; Maitre autoriza tenant, branch, roles y entitlements.
4. Toda tabla expuesta tiene RLS y grants mínimos.
5. Toda policy RLS incluye test de aislamiento cruzado.
6. SQL versionado es fuente de verdad; cambios manuales deben convertirse inmediatamente en migración o revertirse.
7. El dominio no importa SDKs ni tipos de Supabase.
8. Los IDs de proveedor se guardan como referencias externas, no sustituyen identidades de dominio.
9. Backups y restores son parte del Definition of Done de persistencia.
10. Storage requiere buckets privados y signed URLs emitidas por backend.
11. No adoptar Realtime, Edge Functions, cron o queues de Supabase sin spec y adapter.
12. Una pausa de proyecto debe producir diagnóstico claro; nunca corrupción o reintentos infinitos.
13. Datos personales y fiscales reales no se cargan en demo.
14. Antes de un piloto real se reevalúan disponibilidad, backups, términos, seguridad y plan comercial.
