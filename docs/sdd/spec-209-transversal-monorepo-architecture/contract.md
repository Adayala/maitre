# Contrato transversal — SPEC-209 Monorepo Architecture

El monorepo separa apps, dominio, aplicación, contratos, adapters y tooling con dependencias
dirigidas hacia adentro. React y Node consumen paquetes TypeScript explícitos sin imports
profundos ni lógica de negocio en UI, handlers u ORM. Reglas automáticas detectan ciclos,
fronteras y APIs públicas; builds y tests son afectados, reproducibles y portables fuera de
Vercel.
