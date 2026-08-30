# Spec: salida del gate de suscripción

Todo gate de suscripción en Host, Floor, Kitchen y Cash ofrece cambiar sucursal y cerrar sesión. Cambiar sucursal conserva el tenant pero fuerza una selección explícita aun cuando exista una sola opción; cerrar sesión revoca la sesión. Ninguna selección cruza tenants.
