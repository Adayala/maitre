# Especificación — SPEC-149 Tax Rates API

Lectura/resolución para tenants y administración restringida del catálogo normativo por plataforma.
No ofrece create arbitrario a usuarios tenant. Publicar/versionar exige NormativeSourceVersion,
reviewer fiscal, vigencia y no solapamiento.

Tenants administran mappings Product/tax category mediante endpoint separado. Resolve recibe fecha,
jurisdiction y treatment y devuelve versión/provenance; ausencia o ambigüedad falla seguro.

La API expone `GET /tax-rates` y `GET /tax-rates:resolve` para consumidores autorizados, con filtros
por jurisdicción, tipo, tratamiento, vigencia y fuente normativa. Para administración de plataforma
expone comandos restringidos como `POST /tax-rates`, `POST /tax-rates/{taxRateId}:publish` y
`POST /tax-rates/{taxRateId}:supersede`, siempre sujetos a workflow de revisión fiscal.

Errores usan `404` para scope ajeno o código inexistente, `409` para conflictos de solapamiento o
supersession inválida, `412` para revisión obsoleta y `422` para inputs normativamente ambiguos o sin
fuente aprobada. El resultado de `resolve` es autoritativo para downstream fiscal y debe devolver la
fuente/version exacta usada.
