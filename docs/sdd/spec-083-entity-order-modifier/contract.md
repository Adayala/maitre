# Contrato — SPEC-083 OrderModifier

Modifier es opción capturada para OrderItem: group/code, label snapshot, quantity, price
delta y kitchen instruction tipada. Debe pertenecer a una opción válida del Product al
capturar; reglas min/max/exclusividad se validan atómicamente. Texto libre no sustituye
alergenos ni permisos. Tras submit es inmutable salvo workflow de modificación. Tests
cubren combinaciones, precio, duplicados, límites y snapshot.
