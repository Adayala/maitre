# Contrato API — SPEC-088 QR Menu

Resolver un token público opaco a una sucursal y devolver únicamente la versión publicada
del menú, con precios, disponibilidad y alérgenos vigentes. El contrato no expone IDs
internos ni datos del tenant, admite cache con ETag y define expiración y rotación de
tokens. Tests cubren enumeración, token inválido o revocado, caché obsoleta, localización,
accesibilidad y aislamiento entre sucursales.
