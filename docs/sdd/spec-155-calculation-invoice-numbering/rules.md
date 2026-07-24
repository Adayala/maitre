# Reglas — SPEC-155

- La secuencia se serializa por pointOfSale + voucherType.
- Candidate number no equivale a autorización.
- Timeout ambiguo bloquea avance hasta reconciliación.
- Nunca se reutiliza un número ni se consume otro a ciegas.
- Sólo el checkpoint remoto autorizado actualiza la secuencia.
