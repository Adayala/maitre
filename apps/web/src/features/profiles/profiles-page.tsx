import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
  primarySurface: string;
  interactionMode: string;
  focusSummary: string;
  appKey: string;
  modules: ProfileModule[];
  notes?: string[];
}

const PROFILE_DEFINITIONS: ProfileDefinition[] = [
  {
    id: "owner",
    label: "Dueño",
    type: "internal",
    badge: "Control total",
    description: "Visión completa del negocio y autoridad total sobre configuración, operación y reporting.",
    primarySurface: "Backoffice web",
    interactionMode: "No táctil / escritorio",
    focusSummary: "Decisiones, estructura y lectura transversal del negocio.",
    appKey: "web",
    modules: [
      { name: "Organización", capabilities: ["Crear tenants, marcas y sucursales", "Gestionar usuarios y permisos"] },
      { name: "Operación", capabilities: ["Ver y operar floor, reservas, cocina y caja", "Acceder auditoría y dashboard"] },
      { name: "Fiscal", capabilities: ["Administrar facturación, certificados, plantillas y exportaciones"] },
    ],
  },
  {
    id: "admin",
    label: "Administrador",
    type: "internal",
    badge: "Administración",
    description: "Administra estructura, usuarios, catálogo y casi toda la operación diaria.",
    primarySurface: "Backoffice web",
    interactionMode: "No táctil / escritorio",
    focusSummary: "Configuración diaria, usuarios y soporte operativo del tenant.",
    appKey: "web",
    modules: [
      { name: "Organización", capabilities: ["Gestionar marcas, sucursales, salones y mesas", "Administrar usuarios, membresías y suscripciones"] },
      { name: "Operación", capabilities: ["Operar floor, reservas, ordering, cocina y caja", "Leer auditoría y métricas"] },
      { name: "Fiscal", capabilities: ["Operar facturación y configuración fiscal completa"] },
    ],
  },
  {
    id: "manager",
    label: "Gerente",
    type: "internal",
    badge: "Supervisión",
    description: "Supervisa la operación, corrige excepciones y coordina equipos sin administrar el tenant.",
    primarySurface: "Web / tablet",
    interactionMode: "Mixto",
    focusSummary: "Supervisión operativa, autorizaciones y corrección de excepciones.",
    appKey: "web + host/floor",
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
    primarySurface: "Tablet táctil",
    interactionMode: "Táctil",
    focusSummary: "Seating, reservas, waitlist y coordinación de sala.",
    appKey: "host",
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
    primarySurface: "Mobile táctil",
    interactionMode: "Táctil",
    focusSummary: "Mesas, pedidos y seguimiento de servicio en piso.",
    appKey: "waiter",
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
    primarySurface: "Tablet / web táctil",
    interactionMode: "Táctil",
    focusSummary: "Cobro, caja y conciliación del turno.",
    appKey: "cashier",
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
    primarySurface: "KDS tablet / monitor",
    interactionMode: "Táctil",
    focusSummary: "Producción, prioridad de cola y handoff.",
    appKey: "kitchen",
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
      "Perfil externo de consulta. No es un rol interno de permisos: representa la experiencia pública/anónima del comensal antes de autenticarse.",
    primarySurface: "Web pública / mobile",
    interactionMode: "Self-service",
    focusSummary: "Discovery, reserva y seguimiento personal.",
    appKey: "customer / public web",
    modules: [
      { name: "Experiencia pública", capabilities: ["Ver menú publicado", "Consultar promociones y sucursales visibles sin login"] },
      { name: "Discovery", capabilities: ["Consultar disponibilidad resumida si habilitamos surface pública", "Iniciar flujo de reserva"] },
      { name: "Autenticación requerida", capabilities: ["Reservar requiere login del cliente", "Acciones con identidad derivan a superficie autenticada"] },
    ],
    notes: [
      "La consulta pública anónima no se modela como Role interno.",
      "Sirve para diseñar la futura app o portal orientado al cliente, separado del backoffice.",
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
  const profileChecklist = [
    { label: "Superficie principal definida", done: Boolean(selectedProfile.primarySurface) },
    { label: "Modo de interacción definido", done: Boolean(selectedProfile.interactionMode) },
    { label: "App asociada identificada", done: Boolean(selectedProfile.appKey) },
    { label: "Capacidades mapeadas", done: selectedProfile.modules.length > 0 },
  ];
  const profileLinks = getProfileLinks(selectedProfile);
  const profilePriority = getProfilePriority(selectedProfile);
  const profileStageCards = getProfileStageCards(selectedProfile);

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

      <article className={`overview-priority overview-priority--${profilePriority.tone}`}>
        <div className="overview-priority__copy">
          <span className="overview-priority__eyebrow">Lectura del perfil</span>
          <strong>{profilePriority.title}</strong>
          <p>{profilePriority.message}</p>
        </div>
      </article>

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

          <section className="profile-card" aria-label="Checklist del perfil">
            <h3>Checklist de diseño del perfil</h3>
            <div className="overview-checklist">
              {profileChecklist.map((step) => (
                <div key={step.label} className={`overview-check ${step.done ? "overview-check--done" : ""}`}>
                  <strong>{step.done ? "✓" : "•"}</strong>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="profile-module-grid" aria-label="Resumen del perfil">
            <article className="profile-card">
              <h3>Superficie principal</h3>
              <p>{selectedProfile.primarySurface}</p>
            </article>
            <article className="profile-card">
              <h3>Modo de interacción</h3>
              <p>{selectedProfile.interactionMode}</p>
            </article>
            <article className="profile-card">
              <h3>Foco principal</h3>
              <p>{selectedProfile.focusSummary}</p>
            </article>
            <article className="profile-card">
              <h3>App objetivo</h3>
              <p>{selectedProfile.appKey}</p>
            </article>
          </section>

          <section className="profile-card" aria-label="Atajos relacionados">
            <h3>Siguiente vista útil</h3>
            <div className="overview-link-grid">
              {profileLinks.map((link) => (
                <Link key={link.label} className="overview-link-card" to={link.to}>
                  <span>{link.eyebrow}</span>
                  <strong>{link.label}</strong>
                  <p>{link.detail}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="profile-card" aria-label="Decisiones del owner para este perfil">
            <h3>Qué debería decidir el owner</h3>
            <div className="owner-stage-grid">
              {profileStageCards.map((card) => (
                <Link key={card.label} className={`owner-stage-card owner-stage-card--${card.tone}`} to={card.to}>
                  <span>{card.label}</span>
                  <strong>{card.title}</strong>
                  <p>{card.detail}</p>
                </Link>
              ))}
            </div>
          </section>

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

function getProfilePriority(profile: ProfileDefinition) {
  if (profile.type === "public") {
    return {
      tone: "info" as const,
      title: "Este perfil representa una experiencia pública, no un rol interno",
      message: "Sirve para pensar discovery, reserva y seguimiento del cliente sin mezclarlo con roles y permisos internos.",
    };
  }

  if (profile.id === "owner" || profile.id === "admin") {
    return {
      tone: "success" as const,
      title: "Perfil de gobierno y configuración",
      message: "Este perfil mira el tenant de punta a punta y necesita contexto de backoffice más que velocidad táctil.",
    };
  }

  if (profile.id === "maitre" || profile.id === "waiter" || profile.id === "cashier" || profile.id === "cook") {
    return {
      tone: "warning" as const,
      title: "Perfil operacional en tiempo real",
      message: "Este perfil depende de fricción baja, foco táctil y decisiones rápidas durante el turno.",
    };
  }

  return {
    tone: "info" as const,
    title: "Perfil mixto de supervisión",
    message: "Necesita ver operación y al mismo tiempo conservar lectura amplia del tenant.",
  };
}

function getProfileLinks(profile: ProfileDefinition) {
  if (profile.type === "public") {
    return [
      {
        eyebrow: "Cliente",
        label: "Discovery y reserva",
        detail: "Revisar cómo la experiencia pública deriva desde consulta sin login hacia reserva autenticada.",
        to: "/subscription",
      },
      {
        eyebrow: "Arquitectura",
        label: "Mapa multiapp",
        detail: "Comparar este perfil con las apps táctiles e internas para no mezclar responsabilidades.",
        to: "/overview",
      },
    ];
  }

  if (profile.id === "owner" || profile.id === "admin") {
    return [
      {
        eyebrow: "Backoffice",
        label: "Resumen · Puesta en marcha",
        detail: "Validar estructura, sucursales y estado general del tenant.",
        to: "/setup",
      },
      {
        eyebrow: "Gobierno",
        label: "Usuarios / Suscripción",
        detail: "Cruzar permisos, capacidades y límites del tenant.",
        to: "/users",
      },
    ];
  }

  if (profile.id === "manager" || profile.id === "maitre") {
    return [
      {
        eyebrow: "Operación",
        label: "Host · Salón",
        detail: "Seguir seating, waitlist, reservas y ritmo del salón.",
        to: "/branches",
      },
      {
        eyebrow: "Coordinación",
        label: "Cocina · Caja",
        detail: "Conectar cocina, caja y piso sin perder visibilidad del turno.",
        to: "/overview",
      },
    ];
  }

  return [
    {
      eyebrow: "App operativa",
      label: profile.appKey,
      detail: "Este perfil ya tiene una app táctil específica como superficie principal.",
      to: "/branches",
    },
    {
      eyebrow: "Backoffice",
      label: "Perfiles · Resumen",
      detail: "Usar estas vistas para validar que el diseño del perfil siga alineado con foundations.",
      to: "/overview",
    },
  ];
}

function getProfileStageCards(profile: ProfileDefinition) {
  const isOperational =
    profile.id === "maitre" || profile.id === "waiter" || profile.id === "cashier" || profile.id === "cook";

  return [
    {
      label: "Superficie",
      title: profile.primarySurface,
      detail: "Define dónde vive la experiencia principal de este actor dentro de la plataforma.",
      tone: profile.type === "public" ? "info" : "success",
      to: "/overview",
    },
    {
      label: "Interacción",
      title: profile.interactionMode,
      detail: isOperational
        ? "Este perfil necesita baja fricción y decisiones rápidas durante el turno."
        : "Este perfil privilegia lectura amplia y control más que velocidad operativa.",
      tone: isOperational ? "warning" : "info",
      to: "/settings",
    },
    {
      label: "App",
      title: profile.appKey,
      detail: "El owner debería confirmar que la superficie objetivo coincide con el alcance real del perfil.",
      tone: "info",
      to: "/branches",
    },
    {
      label: "Gobierno",
      title: profile.type === "public" ? "No es rol interno" : "Cruzar con usuarios y permisos",
      detail:
        profile.type === "public"
          ? "La experiencia cliente no debe mezclarse con roles y permisos internos del staff."
          : "Después conviene validar quién usa este perfil y en qué sedes o apps.",
      tone: profile.type === "public" ? "warning" : "success",
      to: profile.type === "public" ? "/subscription" : "/users",
    },
  ] as const;
}
