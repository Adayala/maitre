import { useMemo, useState } from "react";

type ProfileId =
  | "owner"
  | "admin"
  | "manager"
  | "maitre"
  | "waiter"
  | "cashier"
  | "cook"
  | "customer";

interface ProfileModule {
  name: string;
  capabilities: string[];
}

interface ProfileDefinition {
  id: ProfileId;
  label: string;
  type: "internal" | "public";
  badge: string;
  description: string;
  modules: ProfileModule[];
  notes?: string[];
}

const PROFILE_DEFINITIONS: ProfileDefinition[] = [
  {
    id: "owner",
    label: "Owner",
    type: "internal",
    badge: "Control total",
    description: "Visión completa del negocio y autoridad total sobre configuración, operación y reporting.",
    modules: [
      { name: "Organización", capabilities: ["Crear tenants, marcas y sucursales", "Gestionar usuarios y permisos"] },
      { name: "Operación", capabilities: ["Ver y operar floor, reservas, cocina y caja", "Acceder auditoría y dashboard"] },
      { name: "Fiscal", capabilities: ["Administrar facturación, certificados, plantillas y exportaciones"] },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    type: "internal",
    badge: "Administración",
    description: "Administra estructura, usuarios, catálogo y casi toda la operación diaria.",
    modules: [
      { name: "Organización", capabilities: ["Gestionar marcas, sucursales, salones y mesas", "Administrar usuarios, membresías y suscripciones"] },
      { name: "Operación", capabilities: ["Operar floor, reservas, ordering, cocina y caja", "Leer auditoría y métricas"] },
      { name: "Fiscal", capabilities: ["Operar facturación y configuración fiscal completa"] },
    ],
  },
  {
    id: "manager",
    label: "Manager",
    type: "internal",
    badge: "Supervisión",
    description: "Supervisa la operación, corrige excepciones y coordina equipos sin administrar el tenant.",
    modules: [
      { name: "Floor & reservas", capabilities: ["Supervisar seating, waitlist y service periods", "Autorizar correcciones operativas"] },
      { name: "Cocina & caja", capabilities: ["Gestionar excepciones de cocina y reconciliaciones", "Aprobar ajustes y descuentos"] },
      { name: "Backoffice", capabilities: ["Leer configuración y editar catálogo operativo"] },
    ],
  },
  {
    id: "maitre",
    label: "Maître",
    type: "internal",
    badge: "Front of house",
    description: "Coordina el salón: seating, reservas, waitlist y el enlace entre piso y cocina.",
    modules: [
      { name: "Floor", capabilities: ["Abrir, mover y cerrar visitas", "Gestionar ocupación y estado de mesas"] },
      { name: "Reservas", capabilities: ["Crear, confirmar, sentar y cancelar reservas", "Gestionar waitlist y prioridades"] },
      { name: "Cocina", capabilities: ["Leer cola y coordinar handoff/ready", "Resolver alertas operativas"] },
    ],
  },
  {
    id: "waiter",
    label: "Mozo",
    type: "internal",
    badge: "Servicio",
    description: "Opera las mesas asignadas: toma pedidos, acompaña reservas sentadas y entrega órdenes.",
    modules: [
      { name: "Floor", capabilities: ["Abrir, mover y cerrar visitas", "Leer mesa, cuenta y estado operativo"] },
      { name: "Ordering", capabilities: ["Crear, enviar, modificar y cancelar pedidos", "Marcar entrega al cliente"] },
      { name: "Reservas", capabilities: ["Leer reservas necesarias para operación", "Sentar reservas y gestionar waitlist básica"] },
    ],
  },
  {
    id: "cashier",
    label: "Cajero",
    type: "internal",
    badge: "Cobro",
    description: "Se enfoca en caja, cobros y conciliación operativa básica del turno.",
    modules: [
      { name: "Caja", capabilities: ["Abrir/cerrar sesión", "Registrar movimientos y conteos"] },
      { name: "Pagos", capabilities: ["Crear, capturar y refund pagos", "Liquidar checks"] },
      { name: "Soporte operativo", capabilities: ["Leer órdenes y checks para coordinación de cobro"] },
    ],
  },
  {
    id: "cook",
    label: "Cocina",
    type: "internal",
    badge: "Producción",
    description: "Trabaja la cola de producción y mueve los comandos por su ciclo de preparación.",
    modules: [
      { name: "Kitchen", capabilities: ["Claim/start/hold/ready/handoff de comandos", "Leer cola y estaciones asignadas"] },
      { name: "Ordering", capabilities: ["Leer órdenes relevantes para producción", "Actualizar líneas en preparación/listas"] },
      { name: "Contexto de piso", capabilities: ["Leer estado de mesa necesario para preparación/entrega"] },
    ],
  },
  {
    id: "customer",
    label: "Cliente",
    type: "public",
    badge: "Consulta pública",
    description:
      "Perfil externo de consulta. No es un rol interno RBAC: representa la experiencia pública/anónima del comensal antes de autenticarse.",
    modules: [
      { name: "Experiencia pública", capabilities: ["Ver menú publicado", "Consultar promociones y sucursales visibles sin login"] },
      { name: "Discovery", capabilities: ["Consultar disponibilidad resumida si habilitamos surface pública", "Iniciar flujo de reserva"] },
      { name: "Autenticación requerida", capabilities: ["Reservar requiere login del cliente", "Acciones con identidad derivan a superficie autenticada"] },
    ],
    notes: [
      "La consulta pública anónima no se modela como Role interno.",
      "Sirve para diseñar la futura app/portal customer-facing separado del backoffice.",
    ],
  },
];

export function ProfilesPage() {
  const [selectedProfileId, setSelectedProfileId] = useState<ProfileId>("maitre");

  const selectedProfile = useMemo(() => {
    const fallbackProfile = PROFILE_DEFINITIONS[0];
    if (!fallbackProfile) throw new Error("Profile definitions are required");
    return PROFILE_DEFINITIONS.find((profile) => profile.id === selectedProfileId) ?? fallbackProfile;
  }, [selectedProfileId]);

  return (
    <section aria-labelledby="profiles-heading" className="profiles-page">
      <div className="profiles-hero">
        <div>
          <h1 id="profiles-heading">Perfiles operativos</h1>
          <p>
            Visor de perfiles para entender qué experiencia necesita cada actor: mozo, cajero, cocina, maître,
            cliente y perfiles administrativos.
          </p>
        </div>
        <span className={`profile-pill profile-pill--${selectedProfile.type}`}>{selectedProfile.badge}</span>
      </div>

      <div className="profiles-layout">
        <aside className="profiles-sidebar" aria-label="Listado de perfiles">
          {PROFILE_DEFINITIONS.map((profile) => (
            <button
              key={profile.id}
              type="button"
              className={profile.id === selectedProfile.id ? "profile-link active" : "profile-link"}
              onClick={() => setSelectedProfileId(profile.id)}
            >
              <strong>{profile.label}</strong>
              <span>{profile.type === "public" ? "Público" : "Interno"}</span>
            </button>
          ))}
        </aside>

        <div className="profiles-detail">
          <header className="profile-card">
            <p className="profile-eyebrow">{selectedProfile.type === "public" ? "Perfil público" : "Perfil interno"}</p>
            <h2>{selectedProfile.label}</h2>
            <p>{selectedProfile.description}</p>
          </header>

          <div className="profile-module-grid">
            {selectedProfile.modules.map((module) => (
              <article key={module.name} className="profile-card">
                <h3>{module.name}</h3>
                <ul>
                  {module.capabilities.map((capability) => (
                    <li key={capability}>{capability}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {selectedProfile.notes?.length ? (
            <section className="profile-card" aria-labelledby="profile-notes-heading">
              <h3 id="profile-notes-heading">Notas</h3>
              <ul>
                {selectedProfile.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </section>
  );
}
