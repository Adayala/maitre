# Integración ARCA, factura electrónica e IVA para Maitre

Fecha de investigación: 29 de julio de 2026.

> Este documento es un análisis técnico basado en documentación oficial vigente de ARCA. No
> reemplaza la validación de un contador ni una revisión legal/tributaria antes de habilitar
> producción.

## Resumen ejecutivo

Maitre ya dispone de un cliente real WSAA/WSFEv1 y de integración seleccionable mediante
`FISCAL_ARCA_DRIVER=wsfev1`. El cliente real fue autenticado y `FEDummy` fue validado en
homologación. Todavía **no debe considerarse habilitado para facturación productiva**: no se
completó la matriz de comprobantes ni los datos registrales y puntos de venta de producción.

El camino recomendado para restaurantes argentinos es:

1. Integrar **WSAA** para autenticación con certificado X.509.
2. Integrar **WSFEv1** para Facturas A/B/C y sus notas de crédito/débito sin detalle de ítems
   enviado a ARCA.
3. Obtener el número real consultando `FECompUltimoAutorizado`, autorizar con
   `FECAESolicitar` y reconciliar resultados ambiguos con `FECompConsultar`.
4. Generar el comprobante PDF/HTML y el **QR oficial** después de recibir el CAE.
5. Generar exportaciones de ventas/compras compatibles con **Portal IVA / IVA Simple**, pero
   mantener la presentación como una acción humana hasta que ARCA publique una API oficial
   apropiada y comprobada para ese flujo.
6. Incorporar después servicios complementarios: padrón, constatación de comprobantes,
   importación de compras y CAEA para contingencias.

Para el caso normal de un restaurante, **WSFEv1 es preferible a WSMTXCA**. WSFEv1 admite A,
B, C y M y ARCA recibe importes globales, mientras que WSMTXCA está orientado a A/B con detalle
de ítems. Maitre puede conservar el detalle internamente y mostrarlo en el comprobante sin
necesidad de enviarlo como detalle fiscal.

## Estado actual del proyecto

### Actualización de implementación — 29 de julio de 2026

Desde la investigación inicial se implementó:

- paquete reutilizable `@maitre/arca-client` con WSAA, firma CMS, caché de Ticket de Acceso,
  WSFEv1, parámetros, `FECompUltimoAutorizado`, `FECAESolicitar` y `FECompConsultar`;
- adapter real `Wsfev1ArcaAdapter`, errores normalizados y resultado
  `PENDING_RECONCILIATION`;
- persistencia tenant-aware de intentos de autorización y reconciliación observable;
- prohibición técnica del adapter simulado para comprobantes `PRODUCTION`;
- identidad fiscal con `legalName`, alias opcional y referencias separadas para secretos;
- titular fiscal explícito de la suscripción;
- sucursal, domicilio ARCA, sistema emisor y ciclo registral del punto de venta;
- gate productivo que exige entidad/certificado/sucursal activos, domicilio y punto `VERIFIED`;
- migración `20260729210000_arca_fiscal_ownership_and_registration.sql` aplicada al Supabase
  vinculado;
- onboarding explícito del tenant de desarrollo: suscripción, sucursal principal y POS `0001`
  asociados al CUIT autorizado de homologación, con auditoría.

Quedan abiertos:

- coordinación distribuida de secuencia si se despliegan varios emisores simultáneos;
- ejecución completa de facturas/notas y rechazos de la matriz de homologación;
- QR oficial final y exportaciones Portal IVA/IVA Simple;
- datos registrales definitivos y alta/verificación productiva;
- revisión profesional fiscal y piloto controlado.

### Ya existe

- Entidades fiscales multi-tenant con CUIT y condición fiscal.
- Puntos de venta separados por entidad y ambiente.
- Metadatos de certificados con una referencia opaca al secreto; las claves privadas no se
  guardan en la base de datos.
