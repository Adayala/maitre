const STAFF_GROUPS = [
  {
    title: "Front of house táctil",
    description: "Apps pensadas para recepción, salón y servicio, sobre tablets o teléfonos.",
    apps: [
      {
        label: "Host / Maître",
        url: "http://localhost:5178/",
        badge: "Recepción",
        summary: "Reservas, lista de espera, seating y snapshot de mesas.",
      },
      {
        label: "Waiter",
        url: "http://localhost:5176/",
        badge: "Servicio",
        summary: "Toma de pedidos, seguimiento de mesa y entrega.",
      },
      {
        label: "Cashier",
        url: "http://localhost:5174/",
        badge: "Cobro",
        summary: "Caja, movimientos, cierre y conciliación.",
      },
    ],
  },
  {
    title: "Back of house táctil",
    description: "Operación de producción y cocina sobre pantallas táctiles o monitores.",
    apps: [
      {
        label: "Kitchen",
        url: "http://localhost:5175/",
        badge: "Producción",
        summary: "KDS para comandas, estados y handoff.",
      },
    ],
  },
  {
    title: "Administración y supervisión",
    description: "Apps con mirada de owner/admin/manager para configuración y seguimiento.",
    apps: [
      {
        label: "Owner",
        url: "http://localhost:5177/",
        badge: "Control",
        summary: "Setup, overview y links a operación.",
      },
      {
        label: "Admin web",
        url: "http://localhost:5173/",
        badge: "Backoffice",
        summary: "Módulos generales, configuración y paneles existentes.",
      },
    ],
  },
  {
    title: "Cliente",
    description: "Experiencia discovery/reserva separada del backoffice.",
    apps: [
      {
        label: "Customer",
        url: "http://localhost:5179/",
        badge: "Público",
        summary: "Menú, sucursales, reserva y mis reservas.",
      },
    ],
  },
];

export function StaffShellPage() {
  return (
    <main className="staff-shell">
      <section className="staff-hero">
        <p className="staff-eyebrow">Maitre multiapp</p>
        <h1>Staff shell</h1>
        <p>
          Lanzador táctil por rol para coordinar front-of-house, cocina, caja, owner y customer sin mezclar experiencias.
        </p>
      </section>

      <section className="staff-grid">
        {STAFF_GROUPS.map((group) => (
          <article key={group.title} className="staff-card">
            <header className="staff-card-head">
              <div>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
            </header>

            <div className="staff-links">
              {group.apps.map((app) => (
                <a key={app.label} href={app.url} className="staff-link-card">
                  <span className="staff-badge">{app.badge}</span>
                  <strong>{app.label}</strong>
                  <span>{app.summary}</span>
                  <em>{app.url}</em>
                </a>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
