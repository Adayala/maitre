# Harness E2E

Playwright verifica cada webapp como un proyecto independiente contra los builds de producción y
una instancia real de la API.

## Comandos

```bash
# Construye API y webapps, levanta todos los servicios y ejecuta la suite.
npm run test:e2e

# Igual que el anterior, limitado al walking skeleton.
npm run test:e2e:smoke

# Reutiliza builds ya generados durante el desarrollo del harness.
npm run test:e2e:run -- --project=host

# Levanta únicamente Host y la API, como hace su job de CI.
E2E_APP=host npm run test:e2e:run -- --project=host
```

Los puertos dedicados al harness son: API `3101`, Dash `5273`, Cash `5274`, Kitchen `5275`,
Floor `5276`, Host `5278` y Guest `5279`. Un puerto ocupado falla de forma explícita para evitar
probar accidentalmente un proceso ajeno.

Los smokes iniciales validan carga, routing y estructura accesible sin autenticación. Los próximos
casos deben provisionar datos por API y usar fixtures de sesión por rol; no deben depender de
estado manual ni de un Supabase remoto.

En GitHub Actions cada aplicación es un job de matriz independiente, con build, ejecución y
artifacts propios. `fail-fast` está deshabilitado: un fallo de Host no impide obtener evidencia de
Floor, Kitchen, Cash, Guest o Dash.
