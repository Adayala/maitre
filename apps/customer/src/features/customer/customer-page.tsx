import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth, isSupabaseConfigured } from "../../app/auth-context.js";
import { useSession } from "../../app/session-context.js";
import { useApi } from "../../app/use-api.js";
import { StateView } from "../../components/state-view.js";
import { useBrandPresentation } from "../../../../../packages/brand-presentation/src/index.js";

const PUBLIC_MENU_TOKEN = "demo-qr-menu-token";
const PUBLIC_API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:3001";
const PARTY_SIZE_PRESETS = ["1", "2", "4", "6", "8"];
const DURATION_PRESETS = ["60", "90", "120"];

interface PublicMenuPayload {
  data: {
    menu: { name: string; slug: string; asOf: string };
    subscribedServices: string[];
    categories: Array<{
      name: string;
      products: Array<{ name: string; priceMinorUnits: number; currency: string }>;
    }>;
  };
}

interface PublicBranchPayload {
  data: {
    branch: {
      id: string;
      name: string;
      code: string;
      timezone: string;
      contactEmail: string | null;
      contactPhone: string | null;
    };
    subscribedServices: string[];
  };
}

interface ReservationListItem {
  id: string;
  branchId: string;
  partySize: number;
  startAt: string;
  durationMinutes: number;
  status: string;
  notes?: string | null;
}

interface ReservationListResponse {
  data: ReservationListItem[];
}

interface ReservationResponse {
  data: ReservationListItem;
}

interface AvailabilityResponse {
  data: {
    asOf: string;
    timezone: string;
    freshness: "LIVE";
    startAt: string;
    durationMinutes: number;
    available: boolean;
    freeTableIds: string[];
  };
}

type CustomerTab = "discover" | "menu" | "branches" | "reserve" | "mine";

interface TimePreset {
  label: string;
  value: string;
}

type TimePresetConfig =
  | { label: string; hoursOffset: number }
  | { label: string; dayOffset?: number; fixedHour: number; fixedMinute: number };

