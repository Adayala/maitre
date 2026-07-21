# Reglas — SPEC-220

## Invariantes

1. Un export no se considera backup hasta completar un restore verificado.
2. PostgreSQL backup no sustituye backup de objetos, identidad o secretos.
3. Toda copia no regenerable posee hash, manifest, cifrado, owner y expiración.
4. Al menos una copia queda fuera del failure domain original según riesgo aprobado.
5. Backups reales nunca se restauran en ambientes de menor confianza.
6. Restore no repite efectos externos sin reconciliación.
7. RPO/RTO son explícitos, medidos y diferenciados por ambiente/recorrido.
8. Retención/borrado se define por categoría y obligación, no globalmente.
9. Un legal hold tiene alcance, autoridad y vencimiento auditables.
10. Production no se habilita con RPO/RTO, restore y continuidad sin aprobar.
11. Scripts no imprimen ni persisten credenciales fuera del canal autorizado.
12. Un restore fallido invalida el estado saludable del backup correspondiente.
13. I0 no retiene dumps después de SPK-06 ni declara backup programado.
14. Git/migraciones/seed reconstruyen datos sintéticos, pero no son backup de datos no regenerables.
15. Primer dato no regenerable bloquea merge/deploy hasta aprobar destino, cifrado, retención y restore.
16. Storage, identidad o secretos no se fuerzan dentro de un dump PostgreSQL.
17. Un resultado SPK `NOT_RUN`, FAIL o INCONCLUSIVE no demuestra recuperabilidad.
