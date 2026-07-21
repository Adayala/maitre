# Contrato — SPEC-082 OrderItem

OrderItem captura productId más snapshot de nombre, precio, impuestos, quantity y notas
permitidas. Status operativo es independiente por item y no se elimina tras submit; se
cancela con reason/actor. Quantity positiva y money exacto. Modifiers forman parte del
snapshot. Cambios de catálogo no alteran items existentes. Tests cubren cálculo, quantity,
cancelación, notas sanitizadas, immutable snapshot y preparación parcial.
