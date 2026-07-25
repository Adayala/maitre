# Contrato API — SPEC-088 QR Menu

Resolver un token público opaco a una sucursal y devolver únicamente la versión publicada
del menú, con precios, disponibilidad y alérgenos vigentes. El contrato no expone IDs
internos ni datos del tenant, admite cache con ETag y define expiración y rotación de
tokens. En I0 el payload expone `menu.name`, `menu.slug`, `menu.asOf`, categorías y productos
visibles, sin IDs internos. `ETag` se deriva del snapshot actual del menú. Tests cubren
enumeración, token inválido, payload redacted y cache básica.
