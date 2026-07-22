# Contrato de entidad — SPEC-143 Tax Rate

TaxRate modela una alícuota fiscal versionada con jurisdicción, código oficial, porcentaje
decimal, tratamiento, vigencia y alcance. Los intervalos no se solapan para la misma clave y
las facturas conservan el snapshot aplicado. Tests cubren límites, exento/no gravado,
vigencias, timezone fiscal, cambios futuros y retroactivos, selección determinista y
aislamiento entre tenants.