export function CustomerPage() {
  const brand = useBrandPresentation();
  const queryClient = useQueryClient();
  const api = useApi();
  const { accessToken, email, signInWithPassword, signInWithToken, signOut } = useAuth();
  const { me, tenants, isLoading, error, selectedTenantId, selectedBranchId, selectTenant, selectBranch } = useSession();

  const [tab, setTab] = useState<CustomerTab>("discover");
  const [fixtureToken, setFixtureToken] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [partySize, setPartySize] = useState("2");
  const [startAt, setStartAt] = useState(defaultDateTimeLocal());
  const [durationMinutes, setDurationMinutes] = useState("90");
  const [notes, setNotes] = useState("");
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const selectedTenant = tenants.find((tenant) => tenant.id === selectedTenantId) ?? null;
  const branches = selectedTenant?.branches ?? [];
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) ?? null;
  const branchNameById = useMemo(
    () =>
      new Map(
        tenants.flatMap((tenant) =>
          tenant.branches.map((branch) => [branch.id, `${branch.name} (${branch.code})`] as const),
        ),
      ),
    [tenants],
  );

  const menuQuery = useQuery({
    queryKey: ["customer-public-menu", PUBLIC_MENU_TOKEN],
    queryFn: async () => {
      const response = await fetch(`${PUBLIC_API_URL}/public/menu/${PUBLIC_MENU_TOKEN}`);
      if (!response.ok) throw new Error("No se pudo cargar el menú público");
      return (await response.json()) as PublicMenuPayload;
    },
  });

  const branchesQuery = useQuery({
    queryKey: ["customer-public-branch", PUBLIC_MENU_TOKEN],
    queryFn: async () => {
      const response = await fetch(`${PUBLIC_API_URL}/public/branches/${PUBLIC_MENU_TOKEN}`);
      if (!response.ok) throw new Error("No se pudieron cargar las sucursales públicas");
      return (await response.json()) as PublicBranchPayload;
    },
  });
  const subscribedServices = branchesQuery.data?.data.subscribedServices ?? [];
  const canUseMenu = subscribedServices.includes("QR_MENU");
  const canUseReservations = subscribedServices.includes("RESERVATIONS");

  const canCheckAvailability =
    Boolean(canUseReservations && accessToken && selectedTenantId && selectedBranchId && startAt && Number(partySize) > 0 && Number(durationMinutes) > 0);

  const availabilityQuery = useQuery({
    queryKey: ["customer-availability", selectedTenantId, selectedBranchId, partySize, startAt, durationMinutes],
    enabled: canCheckAvailability,
    queryFn: () =>
      api<AvailabilityResponse>(
        `/v1/branches/${selectedBranchId}/availability?partySize=${encodeURIComponent(
          partySize,
        )}&startAt=${encodeURIComponent(new Date(startAt).toISOString())}&durationMinutes=${encodeURIComponent(durationMinutes)}`,
      ),
  });

  const reservationsQuery = useQuery({
    queryKey: ["customer-my-reservations", selectedTenantId],
    enabled: Boolean(canUseReservations && accessToken && selectedTenantId),
    queryFn: () => api<ReservationListResponse>("/v1/my/reservations"),
  });

  const createReservationMutation = useMutation({
    mutationFn: () =>
      api<ReservationResponse>("/v1/my/reservations", {
        method: "POST",
        body: {
          branchId: selectedBranchId,
          partySize: Number(partySize),
          startAt: new Date(startAt).toISOString(),
          durationMinutes: Number(durationMinutes),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      }),
    onSuccess: async () => {
      setFlashMessage("Reserva creada correctamente.");
      setNotes("");
      await queryClient.invalidateQueries({ queryKey: ["customer-my-reservations"] });
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: (reservationId: string) =>
      api<ReservationResponse>(`/v1/my/reservations/${reservationId}/cancel`, {
        method: "POST",
        body: { reasonCode: "GUEST_REQUEST" },
      }),
    onSuccess: async () => {
      setFlashMessage("Reserva cancelada.");
      await queryClient.invalidateQueries({ queryKey: ["customer-my-reservations"] });
    },
  });

  const nextBranches = useMemo(() => branches, [branches]);
  const sortedReservations = useMemo(
    () =>
      (reservationsQuery.data?.data ?? [])
        .slice()
        .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt)),
    [reservationsQuery.data],
  );
  const upcomingReservations = useMemo(
    () =>
      sortedReservations.filter(
        (reservation) =>
          Date.parse(reservation.startAt) >= Date.now() &&
          reservation.status !== "CANCELLED" &&
          reservation.status !== "NO_SHOW",
      ),
    [sortedReservations],
  );
  const pastReservations = useMemo(
    () =>
      sortedReservations
        .filter(
          (reservation) =>
            Date.parse(reservation.startAt) < Date.now() ||
            reservation.status === "CANCELLED" ||
            reservation.status === "NO_SHOW",
        )
        .reverse(),
    [sortedReservations],
  );
  const timePresets = useMemo(() => buildTimePresets(), []);
  const nextReservation = useMemo(
    () => upcomingReservations[0] ?? null,
    [upcomingReservations],
  );
  const reservationChecklist = [
    { label: "Sesión iniciada", done: Boolean(accessToken) },
    { label: "Restaurante identificado", done: Boolean(selectedTenantId) },
    { label: "Sucursal elegida", done: Boolean(selectedBranchId) },
    { label: "Horario cargado", done: Boolean(startAt) },
  ];
  const reservationReady = reservationChecklist.every((step) => step.done);
  const reservationPending = reservationChecklist.filter((step) => !step.done).map((step) => step.label);
  const reservePriority = getCustomerReservePriority({
    accessToken: Boolean(accessToken),
    selectedTenantId,
    selectedBranchId,
    reservationReady,
    availability: availabilityQuery.data?.data.available ?? null,
    nextReservation,
  });
  const reserveActionPlan = getCustomerReserveActionPlan({
    accessToken: Boolean(accessToken),
    selectedTenantId,
    selectedBranch,
    startAt,
    availability: availabilityQuery.data?.data.available ?? null,
  });
  const customerNextAction = getCustomerNextAction({
    accessToken: Boolean(accessToken),
    selectedTenantId,
    selectedBranch,
    nextReservation,
  });
  const reservationFollowUp = getCustomerReservationFollowUp({
    nextReservation,
    upcomingCount: upcomingReservations.length,
    historyCount: pastReservations.length,
  });
  const menuNextStep = getCustomerBrowseNextStep({
    accessToken: Boolean(accessToken),
    selectedBranch,
    selectedBranchId,
    source: "menu",
  });
  const branchesNextStep = getCustomerBrowseNextStep({
    accessToken: Boolean(accessToken),
    selectedBranch,
    selectedBranchId,
    source: "branches",
  });

  async function handlePasswordLogin(event: FormEvent) {
    event.preventDefault();
    setLoginError(null);
    setIsAuthenticating(true);
    try {
      await signInWithPassword(loginEmail, loginPassword);
      setFlashMessage("Sesión iniciada. Ya podés pasar del modo público al flujo de reserva.");
      setTab(selectedBranchId ? "reserve" : "branches");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleFixtureLogin() {
    setLoginError(null);
    setIsAuthenticating(true);
    try {
      signInWithToken(fixtureToken.trim());
      setFlashMessage("Acceso local resuelto. Continuá con la elección de sucursal.");
      setTab(selectedBranchId ? "reserve" : "branches");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleChooseBranch(branchId: string, nextTab: CustomerTab = "reserve") {
    selectBranch(branchId);
    setTab(nextTab);
  }

  return (
    <main className="customer-app">
      <section className="customer-shell">
        <section className="customer-hero">
          <div
            className="customer-brand-intro"
            style={brand.assets.hero?.url ? { backgroundImage: `linear-gradient(90deg, rgba(20, 15, 10, .86), rgba(20, 15, 10, .24)), url("${brand.assets.hero.url}")` } : undefined}
          >
            {brand.assets.logoDark?.url || brand.assets.logo?.url ? (
              <img src={brand.assets.logoDark?.url ?? brand.assets.logo?.url} alt={brand.identity.displayName ?? "Marca"} />
            ) : null}
            <div>
              <p className="customer-eyebrow">Experiencia cliente</p>
              <h1>{brand.identity.displayName ?? "Maitre"}</h1>
              <p>{brand.identity.tagline ?? "Descubrí el menú, elegí tu sucursal y reservá tu mesa."}</p>
              <div className="customer-brand-actions">
                {canUseMenu ? (
                  <button type="button" className="btn btn--primary btn--xl" onClick={() => setTab("menu")}>
                    Ver menú
                  </button>
                ) : null}
                {canUseReservations ? (
                  <button type="button" className="btn btn--hero-secondary btn--xl" onClick={() => setTab("reserve")}>
                    Reservar una mesa
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <nav className="cashier-segmented customer-public-nav" aria-label="Navegación del restaurante">
            <button type="button" className={`seg-btn ${tab === "discover" ? "seg-btn--active" : ""}`} onClick={() => setTab("discover")}>
              Inicio
            </button>
            {canUseMenu ? (
              <button type="button" className={`seg-btn ${tab === "menu" ? "seg-btn--active" : ""}`} onClick={() => setTab("menu")}>
                Menú
              </button>
            ) : null}
            <button type="button" className={`seg-btn ${tab === "branches" ? "seg-btn--active" : ""}`} onClick={() => setTab("branches")}>
              Sucursales
            </button>
            {canUseReservations ? (
              <>
                <button type="button" className={`seg-btn ${tab === "reserve" ? "seg-btn--active" : ""}`} onClick={() => setTab("reserve")}>
                  Reservar
                </button>
                <button type="button" className={`seg-btn ${tab === "mine" ? "seg-btn--active" : ""}`} onClick={() => setTab("mine")}>
                  {accessToken ? "Mis reservas" : "Acceso"}
                </button>
              </>
            ) : null}
          </nav>
        </section>

        {flashMessage ? (
          <div className="cashier-banner cashier-banner--success">
            <span>{flashMessage}</span>
            <button type="button" className="btn btn--ghost" onClick={() => setFlashMessage(null)}>
              Ocultar
            </button>
          </div>
        ) : null}

        {tab === "mine" ? <section className="customer-grid customer-account-panel">
          <article className="cashier-card">
            <h2 className="owner-card-title">Acceso</h2>
            <p className="owner-card-copy">
              Podés descubrir menú y sucursales sin cuenta. El login aparece recién cuando querés reservar o seguir tu historial.
            </p>
            <div className="customer-mode-grid">
              <div className={`customer-mode-card ${!accessToken ? "customer-mode-card--active" : ""}`}>
                <span className="customer-mode-card__eyebrow">Modo público</span>
                <strong>Exploración sin login</strong>
                <p>Ver menú, propuesta y sucursales públicas antes de decidir.</p>
                <div className="customer-mode-card__actions">
                  <button type="button" className="btn btn--ghost" onClick={() => setTab("menu")}>
                    Ver menú
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => setTab("branches")}>
                    Ver sucursales
                  </button>
                </div>
              </div>
              <div className={`customer-mode-card ${accessToken ? "customer-mode-card--active" : ""}`}>
                <span className="customer-mode-card__eyebrow">Modo identificado</span>
                <strong>Reserva y seguimiento</strong>
                <p>Elegir sucursal, reservar y revisar tus próximas visitas.</p>
                <div className="customer-mode-card__actions">
                  <button type="button" className="btn btn--primary" onClick={() => setTab(accessToken ? "reserve" : "mine")}>
                    {accessToken ? "Continuar reserva" : "Ir a acceso"}
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => setTab(accessToken ? "mine" : "discover")}>
                    {accessToken ? "Ver mis reservas" : "Volver al inicio"}
                  </button>
                </div>
              </div>
            </div>
            {!accessToken ? (
              <>
                {isSupabaseConfigured ? (
                  <form className="cashier-form" onSubmit={handlePasswordLogin}>
                    <label>
                      Email
                      <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                    </label>
                    <label>
                      Contraseña
                      <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                    </label>
                    <button
                      type="submit"
                      className="btn btn--primary btn--xl"
                      disabled={isAuthenticating || !loginEmail.trim() || !loginPassword.trim()}
                    >
                      {isAuthenticating ? "Ingresando…" : "Ingresar"}
                    </button>
                  </form>
                ) : (
                  <div className="cashier-form">
                    <label>
                      Token local
                      <input
                        value={fixtureToken}
                        onChange={(e) => setFixtureToken(e.target.value)}
                        placeholder="Bearer token"
                      />
                    </label>
                    <button
                      type="button"
                      className="btn btn--primary btn--xl"
                      onClick={handleFixtureLogin}
                      disabled={isAuthenticating || !fixtureToken.trim()}
                    >
                      {isAuthenticating ? "Validando…" : "Continuar"}
                    </button>
                  </div>
                )}
                {loginError ? <p className="login-error">{loginError}</p> : null}
              </>
            ) : (
              <div className="customer-auth-state">
                <strong>{email ?? me?.user.displayName ?? "Sesión iniciada"}</strong>
                <p>Ya podés reservar y ver tus reservas.</p>
                <button type="button" className="btn btn--ghost" onClick={() => void signOut()}>
                  Cerrar sesión
                </button>
              </div>
            )}
          </article>

          {accessToken ? (
            <article className="cashier-card">
              <h2 className="owner-card-title">Contexto</h2>
              <StateView
                isLoading={isLoading}
                error={error ?? null}
                isEmpty={tenants.length === 0}
                emptyIcon="🏢"
                emptyTitle="Sin restaurante"
                emptyMessage="La cuenta no tiene restaurantes disponibles."
              >
                <div className="cashier-form">
                  <label>
                    Restaurante
                    <select value={selectedTenantId ?? ""} onChange={(e) => selectTenant(e.target.value)}>
                      <option value="">Elegí restaurante</option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Sucursal
                    <select value={selectedBranchId ?? ""} onChange={(e) => selectBranch(e.target.value)} disabled={!selectedTenantId}>
                      <option value="">Elegí sucursal</option>
                      {nextBranches.map((branch) => (
                        <option key={branch.id} value={branch.id}>{branch.name} ({branch.code})</option>
                      ))}
                    </select>
                  </label>
                </div>
                {selectedTenantId && nextBranches.length > 0 ? (
                  <div className="customer-branch-picker">
                    <span className="customer-preset-label">Elegí sucursal rápido</span>
                    <div className="customer-branch-list">
                      {nextBranches.map((branch) => (
                        <button
                          key={branch.id}
                          type="button"
                          className={`customer-branch-card ${selectedBranchId === branch.id ? "customer-branch-card--active" : ""}`}
                          onClick={() => selectBranch(branch.id)}
                        >
                          <strong>{branch.name}</strong>
                          <span>{branch.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </StateView>
            </article>
          ) : null}
        </section> : null}

        {tab === "discover" ? (
          <section className="customer-home">
            <article className="cashier-card customer-home__welcome">
              <p className="customer-eyebrow">Bienvenidos</p>
              <h2 className="owner-card-title">Una mesa para disfrutar sin apuro</h2>
              <p className="owner-card-copy">
                Conocé nuestra propuesta, explorá la carta y elegí dónde querés encontrarnos.
              </p>
              <div className="cashier-quick-actions">
                {canUseMenu ? <button type="button" className="btn btn--primary" onClick={() => setTab("menu")}>Explorar la carta</button> : null}
                <button type="button" className="btn btn--ghost" onClick={() => setTab("branches")}>Conocer sucursales</button>
              </div>
            </article>
            <article className="cashier-card customer-home__feature">
              <p className="customer-eyebrow">Nuestra propuesta</p>
              <h2 className="owner-card-title">Sabores reconocibles, producto de estación</h2>
              <p className="owner-card-copy">
                Una carta pensada para compartir, con opciones claras y precios visibles antes de tu visita.
              </p>
              {canUseMenu ? (
                <button type="button" className="customer-text-link" onClick={() => setTab("menu")}>
                  Ver el menú completo →
                </button>
              ) : null}
            </article>
            <article className="cashier-card customer-home__feature">
              <p className="customer-eyebrow">Tu visita</p>
              <h2 className="owner-card-title">Elegí la sucursal que te quede mejor</h2>
              <p className="owner-card-copy">
                Consultá ubicación y datos de contacto, y reservá cuando ya tengas decidido dónde ir.
              </p>
              <div className="cashier-quick-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setTab("branches")}>
                  Ver sucursales
                </button>
                {canUseReservations ? (
                  <button type="button" className="btn btn--primary" onClick={() => setTab("reserve")}>
                    Reservar mesa
                  </button>
                ) : null}
              </div>
            </article>
          </section>
        ) : null}

        {tab === "menu" && canUseMenu ? (
          <section className="customer-grid">
            <article className="cashier-card">
              <h2 className="owner-card-title">Menú público</h2>
              <StateView isLoading={menuQuery.isLoading} error={(menuQuery.error as Error) ?? null} onRetry={() => void menuQuery.refetch()}>
                {menuQuery.data ? (
                  <div className="owner-links">
                    <div className="owner-link-card">
                      <strong>{menuQuery.data.data.menu.name}</strong>
                      <span>{new Date(menuQuery.data.data.menu.asOf).toLocaleString("es-AR")}</span>
                    </div>
                    {menuQuery.data.data.categories.map((category) => (
                      <article key={category.name} className="owner-link-card">
                        <strong>{category.name}</strong>
                        <span>
                          {(category.products ?? [])
                            .map((product) => `${product.name} · ${(product.priceMinorUnits / 100).toLocaleString("es-AR")} ${product.currency}`)
                            .join(" · ")}
                        </span>
                      </article>
                    ))}
                  </div>
                ) : null}
              </StateView>
            </article>
            <article className="cashier-card">
              <div className={`cashier-banner ${menuNextStep.tone === "success" ? "cashier-banner--success" : "cashier-banner--info"}`}>
                <span>{menuNextStep.title}</span>
              </div>
              <p className="owner-card-copy">{menuNextStep.detail}</p>
              <div className="cashier-quick-actions">
                <button type="button" className="btn btn--primary" onClick={() => setTab(menuNextStep.nextTab)}>
                  {menuNextStep.ctaLabel}
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => setTab("branches")}>
                  Ver sucursales
                </button>
              </div>
            </article>
          </section>
        ) : null}

        {tab === "branches" ? (
          <section className="customer-grid">
            <article className="cashier-card">
              <h2 className="owner-card-title">Sucursales</h2>
              <StateView isLoading={branchesQuery.isLoading} error={(branchesQuery.error as Error) ?? null} onRetry={() => void branchesQuery.refetch()}>
                <div className="customer-branch-stack">
                  {branchesQuery.data ? (
                    <div className="owner-link-card">
                      <strong>{branchesQuery.data.data.branch.name}</strong>
                      <span>{branchesQuery.data.data.branch.code} · {branchesQuery.data.data.branch.timezone}</span>
                      {branchesQuery.data.data.branch.contactEmail ? <span>{branchesQuery.data.data.branch.contactEmail}</span> : null}
                      {branchesQuery.data.data.branch.contactPhone ? <span>{branchesQuery.data.data.branch.contactPhone}</span> : null}
                    </div>
                  ) : null}

                  {accessToken ? (
                    selectedTenantId ? (
                      nextBranches.length > 0 ? (
                        <div className="customer-branch-picker">
                          <span className="customer-preset-label">Sucursales disponibles para reservar</span>
                          <div className="customer-branch-list">
                            {nextBranches.map((branch) => (
                              <article
                                key={branch.id}
                                className={`customer-branch-card customer-branch-card--article ${selectedBranchId === branch.id ? "customer-branch-card--active" : ""}`}
                              >
                                <div className="customer-branch-card__copy">
                                  <strong>{branch.name}</strong>
                                  <span>{branch.code}</span>
                                </div>
                                <div className="customer-branch-card__actions">
                                  <button
                                    type="button"
                                    className="btn btn--ghost"
                                    onClick={() => selectBranch(branch.id)}
                                  >
                                    {selectedBranchId === branch.id ? "Elegida" : "Elegir"}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn--primary"
                                    onClick={() => handleChooseBranch(branch.id)}
                                  >
                                    Reservar acá
                                  </button>
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="cashier-banner cashier-banner--info">
                          <span>No hay sucursales disponibles para este restaurante.</span>
                        </div>
                      )
                    ) : (
                      <div className="cashier-banner cashier-banner--info">
                        <span>Elegí el restaurante para ver sus sucursales.</span>
                      </div>
                    )
                  ) : (
                    <div className="cashier-banner cashier-banner--info">
                      <span>Podés explorar la sucursal pública sin login; para elegir una sucursal reservable, iniciá sesión.</span>
                    </div>
                  )}
                </div>
              </StateView>
            </article>
            <article className="cashier-card">
              <div className={`cashier-banner ${branchesNextStep.tone === "success" ? "cashier-banner--success" : "cashier-banner--info"}`}>
                <span>{branchesNextStep.title}</span>
              </div>
              <p className="owner-card-copy">{branchesNextStep.detail}</p>
              <div className="cashier-quick-actions">
                <button type="button" className="btn btn--primary" onClick={() => setTab(branchesNextStep.nextTab)}>
                  {branchesNextStep.ctaLabel}
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => setTab("reserve")}>
                  Ir a reservar
                </button>
              </div>
            </article>
          </section>
        ) : null}

        {tab === "reserve" && canUseReservations ? (
          <section className="customer-grid">
            <article className="cashier-card">
              <div className={`cashier-banner ${reservePriority.tone === "success" ? "cashier-banner--success" : reservePriority.tone === "warning" ? "cashier-banner--warning" : "cashier-banner--info"}`}>
                <span>{reservePriority.message}</span>
              </div>
              <h2 className="owner-card-title">Qué falta para reservar</h2>
              <div className="customer-checklist">
                {reservationChecklist.map((step) => (
                  <div key={step.label} className={`customer-check ${step.done ? "customer-check--done" : ""}`}>
                    <strong>{step.done ? "✓" : "•"}</strong>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
              <div className={`cashier-banner ${reservationReady ? "cashier-banner--success" : "cashier-banner--info"}`}>
                <span>
                  {reservationReady
                    ? `Todo listo para reservar en ${selectedBranch?.name ?? "la sucursal elegida"}.`
                    : `Todavía falta: ${reservationPending.join(", ")}.`}
                </span>
              </div>
            </article>

            <article className="cashier-card">
              <h2 className="owner-card-title">Siguiente paso recomendado</h2>
              <p className="owner-card-copy">{reserveActionPlan.message}</p>
              <div className="customer-checklist">
                {reserveActionPlan.steps.map((step) => (
                  <div key={step.label} className={`customer-check ${step.done ? "customer-check--done" : ""}`}>
                    <strong>{step.done ? "✓" : "•"}</strong>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="cashier-card">
              <h2 className="owner-card-title">Nueva reserva</h2>
              {!accessToken ? (
                <>
                  <div className="cashier-banner cashier-banner--info">
                    <span>Para reservar necesitás iniciar sesión.</span>
                  </div>
                  <div className="cashier-quick-actions">
                    <button type="button" className="btn btn--primary" onClick={() => setTab("mine")}>
                      Ir a acceso
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={() => setTab("menu")}>
                      Seguir explorando
                    </button>
                  </div>
                </>
              ) : (
                <form
                  className="cashier-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void createReservationMutation.mutateAsync();
                  }}
                >
                  {!selectedTenantId || !selectedBranchId ? (
                    <div className="cashier-banner cashier-banner--info">
                      <span>Antes de confirmar, elegí el restaurante y la sucursal.</span>
                    </div>
                  ) : null}
                  <label>
                    Comensales
                    <input value={partySize} onChange={(e) => setPartySize(e.target.value)} inputMode="numeric" />
                  </label>
                  <div className="customer-preset-group">
                    <span className="customer-preset-label">Atajos de comensales</span>
                    <div className="customer-preset-row">
                      {PARTY_SIZE_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          className={`customer-preset-chip ${partySize === preset ? "customer-preset-chip--active" : ""}`}
                          onClick={() => setPartySize(preset)}
                        >
                          {preset} pax
                        </button>
                      ))}
                    </div>
                  </div>
                  <label>
                    Fecha y hora
                    <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                  </label>
                  <div className="customer-preset-group">
                    <span className="customer-preset-label">Horarios habituales</span>
                    <div className="customer-preset-row">
                      {timePresets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          className={`customer-preset-chip ${startAt === preset.value ? "customer-preset-chip--active" : ""}`}
                          onClick={() => setStartAt(preset.value)}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label>
                    Duración (min)
                    <input value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} inputMode="numeric" />
                  </label>
                  <div className="customer-preset-group">
                    <span className="customer-preset-label">Duración sugerida</span>
                    <div className="customer-preset-row">
                      {DURATION_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          className={`customer-preset-chip ${durationMinutes === preset ? "customer-preset-chip--active" : ""}`}
                          onClick={() => setDurationMinutes(preset)}
                        >
                          {preset} min
                        </button>
                      ))}
                    </div>
                  </div>
                  <label>
                    Notas
                    <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alergias, silla alta, cumpleaños..." />
                  </label>
                  <button
                    type="submit"
                    className="btn btn--primary btn--xl"
                    disabled={!selectedTenantId || !selectedBranchId || createReservationMutation.isPending}
                  >
                    {createReservationMutation.isPending ? "Creando…" : "Reservar"}
                  </button>
                  {createReservationMutation.error ? (
                    <div className="cashier-banner cashier-banner--warning">
                      <span>{toErrorMessage(createReservationMutation.error)}</span>
                    </div>
                  ) : null}
                </form>
              )}
            </article>

            <article className="cashier-card">
              <h2 className="owner-card-title">Disponibilidad</h2>
              {!accessToken ? (
                <div className="cashier-banner cashier-banner--info">
                  <span>Iniciá sesión y elegí una sucursal para consultar disponibilidad.</span>
                </div>
              ) : (
                <StateView isLoading={availabilityQuery.isLoading} error={(availabilityQuery.error as Error) ?? null} onRetry={() => void availabilityQuery.refetch()}>
                  {availabilityQuery.data ? (
                    <>
                      <div className={`cashier-banner ${availabilityQuery.data.data.available ? "cashier-banner--success" : "cashier-banner--warning"}`}>
                        <span>{availabilityQuery.data.data.available ? "Hay disponibilidad." : "No hay disponibilidad para ese horario."}</span>
                      </div>
                      <div className="owner-links">
                        {availabilityQuery.data.data.freeTableIds.map((tableId) => (
                          <div key={tableId} className="owner-link-card">
                            <strong>Mesa disponible</strong>
                            <span>{tableId.slice(0, 8)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </StateView>
              )}
            </article>
          </section>
        ) : null}

        {tab === "mine" && canUseReservations ? (
          <section className="customer-grid">
            {accessToken ? (
              <article className="cashier-kpi-strip">
                <div className="cashier-kpi-card">
                  <span>Acceso</span>
                  <strong>{email ?? "Sesión activa"}</strong>
                </div>
                <div className="cashier-kpi-card">
                  <span>Sucursal elegida</span>
                  <strong>{selectedBranch?.name ?? "Sin definir"}</strong>
                </div>
                <div className="cashier-kpi-card">
                  <span>Próximas</span>
                  <strong>{upcomingReservations.length}</strong>
                </div>
                <div className="cashier-kpi-card">
                  <span>Historial</span>
                  <strong>{pastReservations.length}</strong>
                </div>
              </article>
            ) : null}
            {accessToken ? (
              <article className="cashier-card">
                <div className={`cashier-banner ${reservationFollowUp.tone === "success" ? "cashier-banner--success" : reservationFollowUp.tone === "warning" ? "cashier-banner--warning" : "cashier-banner--info"}`}>
                  <span>{reservationFollowUp.title}</span>
                </div>
                <p className="owner-card-copy">{reservationFollowUp.message}</p>
                <div className="customer-checklist">
                  {reservationFollowUp.steps.map((step) => (
                    <div key={step.label} className={`customer-check ${step.done ? "customer-check--done" : ""}`}>
                      <strong>{step.done ? "✓" : "•"}</strong>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}
            {accessToken && nextReservation ? (
              <article className="cashier-card cashier-card--hero">
                <h2 className="owner-card-title">Próxima reserva</h2>
                <p className="owner-card-copy">
                  {new Date(nextReservation.startAt).toLocaleString("es-AR")} · {nextReservation.partySize} pax · {nextReservation.durationMinutes} min
                </p>
                <p className="owner-card-copy">
                  Sucursal: {branchNameById.get(nextReservation.branchId) ?? nextReservation.branchId.slice(0, 8)}
                </p>
                <div className="cashier-banner cashier-banner--info">
                  <span>Estado actual: {reservationStatusLabel(nextReservation.status)}</span>
                </div>
                <div className="cashier-quick-actions">
                  <button type="button" className="btn btn--ghost" onClick={() => setTab("branches")}>
                    Ver sucursales
                  </button>
                  <button type="button" className="btn btn--primary" onClick={() => setTab("reserve")}>
                    Crear otra reserva
                  </button>
                </div>
              </article>
            ) : null}
            {accessToken && !nextReservation ? (
              <article className="cashier-card cashier-card--hero">
                <h2 className="owner-card-title">Todavía no tenés una próxima reserva</h2>
                <p className="owner-card-copy">{customerNextAction.detail}</p>
                <div className="cashier-quick-actions">
                  <button type="button" className="btn btn--primary" onClick={() => setTab(customerNextAction.nextTab)}>
                    {customerNextAction.ctaLabel}
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => setTab("menu")}>
                    Seguir explorando
                  </button>
                </div>
              </article>
            ) : null}
            <article className="cashier-card">
              <h2 className="owner-card-title">Mis reservas</h2>
              {!accessToken ? (
                <>
                  <div className="cashier-banner cashier-banner--info">
                    <span>Iniciá sesión para ver tus reservas.</span>
                  </div>
                  <div className="cashier-quick-actions">
                    <button type="button" className="btn btn--primary" onClick={() => setTab("mine")}>
                      Ir a acceso
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={() => setTab("discover")}>
                      Volver al inicio
                    </button>
                  </div>
                </>
              ) : (
                <StateView
                  isLoading={reservationsQuery.isLoading}
                  error={(reservationsQuery.error as Error) ?? null}
                  isEmpty={(reservationsQuery.data?.data.length ?? 0) === 0}
                  emptyIcon="📖"
                  emptyTitle="Sin reservas"
                  emptyMessage="Todavía no tenés reservas cargadas."
                  onRetry={() => void reservationsQuery.refetch()}
                >
                  <div className="customer-reservations-layout">
                    <section className="customer-reservation-section">
                      <div className="customer-reservation-section__head">
                        <h3>Próximas</h3>
                        <span>{upcomingReservations.length}</span>
                      </div>
                      <div className="customer-reservation-list">
                        {upcomingReservations.length === 0 ? (
                          <div className="customer-reservation-empty">
                            <strong>No tenés reservas próximas.</strong>
                            <span>Cuando cargues una reserva futura, va a aparecer destacada acá.</span>
                          </div>
                        ) : (
                          upcomingReservations.map((reservation) => (
                            <article key={reservation.id} className="customer-reservation-card customer-reservation-card--upcoming">
                              <div className="customer-reservation-card__main">
                                <div className="customer-reservation-card__top">
                                  <strong>{new Date(reservation.startAt).toLocaleString("es-AR")}</strong>
                                  <span className={`customer-status-pill customer-status-pill--${reservation.status.toLowerCase()}`}>
                                    {reservationStatusLabel(reservation.status)}
                                  </span>
                                </div>
                                <p>{reservation.partySize} pax · {reservation.durationMinutes} min</p>
                                <p>Sucursal: {branchNameById.get(reservation.branchId) ?? reservation.branchId.slice(0, 8)}</p>
                                {reservation.notes ? <p>Notas: {reservation.notes}</p> : null}
                              </div>
                              {(reservation.status === "PENDING" || reservation.status === "CONFIRMED") ? (
                                <button
                                  type="button"
                                  className="btn btn--ghost"
                                  disabled={cancelReservationMutation.isPending}
                                  onClick={() => void cancelReservationMutation.mutateAsync(reservation.id)}
                                >
                                  {cancelReservationMutation.isPending ? "Cancelando…" : "Cancelar"}
                                </button>
                              ) : null}
                            </article>
                          ))
                        )}
                      </div>
                    </section>

                    <section className="customer-reservation-section">
                      <div className="customer-reservation-section__head">
                        <h3>Historial</h3>
                        <span>{pastReservations.length}</span>
                      </div>
                      <div className="customer-reservation-list">
                        {pastReservations.length === 0 ? (
                          <div className="customer-reservation-empty">
                            <strong>Sin historial todavía.</strong>
                            <span>Tus reservas pasadas o canceladas se van a ver en esta sección.</span>
                          </div>
                        ) : (
                          pastReservations.map((reservation) => (
                            <article key={reservation.id} className="customer-reservation-card customer-reservation-card--history">
                              <div className="customer-reservation-card__main">
                                <div className="customer-reservation-card__top">
                                  <strong>{new Date(reservation.startAt).toLocaleString("es-AR")}</strong>
                                  <span className={`customer-status-pill customer-status-pill--${reservation.status.toLowerCase()}`}>
                                    {reservationStatusLabel(reservation.status)}
                                  </span>
                                </div>
                                <p>{reservation.partySize} pax · {reservation.durationMinutes} min</p>
                                <p>Sucursal: {branchNameById.get(reservation.branchId) ?? reservation.branchId.slice(0, 8)}</p>
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                    </section>
                  </div>
                </StateView>
              )}
            </article>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function defaultDateTimeLocal() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function buildTimePresets(): TimePreset[] {
  const now = new Date();
  const presets: TimePresetConfig[] = [
    { label: "En 1 h", hoursOffset: 1 },
    { label: "Hoy 20:30", fixedHour: 20, fixedMinute: 30 },
    { label: "Hoy 22:00", fixedHour: 22, fixedMinute: 0 },
    { label: "Mañana 13:00", dayOffset: 1, fixedHour: 13, fixedMinute: 0 },
    { label: "Mañana 21:00", dayOffset: 1, fixedHour: 21, fixedMinute: 0 },
  ];

  return presets.map((preset) => {
    const date = new Date(now);
    if ("hoursOffset" in preset) {
      date.setHours(date.getHours() + preset.hoursOffset, 0, 0, 0);
    } else {
      date.setDate(date.getDate() + (preset.dayOffset ?? 0));
      date.setHours(preset.fixedHour, preset.fixedMinute, 0, 0);
    }
    return {
      label: preset.label,
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
    };
  });
}

function reservationStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Pendiente";
    case "CONFIRMED":
      return "Confirmada";
    case "SEATED":
      return "Sentados";
    case "COMPLETED":
      return "Completada";
    case "CANCELLED":
      return "Cancelada";
    case "NO_SHOW":
      return "No show";
    default:
      return status;
  }
}

function getCustomerReservePriority({
  accessToken,
  selectedTenantId,
  selectedBranchId,
  reservationReady,
  availability,
  nextReservation,
}: {
  accessToken: boolean;
  selectedTenantId: string | null | undefined;
  selectedBranchId: string | null | undefined;
  reservationReady: boolean;
  availability: boolean | null;
  nextReservation: ReservationListItem | null;
}) {
  if (!accessToken) {
    return {
      tone: "info" as const,
      message: "Primero iniciá sesión para poder reservar y seguir tus reservas después.",
    };
  }

  if (!selectedTenantId) {
    return {
      tone: "info" as const,
      message: "Elegí el restaurante para continuar con la reserva.",
    };
  }

  if (!selectedBranchId) {
    return {
      tone: "info" as const,
      message: "Elegí una sucursal antes de consultar disponibilidad y confirmar la reserva.",
    };
  }

  if (availability === false) {
    return {
      tone: "warning" as const,
      message: "Para ese horario no hay disponibilidad. Probá con otro horario o una duración distinta.",
    };
  }

  if (reservationReady) {
    return {
      tone: "success" as const,
      message: "Ya tenés todo listo para reservar.",
    };
  }

  if (nextReservation) {
    return {
      tone: "info" as const,
      message: "Ya tenés una próxima reserva; igual podés crear otra si lo necesitás.",
    };
  }

  return {
    tone: "info" as const,
    message: "Completá los datos clave para pasar de discovery a reserva confirmable.",
  };
}

function getCustomerNextAction({
  accessToken,
  selectedTenantId,
  selectedBranch,
  nextReservation,
}: {
  accessToken: boolean;
  selectedTenantId: string | null | undefined;
  selectedBranch: { name: string } | null;
  nextReservation: ReservationListItem | null;
}) {
  if (!accessToken) {
    return {
      tone: "info" as const,
      title: "Explorá sin login y reservá cuando quieras",
      detail: "Podés ver menú y sucursales sin cuenta. Cuando decidas reservar o seguir tu historial, iniciá sesión.",
      ctaLabel: "Ir a acceso",
      nextTab: "mine" as CustomerTab,
    };
  }

  if (nextReservation) {
    return {
      tone: "success" as const,
      title: "Ya tenés una próxima reserva",
      detail: "Tu próxima visita ya está cargada. Desde Mis reservas podés revisar estado, sucursal y, si hace falta, crear otra.",
      ctaLabel: "Ver mis reservas",
      nextTab: "mine" as CustomerTab,
    };
  }

  if (!selectedTenantId) {
    return {
      tone: "info" as const,
      title: "Elegí primero el restaurante",
      detail: "Seleccioná el restaurante para ver sus sucursales disponibles.",
      ctaLabel: "Ver sucursales",
      nextTab: "branches" as CustomerTab,
    };
  }

  if (!selectedBranch) {
    return {
      tone: "info" as const,
      title: "Definí una sucursal",
      detail: "Con una sucursal elegida ya podemos consultar disponibilidad real y encaminar la reserva.",
      ctaLabel: "Elegir sucursal",
      nextTab: "branches" as CustomerTab,
    };
  }

  return {
    tone: "success" as const,
    title: "Ya podés avanzar con la reserva",
    detail: `Tenés ${selectedBranch.name} elegida. El siguiente paso es cargar horario, cantidad de comensales y confirmar.`,
    ctaLabel: "Ir a reservar",
    nextTab: "reserve" as CustomerTab,
  };
}

function getCustomerReserveActionPlan({
  accessToken,
  selectedTenantId,
  selectedBranch,
  startAt,
  availability,
}: {
  accessToken: boolean;
  selectedTenantId: string | null | undefined;
  selectedBranch: { name: string } | null;
  startAt: string;
  availability: boolean | null;
}) {
  return {
    message: !accessToken
      ? "Primero resolvé el acceso y después completá el contexto de la reserva."
      : availability === false
        ? "Recalculá el plan de visita antes de confirmar: el horario actual no tiene lugar."
        : availability === true
          ? `La visita para ${selectedBranch?.name ?? "la sucursal elegida"} ya está lista para confirmarse.`
          : "Completá los datos mínimos y después revisá disponibilidad real antes de reservar.",
    steps: [
      { label: "Sesión activa", done: accessToken },
      { label: "Restaurante definido", done: Boolean(selectedTenantId) },
      { label: "Sucursal definida", done: Boolean(selectedBranch) },
      { label: "Horario cargado", done: Boolean(startAt) },
      { label: "Disponibilidad favorable", done: availability === true },
    ],
  };
}

function getCustomerReservationFollowUp({
  nextReservation,
  upcomingCount,
  historyCount,
}: {
  nextReservation: ReservationListItem | null;
  upcomingCount: number;
  historyCount: number;
}) {
  if (nextReservation) {
    return {
      tone: nextReservation.status === "PENDING" ? ("warning" as const) : ("success" as const),
      title: nextReservation.status === "PENDING" ? "Tu próxima reserva todavía está pendiente" : "Ya tenés una próxima reserva activa",
      message:
        nextReservation.status === "PENDING"
          ? "Conviene revisar el estado antes de la visita y conservar fecha, sucursal y notas."
          : "Podés usar esta vista para seguir la próxima visita y decidir si necesitás crear otra.",
      steps: [
        { label: "Próxima reserva visible", done: upcomingCount > 0 },
        { label: "Historial disponible", done: historyCount > 0 },
        { label: "Estado confirmado", done: nextReservation.status === "CONFIRMED" || nextReservation.status === "SEATED" },
      ],
    };
  }

  return {
    tone: "info" as const,
    title: "No tenés una próxima reserva cargada",
    message: "Podés seguir explorando o volver a Reservar para planificar una nueva visita.",
    steps: [
      { label: "Próxima reserva visible", done: false },
      { label: "Historial disponible", done: historyCount > 0 },
      { label: "Listo para crear otra", done: true },
    ],
  };
}

function getCustomerBrowseNextStep({
  accessToken,
  selectedBranch,
  selectedBranchId,
  source,
}: {
  accessToken: boolean;
  selectedBranch: { name: string } | null;
  selectedBranchId: string | null | undefined;
  source: "menu" | "branches";
}) {
  if (!accessToken) {
    return {
      tone: "info" as const,
      title: source === "menu" ? "Después del menú, resolvé el acceso" : "Para operar sobre una sucursal, iniciá sesión",
      detail:
        source === "menu"
          ? "Ya podés explorar la propuesta. Cuando decidas avanzar con una reserva, necesitás identificarte."
          : "Podés mirar la sede públicamente, pero para elegirla y reservar hace falta una sesión activa.",
      ctaLabel: "Ir a acceso",
      nextTab: "mine" as CustomerTab,
    };
  }

  if (!selectedBranchId || !selectedBranch) {
    return {
      tone: "info" as const,
      title: "Definí la sucursal para continuar",
      detail:
        source === "menu"
          ? "Ya viste la propuesta gastronómica. El siguiente paso es elegir en qué sede querés vivirla."
          : "Cuando elijas una sede, ya podés pasar a disponibilidad y reserva real.",
      ctaLabel: "Elegir sucursal",
      nextTab: "branches" as CustomerTab,
    };
  }

  return {
    tone: "success" as const,
    title: `Ya tenés ${selectedBranch.name} seleccionada`,
    detail:
      source === "menu"
        ? "Con menú visto y sucursal definida, el paso natural es cargar fecha, horario y cantidad."
        : "La sede ya está elegida. Ahora podés pasar directo al flujo de reserva real.",
    ctaLabel: "Continuar reserva",
    nextTab: "reserve" as CustomerTab,
  };
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error.";
}
