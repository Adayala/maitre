# NOTES — SPEC-145

## Conclusiones del spike

1. `WSFEv1` es una API oficial y apta para el núcleo de facturación electrónica de Maitre.
2. La integración exige certificados X.509, firma CMS, WSAA y asociación explícita del Web Service de negocio.
3. Libro IVA Digital dispone de especificaciones de archivos e importación por lote, pero no se encontró una API pública dedicada a su presentación automática.
4. La solución segura es exportación y conciliación asistida, sin scraping de Portal IVA.
5. `WSCDCV1` y padrón pueden reducir errores en compras, proveedores y configuración fiscal.

## Fuentes oficiales consultadas

- [Arquitectura general de Web Services ARCA](https://www.arca.gob.ar/ws/documentacion/arquitectura-general.asp)
- [WSAA: autenticación, certificados y URLs](https://arca.gob.ar/ws/documentacion/wsaa.asp)
- [Certificados para homologación y producción](https://www.arca.gob.ar/ws/documentacion/certificados.asp)
- [Web Services de factura electrónica](https://arca.gob.ar/ws/documentacion/ws-factura-electronica.asp)
- [Ayuda y manuales de factura electrónica](https://www.arca.gob.ar/fe/ayuda/webservice.asp)
- [Solicitud de autorización de comprobantes](https://arca.gob.ar/fe/emision-autorizacion/solicitud-autorizacion.asp)
- [Catálogo de Web Services de negocio](https://www.arca.gob.ar/ws/documentacion/catalogo.asp)
- [Libro IVA Digital: declaración jurada y presentación](https://arca.gob.ar/libro-iva-digital/procedimiento/declaracion-jurada.asp)
- [Libro IVA Digital: acceso por Portal IVA](https://arca.gob.ar/libro-iva-digital/procedimiento/acceso.asp)
- [Libro IVA Digital: manuales y diseños](https://arca.gob.ar/libro-iva-digital/ayuda/manuales.asp)
- [Libro IVA Digital: especificaciones de carga](https://arca.gob.ar/iva/sujetos-exentos/ayuda/especificaciones-de-carga.asp)
- [RG 4597 y modificatorias](https://biblioteca.arca.gob.ar/search/query/norma.aspx?p=t%3ARAG%7Cn%3A4597%7Co%3A3%7Ca%3A2019%7Cf%3A30%2F09%2F2019)

## Incertidumbre pendiente

La ausencia de una API pública de Libro IVA Digital es una conclusión basada en el catálogo y la documentación oficial disponible al 2026-07-21. Debe confirmarse con ARCA antes de cerrar la arquitectura productiva, porque pueden existir servicios restringidos, acuerdos especiales o cambios posteriores.
