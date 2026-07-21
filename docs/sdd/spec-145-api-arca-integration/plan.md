# PLAN — SPEC-145

## Fase A — Homologación de factura electrónica

1. Crear CUIT/certificado de prueba en WSASS y asociar `wsfe`.
2. Implementar firma CMS y obtención/cache del Ticket de Acceso WSAA.
3. Generar cliente desde WSDL oficial y encapsularlo en `ArcaWsfeAdapter`.
4. Probar `FEDummy`, tablas, puntos de venta y último comprobante.
5. Emitir y consultar factura B, factura A, nota de crédito y nota de débito.
6. Simular timeout/reintento y demostrar reconciliación sin duplicados.

## Fase B — Libro IVA Digital asistido

1. Descargar y fijar la versión vigente de diseños y tablas de ARCA.
2. Mapear ventas autorizadas y compras validadas a los registros oficiales.
3. Generar TXT ANSI y ZIP dentro de límites documentados.
4. Crear validador previo y reporte de diferencias/totales.
5. Validar una carga manual completa en Portal IVA de homologación o entorno habilitado.

## Fase C — Servicios complementarios

1. Prototipar `WSCDCV1` para una factura de proveedor válida e inválida.
2. Validar alcance y autorización de padrón/constancia para CUIT de clientes y proveedores.
3. Definir costos operativos, límites, soporte y estrategia de degradación.

## Resultado

ADR con decisión de arquitectura, matriz de servicios habilitados, evidencia de homologación y backlog de implementación productiva.
