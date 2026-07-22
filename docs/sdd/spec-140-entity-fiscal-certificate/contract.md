# Contrato de entidad — SPEC-140 Fiscal Certificate

FiscalCertificate guarda sólo metadatos y referencia secreta de un certificado por CUIT,
servicio y ambiente: fingerprint, issuer, vigencia, estado y fecha de rotación. Clave privada,
certificado completo y tickets jamás ingresan al dominio, logs o respuestas. Tests cubren
expiración, solapamiento de rotación, ambiente, revocación, clock skew, permisos, redacción y
aislamiento entre entidades fiscales.
