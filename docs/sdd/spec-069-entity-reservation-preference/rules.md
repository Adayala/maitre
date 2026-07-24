# Rules — SPEC-069

- Cada record representa un code; pueden coexistir múltiples codes/subjects.
- Exactly one de guestId/reservationId identifica el subject.
- Overrides de Reservation prevalecen sobre defaults Guest para el mismo code según policy.
- Vigencia, priority y source resuelven conflictos con orden versionado y estable.
- REQUIREMENT requiere regla operativa explícita; no convierte al sistema en garantía médica.
- Datos sensibles se excluyen de eventos/logs generales y se muestran por need-to-know.
- Revocación, expiración o anonymize afectan usos futuros sin reescribir snapshots legítimos.
