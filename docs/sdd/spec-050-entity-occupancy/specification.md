# Especificación — SPEC-050 Occupancy

Autoridad temporal de asignación Table↔Visit, con intervalo semiabierto `[startedAt,endedAt)`, guest
allocation, revision y status ACTIVE/CLOSED. Constraint impide dos ACTIVE por Table.

Seat/move/close bloquean todas las tables ordenadas por ID para evitar deadlock y escriben historia
atómicamente. Move crea/cierra intervals; nunca edita el inicio histórico. Cerrar una parte de una
Visit multi-table está permitido si capacity restante satisface policy. CLOSED no se reabre.