- Facturas A/B/C, notas de crédito/débito, estados de autorización, CAE y vencimiento.
- Líneas, bases imponibles, IVA, importes exentos/no gravados y totales.
- Inmutabilidad posterior a la autorización.
- Outbox de eventos fiscales.
- Puerto `ArcaAdapterPort` y selección por `FISCAL_ARCA_DRIVER`.
- Exportación fiscal agregada y un prototipo de payload QR.
- Separación entre homologación y producción.

### Brechas detectadas originalmente

La lista siguiente conserva el diagnóstico inicial como trazabilidad. Los puntos 1–6 y 12 tienen
implementación total o parcial según la actualización anterior; no debe interpretarse como estado
actual sin leer esa sección.

1. `SimulatedArcaAdapter` no llama a WSAA ni WSFEv1.
2. El puerto de autorización actual es demasiado pequeño. Sólo envía CUIT, punto de venta,
   tipo, número, moneda y total. WSFEv1 necesita, entre otros:
   - concepto;
   - tipo y número de documento receptor;
   - fecha del comprobante;
   - importe neto, no gravado, exento, IVA y tributos;
   - desglose `AlicIva`;
   - código y cotización de moneda;
   - fechas de servicio cuando corresponda;
   - comprobantes asociados para notas;
   - condiciones de IVA del receptor y campos opcionales vigentes.
3. La numeración se deriva del máximo local. En producción debe sincronizarse con
   `FECompUltimoAutorizado`; ARCA exige que el número sea exactamente el siguiente para el
   punto de venta y tipo de comprobante.
4. El código actual sólo asigna el número local después de una respuesta exitosa y no persiste
   realmente `AUTHORIZATION_PENDING`. Ante un timeout podría haberse autorizado en ARCA aunque
   Maitre no haya recibido la respuesta. Debe conservarse la intención y consultarse antes de
   volver a emitir.
5. Falta serialización de emisiones concurrentes por CUIT + ambiente + punto de venta + tipo.
6. El estado `REJECTED` es terminal. Conviene distinguir:
   - rechazo fiscal determinista;
   - error corregible de datos;
   - fallo de autenticación/certificado;
   - fallo de transporte;
   - resultado ambiguo pendiente de reconciliación.
7. El QR actual no cumple el formato oficial. Debe generar:
   `https://www.arca.gob.ar/fe/qr/?p=<JSON en Base64>`, con códigos numéricos oficiales,
   importe decimal, cotización, documento receptor y CAE/CAEA.
8. Cantidad sólo admite enteros. Gastronomía puede necesitar cantidades/fracciones y reglas
   explícitas de redondeo decimal.
9. La alícuota está actualmente fijada por defecto. Debe resolverse desde catálogo/configuración
   fiscal versionada por producto y fecha.
10. La exportación actual es un manifiesto interno; no genera los archivos de diseño oficial
    de Portal IVA/IVA Simple.
11. Falta capturar compras/comprobantes de proveedores, requisito para ofrecer un IVA completo.
12. Falta un bloqueo fuerte que impida que cualquier fallback simulado opere en producción.

## Integración de factura electrónica

### Servicios y ambientes

ARCA expone Web Services SOAP sobre HTTPS. La autenticación se realiza por WSAA:

| Servicio | Homologación | Producción |
|---|---|---|
| WSAA | `https://wsaahomo.afip.gov.ar/ws/services/LoginCms` | `https://wsaa.afip.gov.ar/ws/services/LoginCms` |
| WSFEv1 | `https://wswhomo.afip.gov.ar/wsfev1/service.asmx` | `https://servicios1.afip.gov.ar/wsfev1/service.asmx` |

Aunque el organismo se denomina ARCA, varios hosts técnicos continúan usando el dominio
`afip.gov.ar`; deben tomarse de los manuales/WSDL y no renombrarse.

### Alta operativa por cada CUIT

Homologación:

