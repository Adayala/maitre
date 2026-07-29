# Contrato — SPEC-232

## Decisión de producto

El branding básico es parte de Core, no un servicio activable: nombre, logos, favicon, paleta,
tipografía y template default. Capacidades white-label avanzadas pueden comercializarse aparte,
pero nunca se requiere una suscripción adicional para aislar o representar correctamente una marca.

## Resolución

```text
PlatformFallback
  <- BrandPresentation publicada
    <- BranchPresentation override permitido
```

No existe fallback entre tenants. Un `brandId` siempre se valida dentro del tenant derivado del
contexto o de una capability pública.

## Superficies consumidoras

`customer`, `waiter`, `host`, `floor`, `kitchen`, `cashier` y `dash` consumen el mismo snapshot
publicado. Cada app puede escoger densidad/layout apropiado, pero no inventar identidad comercial.
