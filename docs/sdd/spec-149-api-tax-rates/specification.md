# Especificación — SPEC-149 Tax Rates API

Lectura/resolución para tenants y administración restringida del catálogo normativo por plataforma.
No ofrece create arbitrario a usuarios tenant. Publicar/versionar exige NormativeSourceVersion,
reviewer fiscal, vigencia y no solapamiento.

Tenants administran mappings Product/tax category mediante endpoint separado. Resolve recibe fecha,
jurisdiction y treatment y devuelve versión/provenance; ausencia o ambigüedad falla seguro.
