# Contrato de cálculo — SPEC-121 Payroll

Calcular minutos regulares, pausas, extras y nocturnidad desde intervalos aprobados y una
versión explícita de política, usando aritmética decimal y timezone IANA. El resultado es una
proyección explicable con inputs, reglas aplicadas y redondeos; no liquida salarios ni reemplaza
asesoría laboral. Tests de tablas doradas cubren DST, medianoche, feriados, solapamientos,
correcciones retroactivas, límites, determinismo y reconciliación.
