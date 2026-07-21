# Contrato API — SPEC-091 Order Tracking

Consultar una proyección ordenada de estados de la orden y sus ítems, incluyendo timestamp,
estado actual y última actualización confirmada. El acceso público usa token opaco y el
interno exige contexto de tenant; la proyección tolera consistencia eventual y declara su
cursor de actualización. Tests cubren eventos duplicados o desordenados, atrasos, estados
terminales, revocación del token, privacidad y reconstrucción determinista.
