# SPECIFICATION — SPEC-145

## 1. Factura electrónica: integración disponible

ARCA ofrece Web Services SOAP oficiales accesibles por Internet sobre HTTPS. El acceso a cada Web Service de Negocio requiere un Ticket de Acceso de `WSAA`, generado con un certificado X.509 y una solicitud CMS firmada.

Para la operación habitual de restaurantes se recomienda `WSFEv1`:

- Emite comprobantes A, B, C y M sin detalle obligatorio de ítems.
- Permite solicitar CAE y, para ciertos comprobantes A/B, CAEA.
- Expone consultas de último comprobante autorizado, puntos de venta, tipos de comprobante, documento, moneda, IVA y tributos.
- Usa `service=wsfe` al solicitar el Ticket de Acceso en WSAA.
- El Ticket de Acceso tiene validez limitada; ARCA documenta actualmente 12 horas.

### Operaciones mínimas a prototipar

| Operación | Método ARCA | Uso en Maitre |
| --- | --- | --- |
| Estado del servicio | `FEDummy` | Health check |
| Último autorizado | `FECompUltimoAutorizado` | Correlatividad y recuperación |
| Solicitud de CAE | `FECAESolicitar` | Emitir factura/NC/ND |
| Consulta de comprobante | `FECompConsultar` | Reconciliar y recuperar resultado |
| Puntos de venta | `FEParamGetPtosVenta` | Configuración fiscal |
| Tablas paramétricas | `FEParamGet*` | Validación y sincronización |

### Servicios alternativos

- `WSMTXCA`: comprobantes A/B con detalle de ítems; evaluar solo si una obligación o caso comercial requiere detalle fiscal a nivel producto.
- `WSFEXv1`: factura E para exportación; fuera del MVP gastronómico local.
- `WSCT`: comprobantes T para alojamiento de turistas extranjeros; aplicable únicamente a productos futuros de hotelería.

## 2. Libro IVA Digital: sin API pública específica identificada

La documentación oficial revisada describe este flujo:

1. Acceso al servicio `PORTAL IVA` con clave fiscal y nivel de seguridad requerido.
2. Uso de comprobantes emitidos y recibidos existentes en las bases de ARCA.
3. Ajustes manuales o importación por lote de archivos propios.
4. Generación y presentación del Libro IVA Digital desde el portal.

ARCA publica diseños de registro, validaciones, tablas y carga mediante TXT/ZIP. No se identificó un Web Service público específico para crear, consultar o presentar el Libro IVA Digital de manera totalmente automática.

### Alcance propuesto para Maitre

- Construir un ledger fiscal inmutable de ventas, notas de crédito/débito y compras importadas.
- Generar archivos compatibles con los diseños vigentes de Libro IVA Digital.
- Validar formato, totales, alícuotas, tipos de comprobante y CUIT antes de exportar.
- Comparar el período con comprobantes autorizados por ARCA y marcar diferencias.
- Entregar un paquete descargable y una guía de presentación asistida en Portal IVA.
- Registrar quién generó, descargó y confirmó la presentación, sin afirmar que Maitre presentó el libro automáticamente.

## 3. Servicios complementarios recomendados

### Constatación de comprobantes (`WSCDCV1`)

Permite verificar dinámicamente si comprobantes recibidos están autorizados por ARCA. Es útil para validar facturas de proveedores antes de incorporarlas al libro de compras.

### Padrón y constancia de inscripción

- `ws_sr_constancia_inscripcion`: consulta de constancia de inscripción; reemplaza al antiguo Alcance 5, que está deprecado.
- `ws_sr_padron_a4`: situación tributaria, impuestos y regímenes de un contribuyente.
- `ws_sr_padron_a10`: datos resumidos de padrón.

Usos: alta de entidad fiscal, validación de CUIT, condición frente al IVA y enriquecimiento de proveedores/clientes.

## 4. Ambientes

- **Homologación:** certificados gestionados mediante WSASS y endpoints de testing.
- **Producción:** certificados mediante Administración de Certificados Digitales y delegación/asociación del servicio con Administrador de Relaciones de Clave Fiscal.

Los certificados y claves privadas son secretos por tenant y ambiente; nunca deben almacenarse en texto plano ni compartirse entre CUIT.
