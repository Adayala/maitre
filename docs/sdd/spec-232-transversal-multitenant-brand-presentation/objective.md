# Objetivo — SPEC-232

## Propósito

Permitir que cada Brand publique una identidad visual completa, segura, accesible y versionada,
consumida consistentemente por todas las aplicaciones. La configuración nunca se resuelve desde
constantes por cliente ni cruza tenants.

## Criterios de aceptación

1. El tema efectivo se resuelve `plataforma → Brand → Branch` con overrides explícitos.
2. Logos, iconos, imágenes, tipografías, tokens y templates poseen contratos tipados y fallbacks.
3. Cada respuesta está identificada por `tenantId`, `brandId`, versión y estado de publicación.
4. Todas las apps aplican la misma identidad de marca sin alterar colores semánticos de seguridad.
5. Draft, preview, publicación y rollback no cambian una app productiva de forma parcial.
6. Assets y fuentes se validan, aíslan por tenant y usan URLs controladas/firmadas cuando corresponde.
