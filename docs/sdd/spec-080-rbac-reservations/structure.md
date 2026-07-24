# Estructura — SPEC-080

1. autenticar actor o validar capability;
2. resolver Membership ACTIVE y authorizationRevision para actor interno;
3. resolver permission y Branch/assignment scope;
4. evaluar PII purpose, consent/retention, step-up y ApprovalPolicy;
5. ejecutar invariantes/revisión del dominio;
6. auditar decisiones sensibles con redacción.

Middleware transporta contexto/resultado. Perfiles crean assignments y no se comparan
jerárquicamente durante autorización.