1. Adherir el servicio WSASS con clave fiscal.
2. Generar certificado de testing.
3. Autorizar al certificado para el servicio de negocio `wsfe`.
4. Ejecutar pruebas con los datos admitidos por homologación.

Producción:

1. Crear clave privada y CSR fuera de la base de datos.
2. Obtener certificado desde “Administrador de Certificados Digitales”.
3. Relacionar el certificado y la CUIT representada con “Facturación Electrónica” en el
   Administrador de Relaciones.
4. Dar de alta un punto de venta específico para Web Services. No debe reutilizarse uno de
   controlador fiscal u otra modalidad.
5. Guardar certificado y clave en un secret manager; en Maitre sólo queda la referencia.

### Flujo técnico propuesto

```text
Cuenta cerrada
  -> snapshot fiscal inmutable
  -> validación local
  -> lock de secuencia fiscal
  -> WSAA: obtener/reutilizar Token + Sign
  -> WSFEv1: FECompUltimoAutorizado
  -> persistir intento + próximo número
  -> WSFEv1: FECAESolicitar
       -> Aprobado: persistir CAE, vencimiento, observaciones y número
       -> Rechazado: persistir códigos/errores, permitir corrección controlada
       -> Timeout/fallo ambiguo: PENDING_RECONCILIATION
  -> WSFEv1: FECompConsultar para reconciliar
  -> comprobante + QR oficial
  -> entrega/descarga/email y evento outbox
```

El Ticket de Acceso de WSAA es específico por servicio y tiene duración limitada (ARCA indica
actualmente 12 horas). Debe cachearse por CUIT, servicio y ambiente con margen de renovación,
sin escribir Token, Sign, certificado o clave privada en logs.

### Métodos WSFEv1 prioritarios

- `FEDummy`: salud de infraestructura.
- `FECompUltimoAutorizado`: secuencia oficial.
- `FECAESolicitar`: autorización CAE.
- `FECompConsultar`: reconciliación/consulta de comprobante.
- `FEParamGetTiposCbte`, `FEParamGetTiposDoc`, `FEParamGetTiposIva`,
  `FEParamGetTiposMonedas`, `FEParamGetCotizacion` y demás métodos paramétricos:
  sincronización de códigos vigentes.
- Métodos CAEA: segunda etapa de contingencia, si el contribuyente y la operatoria quedan
  alcanzados/habilitados.

### Códigos iniciales

Los códigos no deberían quedar dispersos en el código; deben residir en un catálogo versionado.
Como base:

| Dominio Maitre | Código WSFEv1 |
|---|---:|
| FACTURA_A | 1 |
| NOTA_DEBITO_A | 2 |
| NOTA_CREDITO_A | 3 |
| FACTURA_B | 6 |
| NOTA_DEBITO_B | 7 |
| NOTA_CREDITO_B | 8 |
| FACTURA_C | 11 |
| NOTA_DEBITO_C | 12 |
| NOTA_CREDITO_C | 13 |
| CUIT | 80 |
| DNI | 96 |
| Consumidor final / sin identificar | 99 / 0, sujeto a validaciones vigentes |
| Pesos argentinos | PES, cotización 1 |

Antes de autorizar se deben consultar y cachear las tablas paramétricas oficiales. Los límites
de identificación de consumidor final cambian con la normativa; no deben hardcodearse como regla
eterna. A la fecha de esta investigación ARCA informa identificación obligatoria desde
$10.000.000, pero el sistema debe tratarlo como parámetro normativo versionado.

## IVA Simple y Libro IVA Digital

### Situación vigente

- Desde el período fiscal **noviembre de 2025**, responsables inscriptos presentan la DDJJ
  mensual mediante **IVA Simple** en “Portal IVA” (F.2051).
- Portal IVA muestra comprobantes emitidos y recibidos disponibles en las bases de ARCA y permite
  ajustes e importación de datos.
- Libro IVA Digital sigue vigente para los sujetos alcanzados por su texto vigente, en particular
  exentos, y para períodos/reglas anteriores que correspondan.
