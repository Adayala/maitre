# Verificación

El workflow usa `release-postgres`, `E2E_RUN_ID` por run/attempt y un paso `always()` que ejecuta `supabase stop --no-backup`, comprueba que no queden recursos y publica `cleanup=verified`. El policy gate forma parte de `npm run e2e:journey:policy`; su implementación proviene de `162c7d04f`.
