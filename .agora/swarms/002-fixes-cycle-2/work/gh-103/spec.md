# Spec: aislamiento del release E2E

Los journeys de release nunca pueden apuntar a un entorno compartido: requieren perfil Postgres efímero, namespace por corrida y teardown incondicional sin backup, con verificación y evidencia. Los residuos históricos del demo se consideran datos operativos previos y no justifican borrado automático desde CI.
