# Alta y pruebas de facturación electrónica en homologación ARCA

Este runbook prepara el entorno de **testing/homologación**. No habilita producción.

## Estado aplicado — 29 de julio de 2026

El proyecto Supabase vinculado tiene aplicada la migración
`20260729210000_arca_fiscal_ownership_and_registration.sql`.

Para el tenant de desarrollo quedó configurado:

- una entidad fiscal `RI` con el CUIT de homologación autorizado;
- `legalName` y `displayName` temporales tomados de la marca existente
  (`Maitre Demo Brand`);
- la suscripción asociada mediante `subscriberFiscalEntityId`;
- `Sucursal Principal` asociada explícitamente a esa entidad fiscal;
- punto de venta `0001`, ambiente `HOMOLOGATION`, sistema `WSFEV1`;
- domicilio lógico `HOMOLOGACION-MAIN`;
- registro `DECLARED` con referencia no secreta a la autorización WSASS;
- auditoría append-only de todo el onboarding.

La razón social es deliberadamente temporal. Antes de producción debe reemplazarse por la
denominación exacta registrada en ARCA y deben completarse domicilio legal, domicilio fiscal y
actividad. `DECLARED` permite trabajar en homologación, pero no habilita emisión productiva.

## Endpoints

| Servicio | Endpoint |
|---|---|
| WSAA | `https://wsaahomo.afip.gov.ar/ws/services/LoginCms` |
| WSFEv1 | `https://wswhomo.afip.gov.ar/wsfev1/service.asmx` |
| WSDL WSFEv1 | `https://wswhomo.afip.gov.ar/wsfev1/service.asmx?WSDL` |

ARCA confirma oficialmente que dispone de ambientes separados de testing/homologación y
producción. Los certificados de testing no sirven en producción.

## 1. Adherir WSASS

1. Ingresar a ARCA con clave fiscal de una persona física autorizada.
2. Abrir “Administrador de Relaciones de Clave Fiscal”.
3. Adherir **WSASS – Autoservicio de Acceso a APIs de Homologación**.
4. Volver a ingresar y abrir WSASS.

Referencia oficial:
[certificados de testing](https://www.arca.gob.ar/ws/documentacion/certificados.asp).

## 2. Generar clave privada y CSR

Ejemplo local; la clave privada no debe enviarse a ARCA ni incorporarse a Git:

```bash
openssl genrsa -out arca-homologacion.key 2048
openssl req -new \
  -key arca-homologacion.key \
  -subj "/C=AR/O=MAITRE/CN=maitre-homologacion/serialNumber=CUIT 30XXXXXXXXX" \
  -out arca-homologacion.csr
```

Subir únicamente el CSR a WSASS para crear el certificado. Conservar la clave en un secret
manager. Procedimiento oficial:
[generación de CSR](https://www.arca.gob.ar/ws/WSASS/html/generarcsr.html).

## 3. Autorizar el servicio

En WSASS:

1. Crear o seleccionar el alias/certificado.
2. Elegir “Crear autorización a servicio”.
3. Seleccionar el servicio de Facturación Electrónica cuyo identificador para WSAA es `wsfe`.
4. Indicar la CUIT representada.
5. Verificar que la autorización figure activa.

## 4. Configurar Maitre

Inyectar desde el secret manager:

```dotenv
FISCAL_ARCA_DRIVER=wsfev1
ARCA_HOMOLOGATION_CUIT=30XXXXXXXXX
ARCA_HOMOLOGATION_CERTIFICATE_PEM=-----BEGIN CERTIFICATE-----...
ARCA_HOMOLOGATION_PRIVATE_KEY_PEM=-----BEGIN PRIVATE KEY-----...
```

También se aceptan saltos de línea representados como `\n`. No almacenar valores reales en
`.env.example`, Git, logs, navegador ni base de datos.

## 5. Matriz mínima de homologación

1. Obtener Ticket de Acceso WSAA.
2. Ejecutar `FEDummy`.
3. Consultar tablas paramétricas.
4. Consultar `FECompUltimoAutorizado`.
5. Emitir Factura B a consumidor final.
6. Emitir Factura A con CUIT y condición IVA.
7. Emitir Factura C para un emisor habilitado.
8. Emitir notas de crédito asociadas.
9. Consultar cada comprobante con `FECompConsultar`.
10. Probar rechazo determinista, certificado vencido y timeout ambiguo.
11. Confirmar que ningún secreto aparece en logs o respuestas API.

Homologación no reproduce necesariamente todas las validaciones productivas. Registrar request
normalizado, códigos, resultado y evidencia sin conservar secretos ni SOAP personal sin una
política aprobada.

### Evidencia ejecutada

- Certificado de testing y autorización `wsfe` creados en WSASS.
- Ticket de Acceso WSAA obtenido correctamente.
- `FEDummy` ejecutado contra WSFEv1 de homologación con estado correcto.
- Segundo intento protegido frente a la existencia de un Ticket de Acceso aún vigente; el smoke
  usa caché persistente para sus siguientes ejecuciones.
- No se emitió todavía un comprobante fiscal de prueba: falta completar y ejecutar la matriz
  funcional indicada arriba.

## Alta de sucursal y punto de venta

WSFEv1 no crea puntos de venta. La sucursal/domicilio debe declararse en Sistema Registral y el
punto debe darse de alta manualmente en **Administración de Puntos de Venta y Domicilios**,
seleccionando el sistema de emisión correspondiente. Luego se registra en Maitre:

1. `branchId` de una sucursal asociada explícitamente a la misma entidad fiscal.
2. Código de domicilio ARCA y código oficial del punto de venta.
3. Sistema emisor (`WSFEV1`, controlador fiscal, Comprobantes en Línea u otro).
4. Evidencia no secreta del alta y verificación por un operador autorizado.

Una sucursal puede tener varios puntos de venta; un punto pertenece a una única sucursal. Maitre
bloquea producción hasta que entidad, certificado y sucursal estén activos y el punto esté
`VERIFIED`.

## Controles productivos pendientes de operación

Antes de producción todavía se requieren:

- desplegar una única región de emisión o incorporar un coordinador distribuido si habrá varios
  procesos simultáneos (el adaptador coordina por secuencia dentro de cada proceso y ARCA sigue
  siendo la fuente oficial);
- ejecutar periódicamente la reconciliación de intentos ambiguos mediante `FECompConsultar`;
- QR y representación legal final;
- modalidad de contingencia;
- certificados/relaciones y puntos de venta productivos;
- reemplazar la razón social temporal y completar domicilios/actividad con datos registrales;
- registrar el punto productivo en ARCA y pasarlo a `VERIFIED` con evidencia;
- revisión del contador y runbook operativo;
- piloto por entidad fiscal y punto de venta.
