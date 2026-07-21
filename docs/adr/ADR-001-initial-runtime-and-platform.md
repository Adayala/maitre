# ADR-001 — Initial Runtime and Platform

| Campo | Valor |
| --- | --- |
| **Estado** | ACCEPTED |
| **Fecha** | 2026-07-21 |
| **Decidido por** | Product owner |
| **Specs relacionadas** | TECH_STACK, SPEC-208, SPEC-209 |

## Contexto

Maitre necesita entregar un MVP con costo inicial mínimo, feedback rápido y capacidad de migrar componentes cuando volumen, operación o términos comerciales lo requieran.

## Opciones consideradas

- React.js + Node.js desplegados inicialmente en Vercel.
- Framework/plataforma full-stack diferente.
- Infraestructura de contenedores administrada desde el inicio.

## Decisión

Usar React.js para frontend, Node.js para backend y Vercel como plataforma inicial. Dominio, aplicación, datos, jobs e integraciones permanecen detrás de contratos propios y pueden ejecutarse fuera de Vercel.

## Consecuencias

### Positivas

- onboarding y previews rápidos;
- ecosistema común TypeScript;
- operación inicial pequeña;
- frontend/API pueden comenzar dentro del free tier elegible.

### Negativas

- límites de serverless para procesos continuos, conexiones y tareas largas;
- términos/costos pueden impedir un piloto comercial gratuito;
- se requieren adapters y pruebas de portabilidad desde el inicio.

## Triggers de revisión

- worker continuo o realtime no satisfecho;
- límites de ejecución/concurrencia/egress;
- uso comercial incompatible con el plan;
- requisitos regionales, privados u on-premise;
- costo total superior a una alternativa.
