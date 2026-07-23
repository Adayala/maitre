# Contrato de versión y compatibilidad de contratos — SPEC-225

## Propósito

`contract.md` resume la interfaz normativa consumida por otras specs o implementaciones. Su
evolución debe distinguir revisión documental, versión observable en runtime y compatibilidad.

## Identidades separadas

| Campo | Semántica |
| --- | --- |
| `SPEC-NNN` | identidad estable de la spec; no cambia por revisiones |
| `contractRevision` | revisión monotónica del contrato documental |
| `schemaVersion` | versión observable de payload/schema/protocolo cuando aplica |
| `effectiveFrom` | commit desde el cual la revisión es autoritativa |

`contractRevision` no reemplaza Git. `schemaVersion` no se agrega a entidades/APIs que no exponen una
versión observable.

## Metadata

```yaml
contract:
  spec: SPEC-NNN
  revision: <entero positivo>
  status: DRAFT | ACTIVE | DEPRECATED | SUPERSEDED
  effectiveFrom: <commit completo>
  schemaVersion: <valor o N/A>
  changeClass: INITIAL | EDITORIAL | COMPATIBLE | BREAKING
  supersedesRevision: <entero o null>
  consumers: [SPEC-NNN]
```

Durante migración, ausencia se clasifica `UNVERSIONED_LEGACY`; no se infiere `revision: 1` sin
revisar contenido y consumidores.

## Clases de cambio

### `EDITORIAL`

No altera requisito, regla, schema, comportamiento observable ni evidencia. Conserva revisión sólo
si la política de publicación lo permite; el commit sigue registrándose.

### `COMPATIBLE`

Amplía o aclara preservando consumidores válidos. Ejemplos:

- campo opcional con default/ausencia definidos;
- nuevo enum sólo cuando consumidores toleran desconocidos;
- endpoint/evento adicional;
- constraint más permisiva sin debilitar seguridad/invariantes.

Una adición no es automáticamente compatible; se demuestra contra consumidores.

### `BREAKING`

Invalida un consumidor o cambia semántica observable:

- elimina/renombra campo u operación;
- vuelve obligatorio lo opcional;
- cambia tipo, unidad, moneda, timezone o significado;
- restringe enum/rango;
- modifica autorización, ownership, orden o garantía de delivery;
- cambia error/outcome requerido.

## Revisión contractual versus schema

Todo cambio normativo incrementa `contractRevision`. `schemaVersion` cambia sólo cuando el protocolo
lo requiere. Pueden evolucionar independientemente:

- aclarar autorización: nueva revisión, mismo schema;
- nuevo event envelope incompatible: nueva revisión y nueva schemaVersion;
- corrección tipográfica: cambio editorial, sin nueva versión observable.

## Compatibilidad y consumidores

Antes de activar una revisión:

1. enumerar consumidores conocidos;
2. clasificar cambio por consumidor;
3. definir matriz producer/consumer;
4. aportar contract tests o evidencia equivalente;
5. establecer ventana/dual-read/dual-write cuando aplique;
6. registrar rollback y observabilidad;
7. obtener reviewers requeridos.

“No hay consumidores conocidos” es una afirmación revisable, no ausencia de análisis.

## Deprecación

Una revisión `DEPRECATED` declara:

- successor/revisión destino;
- fecha de anuncio y `sunsetAt`;
- consumidores pendientes;
- compatibilidad durante ventana;
- telemetría de uso;
- owner y criterio de retiro.

Al vencer la ventana con consumidores activos se bloquea el retiro o se aprueba excepción; no se
rompe silenciosamente.

## APIs, eventos y persistencia

- APIs se rigen además por SPEC-215.
- Eventos se rigen además por SPEC-217 y versionan envelope/payload.
- Persistencia interna no se trata como API pública, pero migrations y readers/writers concurrentes
  requieren compatibilidad temporal.
- ADRs registran decisiones; no sustituyen revision metadata del contrato afectado.

## Línea base

- 226 archivos `contract.md`.
- 0 con `contractRevision`.
- 0 con `schemaVersion` explícita mediante formato uniforme.
- 36 contienen lenguaje de compatibilidad/deprecación, sin metadata común.
- Los 226 se clasifican `UNVERSIONED_LEGACY` hasta revisión.

## Migración

1. Identificar interface y consumidores.
2. Reconciliar contrato actual con implementación/evidencia.
3. Clasificar el baseline como revisión inicial revisada.
4. Asignar revision/effectiveFrom.
5. Asignar schemaVersion sólo donde sea observable.
6. Registrar compatibilidad, tests y deprecaciones.
7. Actualizar README/catálogo sin promover lifecycle automáticamente.

## Criterios de salida

- [ ] Los 226 contratos poseen revisión/effectiveFrom.
- [ ] Interfaces versionables declaran schemaVersion o `N/A`.
- [ ] Cambios compatibles/breaking poseen matriz de consumidores.
- [ ] Deprecaciones poseen successor, sunset y telemetría.

Los checks permanecen abiertos.
