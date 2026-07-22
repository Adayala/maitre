# Especificación — SPEC-059 Payments API

Commands `create-intent`, `authorize`, `capture`, `void`, `refund`, `reconcile`. Amount/currency/
balance se validan contra Check revision. Idempotency end-to-end incluye provider operation.

Refund refiere capture y admite amount parcial acumulado <= captured. Timeout/callback ambiguo queda
PENDING_RECONCILIATION y se consulta antes de retry. Cash capture crea CashMovement una vez. API
nunca recibe/devuelve PAN, CVV, provider secrets ni referencias completas.
