# Contrato de presupuesto y cuotas

## Registro por recurso

Cada provider/resource registra: plan y fecha de consulta, hard/soft limit, unidad, ventana,
consumo medido, fuente de métrica, threshold warning/stop, owner, degradación, kill switch y export.
Incluye como mínimo Vercel builds/runtime/egress, Supabase compute/storage/egress/realtime/auth,
CI minutes/artifacts, email/webhooks y cualquier ML/LLM.

## Estados

`NOT_MEASURED | WITHIN_BUDGET | WARNING | STOPPED | EXCEEDED | UNKNOWN`. Sin medición vigente el
estado es NOT_MEASURED/UNKNOWN y bloquea habilitar una capability con costo variable.

## Política USD 0

- auto-upgrade y on-demand billing deshabilitados;
- warning a 70%, stop/degrade a 85% por default, ajustable sólo con decisión registrada;
- preview resources tienen TTL/cleanup;
- ML/LLM pago queda OFF en MVP y usa fallback determinista;
- superar USD 0 o habilitar tráfico comercial exige decisión explícita con nuevo budget.

No se consignan cuotas numéricas hasta verificarlas y medirlas; este contrato evita convertir una
estimación documental en evidencia.
