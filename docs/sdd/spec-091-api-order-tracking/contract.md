# Contrato API — SPEC-091 Order Tracking

Consultar una proyección ordenada de estados de la orden y sus ítems, incluyendo timestamp,
estado actual, última actualización confirmada y metadata de freshness. El acceso público usa
token opaco y el interno exige contexto de tenant, permiso y scope de sucursal; la respuesta
declara consistencia eventual y cursor de actualización. En I0 el contrato se satisface con un
live snapshot del agregado (`projectionCursor = <orderId>:<revision>`), sin requerir todavía una
proyección materializada independiente. Tests cubren privacidad, redacción, metadata temporal y
aislamiento por alcance.
