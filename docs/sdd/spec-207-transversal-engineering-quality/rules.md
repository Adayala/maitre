# RULES — SPEC-207

1. **Diseño primero:** separar dominio, aplicación, adaptadores e interfaces de entrega.
2. **DRY con criterio:** extraer conocimiento estable repetido, no crear abstracciones por coincidencia superficial.
3. **SOLID pragmático:** dependencias hacia contratos propios; módulos pequeños y cohesionados.
4. **KISS:** preferir la solución más simple que cumple la spec y los atributos de calidad.
5. **YAGNI:** no implementar escenarios futuros sin spec, manteniendo puntos de extensión donde el riesgo lo justifique.
6. **TypeScript estricto:** prohibido `any` implícito; `unknown` se valida en fronteras.
7. **Validación en fronteras:** toda entrada externa se parsea y valida antes del dominio.
8. **Errores explícitos:** no ocultar fallos ni usar excepciones genéricas como contrato.
9. **Seguridad por defecto:** mínimo privilegio, secretos fuera del código y logs redactados.
10. **Multi-tenancy por defecto:** toda lectura/escritura operacional demuestra aislamiento de tenant.
11. **Dependencias justificadas:** cada paquete nuevo debe aportar valor mayor a su costo, riesgo y lock-in.
12. **Comentarios útiles:** documentan por qué; el código expresa qué y cómo.
13. **Excepciones temporales:** requieren issue, responsable, vencimiento y riesgo aceptado.
14. **CI inmutable:** la rama principal nunca recibe cambios que evadan gates obligatorios.
