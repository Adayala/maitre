# Contrato transversal — SPEC-214 Environments, Configuration & Secrets

Local, test, preview y production tienen límites explícitos y configuración validada al inicio
por schemas tipados. Secretos se referencian, rotan y redactan; jamás ingresan a Git, bundles,
logs o artifacts, y previews no alcanzan recursos productivos. Nombres portables desacoplan
Vercel/Supabase. Tests cubren variable ausente, mezcla de ambientes, exposición y rotación.
