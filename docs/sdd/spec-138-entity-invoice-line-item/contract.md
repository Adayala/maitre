# Contrato de entidad — SPEC-138 Invoice Line Item

InvoiceLineItem conserva descripción fiscal, cantidad decimal, unidad, precio, descuento,
alícuota, base e impuesto como snapshot de la operación. Sus importes satisfacen ecuaciones y
redondeos versionados; no dependen del catálogo después de emitir. Tests cubren cantidades,
bonificaciones, exentos/no gravados, múltiples alícuotas, redondeo por línea y total,
inmutabilidad, serialización y reconciliación.
