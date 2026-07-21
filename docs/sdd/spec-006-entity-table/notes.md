# Notas — SPEC-006

**Key design:** Status is DERIVED, not stored.

Calculation logic:
- Has occupation now? → OCCUPIED
- Reserved + no occupation? → RESERVED
- Neither? → AVAILABLE
- Manual block? → BLOCKED
- Being cleaned? → CLEANING