- La presentación se confirma con clave fiscal y carácter de declaración jurada.

No se encontró en el catálogo oficial un Web Service público general que permita a un software
SaaS presentar automáticamente IVA Simple o Libro IVA Digital en nombre del contribuyente. Sí
existen diseños de registro para **importar archivos** al Portal IVA. Por ello Maitre no debe
automatizar el portal mediante scraping ni declarar una presentación exitosa sin acuse oficial.

### Qué sí debe ofrecer Maitre

1. Libro de ventas interno derivado sólo de comprobantes autorizados.
2. Registro/importación de compras de proveedores.
3. Exportadores versionados conforme a los diseños oficiales vigentes:
   ventas, alícuotas de ventas, compras y alícuotas de compras, además de los archivos especiales
   que correspondan.
4. Validaciones de longitud, signo, fechas, códigos, totales y consistencia entre cabecera y
   alícuotas.
5. Conciliación mensual:
   - facturas Maitre vs. WSFEv1;
   - ventas/compras internas vs. archivos exportados;
   - totales por alícuota y tipo de comprobante;
   - excepciones y documentos faltantes.
6. Paquete descargable con manifiesto, hashes, versión normativa y reporte legible para contador.
7. Workflow de presentación humana: generado, descargado, presentado externamente, acuse cargado,
   observado o rectificado. “Exportado” nunca equivale a “presentado”.

IVA Simple exige además retenciones, percepciones, pagos a cuenta, saldos y otros datos que no
surgen sólo de la facturación del restaurante. Por eso la propuesta debe ser “asistencia y
conciliación contable”, no cálculo/presentación autónoma completa en la primera etapa.

## Otros servicios útiles

### Alta prioridad

**Consulta a Padrón Constancia de Inscripción (`ws_sr_constancia_inscripcion`)**

- Reemplaza al deprecado `ws_sr_padron_a5`.
- Sirve para validar CUIT, razón social y situación tributaria del receptor/proveedor.
- Reduce Facturas A mal emitidas y mejora el alta de proveedores.
- Debe conservarse la respuesta como snapshot con fecha; nunca como verdad eterna.

**Constatación de Comprobantes (`WSCDCV1`)**

- Verifica dinámicamente si una factura recibida está autorizada por ARCA.
- Es especialmente útil para el módulo de compras y control de crédito fiscal.
- Complementa, no reemplaza, la validación contable del proveedor y del documento.

**Tablas paramétricas WSFEv1**

- Mantienen tipos de comprobante, documentos, IVA, monedas, conceptos y puntos de venta.
- Deben sincronizarse y alertar cambios en lugar de depender únicamente de enums locales.

### Prioridad media

**CAEA / contingencia**

- ARCA exige contar con una modalidad de resguardo ante inconvenientes.
- La RG 5782/2025 introdujo un procedimiento de CAEA con aplicación desde junio de 2026.
- Requiere solicitud anticipada, información posterior de comprobantes usados/no usados,
  controles operativos y análisis de elegibilidad. No es sólo “otro CAE”.
- Conviene diseñarlo después de estabilizar CAE online y con revisión de contador.

**Controlador fiscal de nueva tecnología**

- Puede ser alternativa o contingencia para locales, pero exige hardware, homologación,
  configuración por fabricante y un punto de venta distinto.
- El modelo `FiscalPrinter` de Maitre permite incorporarlo como conector independiente; no debe
  mezclarse con WSFEv1.

**Factura de Crédito Electrónica MiPyME**

- Puede aplicar en operaciones B2B, no en la venta gastronómica usual a consumidor final.
- Requiere comprobantes y campos específicos. Debe activarse por entidad fiscal/caso de uso.

**Comprobantes T / exportación**

- Sólo son relevantes si un negocio presta alojamiento a turistas extranjeros o realiza
  operaciones de exportación; no pertenecen al MVP genérico de restaurantes.

