# Contrato transversal — SPEC-210 Data & Identity Platform

PostgreSQL y puertos propios son autoridad de datos; Supabase Free es adapter candidato sujeto
a ADR y spikes. Identidad externa autentica, mientras Maitre autoriza tenant y sucursal en
servidor con deny-by-default y RLS como defensa adicional. Migraciones, backups y export deben
ser portables. Secrets, service role y lógica privilegiada nunca alcanzan el browser.
