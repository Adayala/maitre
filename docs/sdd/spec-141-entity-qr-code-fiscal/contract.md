# Contrato de entidad — SPEC-141 Fiscal QR Code

FiscalQrCode conserva versión de formato, payload canónico, hash y referencia al comprobante
autorizado del que se deriva. Sólo se genera con datos fiscales completos y nunca incorpora
secretos; regenerar el mismo comprobante produce idéntico payload. Tests cubren encoding,
decimales, fechas, identificación opcional, CAE, tamaño, caracteres, determinismo y fixtures
de validación oficial.