### Servicios no ARCA pero relevantes

- **Ingresos Brutos**: padrón y alícuotas dependen de la jurisdicción (ARBA, AGIP, SIFERE/Convenio
  Multilateral). No existe una única integración nacional equivalente a WSFEv1.
- **SIRCREB/SIRTAC y retenciones/percepciones**: útiles para conciliación impositiva, pero
  corresponden a una fase contable posterior.
- **Medios de pago**: conciliación con adquirentes/billeteras ayuda a explicar diferencias de
  caja y percepciones, pero no reemplaza la emisión fiscal.

## Arquitectura recomendada

### Conector fiscal aislado

Crear un adapter real `Wsfev1ArcaAdapter` detrás del puerto actual, pero ampliar primero el
contrato. Debido al manejo de certificados, firma CMS, SOAP, locks y reconciliación, conviene
ejecutarlo en un proceso backend durable (por ejemplo, contenedor/worker) y no depender sólo de
una función serverless.

Componentes:

- `ArcaCredentialProvider`: obtiene certificado/clave desde secret manager.
- `WsaaClient`: genera TRA, firma CMS/PKCS#7, llama `loginCms` y cachea TA.
- `Wsfev1Client`: SOAP tipado, parámetros, autorización y consulta.
- `FiscalSequenceCoordinator`: lock transaccional/advisory por secuencia.
- `FiscalAuthorizationAttemptRepository`: request lógico, número, estado, códigos y timestamps.
- `ArcaReconciliationWorker`: recupera intentos ambiguos.
- `ArcaParameterSync`: sincroniza tablas oficiales.
- `OfficialFiscalQrRenderer`: URL/payload y SVG/PNG.
- `VatExportService`: archivos IVA versionados y manifiesto.

### Datos adicionales

Agregar como mínimo:

- fecha de comprobante y concepto;
- tipo/número de documento receptor;
- condición IVA del receptor;
- moneda ARCA y cotización;
- desglose de IVA por código y alícuota;
- otros tributos;
- período de servicio;
- códigos/observaciones/eventos devueltos por ARCA;
- request lógico idempotente;
- hash del payload normalizado;
- número de intento y estado de reconciliación;
- versión de WSDL/manual/tablas;
- acuse y estado externo de exportaciones IVA;
- comprobantes de compra y su constatación.

Guardar SOAP crudo sólo si existe política aprobada de cifrado, acceso y retención. Para soporte
normal alcanza con códigos, hashes, correlation ID y campos sanitizados.

### Controles de seguridad y operación

- Prohibir `simulated` cuando el ambiente de aplicación sea producción.
- No hacer fallback automático a simulación si `FISCAL_ARCA_DRIVER=wsfev1` falla.
- Separar secretos y endpoints de homologación/producción.
- Rotación y alertas previas al vencimiento de certificados.
- Redacción de CUIT/documentos en logs; jamás clave, certificado privado, Token o Sign.
- TLS y cadena de confianza según cronograma oficial.
- Health checks separados para WSAA y WSFEv1.
- Métricas de latencia, rechazos, timeouts, reconciliaciones y desvío de numeración.
- Auditoría de actor, factura, intento, respuesta y entrega del comprobante.

## Roadmap sugerido

### Fase 0 — definición fiscal y onboarding

- Confirmar con contador los perfiles soportados: Responsable Inscripto, Monotributo y Exento.
- Definir comprobante por combinación emisor/receptor.
- Definir tratamiento IVA por producto gastronómico y descuentos.
- Crear certificados y puntos de venta de homologación.
- Documentar recuperación ante caída y modalidad de resguardo.

### Fase 1 — homologación WSAA/WSFEv1

- Ampliar modelo/puertos.
- Implementar WSAA, WSFEv1 y tablas paramétricas.
- Corregir secuencia, concurrencia e idempotencia.
- Implementar reconciliación real.
- Fixtures SOAP y pruebas de contrato.
- Ejecutar matriz A/B/C y notas en homologación.

### Fase 2 — comprobante legal

- QR oficial.
- Plantilla PDF/HTML con todos los datos obligatorios.
- Descarga, email y reimpresión.
- Observaciones y errores accionables para el operador.
- Pruebas de importes, redondeo y consumidor final.

### Fase 3 — producción controlada

- Secret manager, certificados productivos y relaciones.
- Feature flag por entidad fiscal y punto de venta.
- Piloto con una entidad, un punto de venta y volumen acotado.
- Conciliación diaria contra `FECompConsultar`.
- Runbook, alertas, soporte y rollback a modalidad de contingencia válida.

### Fase 4 — IVA y compras

- Modelo de comprobantes recibidos.
- Padrón y WSCDCV1.
- Exportadores según diseños oficiales vigentes.
- Conciliación y paquete mensual para contador.
- Registro de acuse/presentación externa.

### Fase 5 — contingencia y extensiones

- Evaluar/implementar CAEA conforme a RG 5782 y elegibilidad real.
- Conectores de controladores fiscales.
- Ingresos Brutos por jurisdicción.
- Casos MiPyME/exportación/alojamiento sólo si existen clientes que los requieran.

## Criterios mínimos para habilitar producción

- Certificado y relación productiva válidos.
- Punto de venta Web Services creado y verificado.
- `FEDummy`, WSAA y tablas paramétricas saludables.
- Homologación documentada de todos los tipos habilitados.
- Numeración concurrente y timeout ambiguo probados.
- QR y representación impresa validados.
- Prohibición técnica de CAE simulado en producción.
- Conciliación y alertas activas.
- Método de resguardo definido.
- Aprobación del responsable fiscal/contador y runbook operativo firmado.

## Fuentes oficiales

- [Arquitectura general de Web Services ARCA](https://www.arca.gob.ar/ws/documentacion/arquitectura-general.asp)
- [WSAA: certificados, autorización y endpoints](https://arca.gob.ar/ws/documentacion/wsaa.asp)
- [Catálogo de Web Services de factura electrónica](https://arca.gob.ar/ws/documentacion/ws-factura-electronica.asp)
- [Manual vigente de WSFEv1](https://www.arca.gob.ar/fe/ayuda/documentos/wsfev1-RG-4291.pdf)
- [Solicitud de autorización y puntos de venta](https://arca.gob.ar/fe/emision-autorizacion/solicitud-autorizacion.asp)
- [Especificación oficial del QR](https://www.arca.gob.ar/fe/qr/documentos/QRespecificaciones.pdf)
- [Catálogo de otros Web Services: padrón y constatación](https://www.arca.gob.ar/ws/documentacion/catalogo.asp)
- [IVA Simple: sujetos alcanzados](https://arca.gob.ar/iva/iva-simple/sujetos-operaciones-alcanzadas.asp)
- [IVA Simple: confección y Portal IVA](https://www.arca.gob.ar/iva/iva-simple/confeccion-declaracion.asp)
- [IVA Simple: cronograma de implementación](https://www.arca.gob.ar/iva/iva-simple/cronograma-implementacion.asp)
- [RG 5707/2025 y cambios a Libro IVA Digital](https://biblioteca.arca.gob.ar/search/query/norma.aspx?p=t%3ARAG%7Cn%3A5707%7Co%3A9%7Ca%3A2025%7Cf%3A30%2F05%2F2025)
- [Especificaciones de carga de Libro IVA Digital](https://arca.gob.ar/iva/sujetos-exentos/ayuda/especificaciones-de-carga.asp)
- [RG 5782/2025: CAEA](https://biblioteca.arca.gob.ar/search/query/norma.aspx?p=t%3ARAG%7Cn%3A5782%7Co%3A9%7Ca%3A2025%7Cf%3A28%2F10%2F2025)
