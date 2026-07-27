import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StateView } from "../../components/state-view.js";
import { useAuth } from "../../app/auth-context.js";
import { useTenantContext } from "../../app/tenant-context.js";
import { apiRequest, ApiError } from "../../lib/api-client.js";

interface BranchOption {
  id: string;
  code: string;
  name: string;
}

interface SalonSummary {
  id: string;
  branchId: string;
  name: string;
  capacity: number;
  description?: string;
}

interface Table {
  id: string;
  salonId: string;
  branchId: string;
  number: string;
  name?: string;
  capacity: number;
}

interface SalonDetail extends SalonSummary {
  tables: Table[];
}

interface TableStatus {
  tableId: string;
  status: string;
}

interface Visit {
  id: string;
  branchId: string;
  tableIds: string[];
  guestCount: number;
  status: string;
  openedAt?: string;
  createdAt?: string;
}

interface BranchDetail {
  id: string;
  brandId: string;
  name: string;
}

interface Menu {
  id: string;
  name: string;
  isDefault?: boolean;
  status: string;
}

interface Category {
  id: string;
  name: string;
  status: string;
}

interface Product {
  id: string;
  categoryId: string;
  name: string;
  priceMinorUnits: number;
  currency: string;
  status: string;
  allergens?: string[];
}

interface MenuCatalog {
  menus: Menu[];
  categoriesByMenuId: Map<string, Category[]>;
  productsByCategoryId: Map<string, Product[]>;
}

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPriceMinorUnits: number;
  currency: string;
  status: string;
}

interface Order {
  id: string;
  visitId: string;
  status: string;
  items: OrderItem[];
  currency: string;
  grandTotalMinorUnits: number;
  subtotalMinorUnits: number;
  createdAt: string;
  submittedAt?: string | null;
}

interface FloorSnapshot {
  salons: SalonDetail[];
  tableStatusById: Map<string, string>;
  visits: Visit[];
}

interface PaginatedResponse<T> {
  data: T[];
}

interface ResourceResponse<T> {
  data: T;
}

function statusLabel(status: string) {
  switch (status) {
    case "AVAILABLE":
      return "Disponible";
    case "OCCUPIED":
      return "Ocupada";
    case "PAYING":
      return "Pagando";
    case "BLOCKED":
      return "Bloqueada";
    case "CLEANING":
      return "Limpieza";
    case "RESERVED":
      return "Reservada";
    default:
      return status;
  }
}

function canOpenVisit(status: string) {
  return status === "AVAILABLE";
}

function formatMoney(minorUnits: number, currency: string) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(minorUnits / 100);
}

interface FloorPageProps {
  mode?: "floor" | "waiter";
}

export function FloorPage({ mode = "floor" }: FloorPageProps) {
  const { accessToken } = useAuth();
  const { me, selectedTenantId } = useTenantContext();
  const queryClient = useQueryClient();
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [guestCount, setGuestCount] = useState<number>(2);
  const [moveTargetTableId, setMoveTargetTableId] = useState<string>("");
  const [selectedMenuId, setSelectedMenuId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const isWaiterMode = mode === "waiter";

  async function refreshFloor() {
    await queryClient.invalidateQueries({ queryKey: ["floor", selectedTenantId, selectedBranchId] });
  }

  const branches = useMemo<BranchOption[]>(
    () => me?.tenants.find((tenant) => tenant.id === selectedTenantId)?.branches ?? [],
    [me, selectedTenantId],
  );

  useEffect(() => {
    if (!selectedTenantId) return;
    const storageKey = `maitre.selectedBranchId.${selectedTenantId}`;
    const stored = localStorage.getItem(storageKey);
    const initialBranchId =
      (stored && branches.some((branch) => branch.id === stored) ? stored : null) ??
      branches[0]?.id ??
      "";
    setSelectedBranchId(initialBranchId);
  }, [branches, selectedTenantId]);

  useEffect(() => {
    if (selectedTenantId && selectedBranchId) {
      localStorage.setItem(`maitre.selectedBranchId.${selectedTenantId}`, selectedBranchId);
    }
  }, [selectedBranchId, selectedTenantId]);

  const floorQuery = useQuery({
    queryKey: ["floor", selectedTenantId, selectedBranchId],
    enabled: Boolean(accessToken && selectedTenantId && selectedBranchId),
    queryFn: async (): Promise<FloorSnapshot> => {
      const salonsResponse = await apiRequest<PaginatedResponse<SalonSummary>>(
        `/v1/salons?branchId=${selectedBranchId}`,
        { accessToken: accessToken!, tenantId: selectedTenantId! },
      );

      const salons = await Promise.all(
        salonsResponse.data.map(async (salon) => {
          const detail = await apiRequest<ResourceResponse<SalonDetail>>(`/v1/salons/${salon.id}`, {
            accessToken: accessToken!,
            tenantId: selectedTenantId!,
          });
          return detail.data;
        }),
      );

      const [statusesResponse, visitsResponse] = await Promise.all([
        apiRequest<ResourceResponse<TableStatus[]>>(
          `/v1/branches/${selectedBranchId}/table-statuses`,
          { accessToken: accessToken!, tenantId: selectedTenantId! },
        ),
        apiRequest<ResourceResponse<Visit[]>>(`/v1/visits?branchId=${selectedBranchId}`, {
          accessToken: accessToken!,
          tenantId: selectedTenantId!,
        }),
      ]);

      return {
        salons,
        tableStatusById: new Map(statusesResponse.data.map((status) => [status.tableId, status.status])),
        visits: visitsResponse.data,
      };
    },
  });

  const menuCatalogQuery = useQuery({
    queryKey: ["floor-menu-catalog", selectedTenantId, selectedBranchId],
    enabled: Boolean(accessToken && selectedTenantId && selectedBranchId),
    queryFn: async (): Promise<MenuCatalog> => {
      const branch = await apiRequest<ResourceResponse<BranchDetail>>(`/v1/branches/${selectedBranchId}`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      });
      const menusResponse = await apiRequest<PaginatedResponse<Menu>>(
        `/v1/brands/${branch.data.brandId}/menus`,
        { accessToken: accessToken!, tenantId: selectedTenantId! },
      );
      const activeMenus = menusResponse.data.filter((menu) => menu.status !== "ARCHIVED");
      const categoryEntries = await Promise.all(
        activeMenus.map(async (menu) => {
          const categories = await apiRequest<ResourceResponse<Category[]>>(`/v1/menus/${menu.id}/categories`, {
            accessToken: accessToken!,
            tenantId: selectedTenantId!,
          });
          return [menu.id, categories.data.filter((category) => category.status === "ACTIVE")] as const;
        }),
      );
      const categoriesByMenuId = new Map<string, Category[]>(categoryEntries);
      const allCategories = categoryEntries.flatMap((entry) => entry[1]);
      const productEntries = await Promise.all(
        allCategories.map(async (category) => {
          const products = await apiRequest<ResourceResponse<Product[]>>(
            `/v1/categories/${category.id}/products`,
            { accessToken: accessToken!, tenantId: selectedTenantId! },
          );
          return [category.id, products.data.filter((product) => product.status === "AVAILABLE")] as const;
        }),
      );
      return {
        menus: activeMenus,
        categoriesByMenuId,
        productsByCategoryId: new Map<string, Product[]>(productEntries),
      };
    },
  });

  useEffect(() => {
    const menus = menuCatalogQuery.data?.menus ?? [];
    if (!menus.length) {
      setSelectedMenuId("");
      return;
    }
    if (!menus.some((menu) => menu.id === selectedMenuId)) {
      setSelectedMenuId(menus.find((menu) => menu.isDefault)?.id ?? menus[0]!.id);
    }
  }, [menuCatalogQuery.data, selectedMenuId]);

  const openVisitMutation = useMutation({
    mutationFn: async (tableId: string) =>
      apiRequest<ResourceResponse<Visit>>("/v1/visits", {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        method: "POST",
        body: {
          branchId: selectedBranchId,
          tableIds: [tableId],
          guestCount,
        },
      }),
    onSuccess: async () => {
      setSelectedTableId("");
      await refreshFloor();
    },
  });

  const moveVisitMutation = useMutation({
    mutationFn: async ({ visitId, tableId }: { visitId: string; tableId: string }) =>
      apiRequest<ResourceResponse<Visit>>(`/v1/visits/${visitId}/move`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        method: "POST",
        body: { tableIds: [tableId] },
      }),
    onSuccess: async (_result, variables) => {
      setSelectedTableId(variables.tableId);
      setMoveTargetTableId("");
      await refreshFloor();
    },
  });

  const requestCloseVisitMutation = useMutation({
    mutationFn: async (visitId: string) =>
      apiRequest<ResourceResponse<Visit>>(`/v1/visits/${visitId}/request-close`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        method: "POST",
      }),
    onSuccess: refreshFloor,
  });

  const closeVisitMutation = useMutation({
    mutationFn: async (visitId: string) =>
      apiRequest<ResourceResponse<Visit>>(`/v1/visits/${visitId}/close`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        method: "POST",
      }),
    onSuccess: async () => {
      await refreshFloor();
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (visitId: string) =>
      apiRequest<ResourceResponse<Order>>(`/v1/visits/${visitId}/orders`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        method: "POST",
        body: {},
      }),
    onSuccess: async (_result, visitId) => {
      await queryClient.invalidateQueries({ queryKey: ["visit-orders", selectedTenantId, visitId] });
    },
  });

  const selectedVisitId =
    floorQuery.data?.visits.find(
      (visit) =>
        visit.status !== "CLOSED" &&
        visit.status !== "CANCELLED" &&
        visit.tableIds.includes(selectedTableId),
    )?.id ?? null;

  const visitOrdersQuery = useQuery({
    queryKey: ["visit-orders", selectedTenantId, selectedVisitId],
    enabled: Boolean(accessToken && selectedTenantId && selectedVisitId),
    queryFn: () =>
      apiRequest<ResourceResponse<Order[]>>(`/v1/visits/${selectedVisitId!}/orders`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
      }),
  });

  const addOrderItemMutation = useMutation({
    mutationFn: async ({ orderId, productId, quantity }: { orderId: string; productId: string; quantity: number }) =>
      apiRequest<ResourceResponse<Order>>(`/v1/orders/${orderId}/items`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        method: "POST",
        body: { productId, quantity },
      }),
    onSuccess: async (_result, variables) => {
      if (selectedVisit?.id) {
        await queryClient.invalidateQueries({ queryKey: ["visit-orders", selectedTenantId, selectedVisit.id] });
      }
      await queryClient.invalidateQueries({ queryKey: ["order-detail", selectedTenantId, variables.orderId] });
    },
  });

  const submitOrderMutation = useMutation({
    mutationFn: async (orderId: string) =>
      apiRequest<ResourceResponse<{ order: Order }>>(`/v1/orders/${orderId}/submit`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        method: "POST",
        body: {},
      }),
    onSuccess: async (result) => {
      if (selectedVisit?.id) {
        await queryClient.invalidateQueries({ queryKey: ["visit-orders", selectedTenantId, selectedVisit.id] });
      }
      await queryClient.invalidateQueries({ queryKey: ["order-detail", selectedTenantId, result.data.order.id] });
    },
  });

  const deliverOrderItemMutation = useMutation({
    mutationFn: async ({
      orderId,
      itemId,
    }: {
      orderId: string;
      itemId: string;
    }) =>
      apiRequest<ResourceResponse<Order>>(`/v1/orders/${orderId}/items/${itemId}/transition`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        method: "POST",
        body: { to: "DELIVERED" },
      }),
    onSuccess: async () => {
      if (selectedVisit?.id) {
        await queryClient.invalidateQueries({ queryKey: ["visit-orders", selectedTenantId, selectedVisit.id] });
      }
    },
  });

  const changeOrderItemQuantityMutation = useMutation({
    mutationFn: async ({
      orderId,
      itemId,
      newQuantity,
    }: {
      orderId: string;
      itemId: string;
      newQuantity: number;
    }) =>
      apiRequest<ResourceResponse<Order>>(`/v1/orders/${orderId}/items/${itemId}/change-quantity`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        method: "POST",
        body: { newQuantity, reasonCode: "WAITER_ADJUSTMENT" },
      }),
    onSuccess: async () => {
      if (selectedVisit?.id) {
        await queryClient.invalidateQueries({ queryKey: ["visit-orders", selectedTenantId, selectedVisit.id] });
      }
    },
  });

  const cancelOrderItemMutation = useMutation({
    mutationFn: async ({
      orderId,
      itemId,
    }: {
      orderId: string;
      itemId: string;
    }) =>
      apiRequest<ResourceResponse<Order>>(`/v1/orders/${orderId}/items/${itemId}/cancel`, {
        accessToken: accessToken!,
        tenantId: selectedTenantId!,
        method: "POST",
        body: { reasonCode: "GUEST_REQUEST" },
      }),
    onSuccess: async () => {
      if (selectedVisit?.id) {
        await queryClient.invalidateQueries({ queryKey: ["visit-orders", selectedTenantId, selectedVisit.id] });
      }
    },
  });

  const tables = useMemo(() => {
    const snapshot = floorQuery.data;
    if (!snapshot) return [];
    return snapshot.salons.flatMap((salon) =>
      salon.tables.map((table) => {
        const status = snapshot.tableStatusById.get(table.id) ?? "AVAILABLE";
        const visit = snapshot.visits.find(
          (candidate) =>
            candidate.status !== "CLOSED" &&
            candidate.status !== "CANCELLED" &&
            candidate.tableIds.includes(table.id),
        );
        return {
          ...table,
          salonName: salon.name,
          status,
          visit,
        };
      }),
    );
  }, [floorQuery.data]);

  const selectedTable = tables.find((table) => table.id === selectedTableId) ?? null;
  const activeVisits = floorQuery.data?.visits.filter(
    (visit) => visit.status !== "CLOSED" && visit.status !== "CANCELLED",
  ) ?? [];
  const selectedVisit = selectedTable?.visit ?? null;
  const moveCandidates = tables.filter(
    (table) =>
      table.id !== selectedTableId &&
      table.status === "AVAILABLE" &&
      (!selectedVisit || !selectedVisit.tableIds.includes(table.id)),
  );
  const mutationError =
    openVisitMutation.error ??
    moveVisitMutation.error ??
    requestCloseVisitMutation.error ??
    closeVisitMutation.error ??
    createOrderMutation.error ??
    addOrderItemMutation.error ??
    submitOrderMutation.error ??
    changeOrderItemQuantityMutation.error ??
    cancelOrderItemMutation.error ??
    deliverOrderItemMutation.error;
  const visitOrders = visitOrdersQuery.data?.data ?? [];
  const draftOrder =
    [...visitOrders]
      .reverse()
      .find((order) => order.status === "DRAFT") ?? null;
  const selectedMenuCategories: Category[] = selectedMenuId
    ? (menuCatalogQuery.data?.categoriesByMenuId.get(selectedMenuId) ?? [])
    : [];
  const catalogProducts: Product[] = selectedMenuCategories.flatMap(
    (category: Category) => menuCatalogQuery.data?.productsByCategoryId.get(category.id) ?? [],
  );
  const selectedProduct =
    catalogProducts.find((product: Product) => product.id === selectedProductId) ?? null;

  useEffect(() => {
    if (!catalogProducts.length) {
      setSelectedProductId("");
      return;
    }
    if (!catalogProducts.some((product: Product) => product.id === selectedProductId)) {
      setSelectedProductId(catalogProducts[0]!.id);
    }
  }, [catalogProducts, selectedProductId]);

  return (
    <section className="floor-page" aria-labelledby="floor-heading">
      <div className="floor-header">
        <div>
          <h1 id="floor-heading">{mode === "waiter" ? "Waiter" : "Floor"}</h1>
          <p>
            {mode === "waiter"
              ? "Surface táctil de mozo: seleccionar mesa, operar visita y tomar/entregar pedidos."
              : "Vista táctil mínima para operación de salón: mesas, estado actual y apertura de visita."}
          </p>
        </div>

        <label className="floor-branch-field">
          <span>Sucursal</span>
          <select
            value={selectedBranchId}
            onChange={(event) => {
              setSelectedBranchId(event.target.value);
              setSelectedTableId("");
            }}
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <StateView
        isLoading={floorQuery.isLoading}
        error={floorQuery.error as Error | null}
        isEmpty={Boolean(selectedBranchId) && tables.length === 0}
        emptyMessage="Esta sucursal todavía no tiene mesas cargadas."
        onRetry={() => void floorQuery.refetch()}
      >
        <div className="kpi-grid">
          {!isWaiterMode ? (
            <div>
              <dt>Salones</dt>
              <dd>{floorQuery.data?.salons.length ?? 0}</dd>
            </div>
          ) : null}
          <div>
            <dt>Mesas</dt>
            <dd>{tables.length}</dd>
          </div>
          <div>
            <dt>Visitas abiertas</dt>
            <dd>{activeVisits.length}</dd>
          </div>
        </div>

        <div className="floor-layout">
          <div className="floor-grid" role="list" aria-label="Mesas de la sucursal">
            {tables.map((table) => {
              const isSelected = table.id === selectedTableId;
              const isActionable = canOpenVisit(table.status);

              return (
                <button
                  key={table.id}
                  type="button"
                  role="listitem"
                  className={`floor-table-card floor-table-card--${table.status.toLowerCase()}${isSelected ? " floor-table-card--selected" : ""}`}
                  onClick={() => setSelectedTableId(table.id)}
                >
                  <strong>{table.name || `Mesa ${table.number}`}</strong>
                  <span>{table.salonName}</span>
                  <span>{table.capacity} cubiertos</span>
                  <span className="floor-status-pill">{statusLabel(table.status)}</span>
                  {table.visit ? (
                    <span className="floor-table-note">
                      Visita {table.visit.id.slice(0, 8)} · {table.visit.guestCount} pax
                    </span>
                  ) : (
                    <span className="floor-table-note">
                      {isActionable ? "Lista para abrir visita" : "Sin acción rápida"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <aside className="floor-side-panel" aria-label="Acciones de mesa">
            <div className="profile-card">
              <h2>{mode === "waiter" ? "Mesa y visita" : "Mesa seleccionada"}</h2>
              {selectedTable ? (
                <div className="floor-panel-content">
                  <p>
                    <strong>{selectedTable.name || `Mesa ${selectedTable.number}`}</strong>
                    <br />
                    {selectedTable.salonName} · {selectedTable.capacity} cubiertos
                  </p>
                  <p>
                    Estado actual: <strong>{statusLabel(selectedTable.status)}</strong>
                  </p>

                  {selectedTable.visit ? (
                    <div className="floor-visit-summary">
                      <p>Ya tiene una visita abierta asociada.</p>
                      <p>
                        ID: {selectedTable.visit.id}
                        <br />
                        Comensales: {selectedTable.visit.guestCount}
                        <br />
                        Estado: {selectedTable.visit.status}
                      </p>

                      {!isWaiterMode ? (
                        <div className="floor-action-group">
                          <label>
                            <span>Mover a mesa</span>
                            <select
                              value={moveTargetTableId}
                              onChange={(event) => setMoveTargetTableId(event.target.value)}
                            >
                              <option value="">Elegir mesa disponible</option>
                              {moveCandidates.map((table) => (
                                <option key={table.id} value={table.id}>
                                  {table.name || `Mesa ${table.number}`} · {table.salonName}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            type="button"
                            className="public-secondary-cta"
                            disabled={!moveTargetTableId || moveVisitMutation.isPending}
                            onClick={() => {
                              if (!moveTargetTableId) return;
                              void moveVisitMutation.mutateAsync({
                                visitId: selectedTable.visit!.id,
                                tableId: moveTargetTableId,
                              });
                            }}
                          >
                            {moveVisitMutation.isPending ? "Moviendo…" : "Mover visita"}
                          </button>
                        </div>
                      ) : null}

                      <div className="floor-action-group">
                        {!isWaiterMode && selectedTable.visit.status === "OPEN" ? (
                          <button
                            type="button"
                            className="public-secondary-cta"
                            disabled={requestCloseVisitMutation.isPending}
                            onClick={() =>
                              void requestCloseVisitMutation.mutateAsync(selectedTable.visit!.id)
                            }
                          >
                            {requestCloseVisitMutation.isPending ? "Procesando…" : "Pedir cierre"}
                          </button>
                        ) : null}

                        {!isWaiterMode && selectedTable.visit.status === "CLOSING" ? (
                          <button
                            type="button"
                            className="public-button-primary"
                            disabled={closeVisitMutation.isPending}
                            onClick={() => void closeVisitMutation.mutateAsync(selectedTable.visit!.id)}
                          >
                            {closeVisitMutation.isPending ? "Cerrando…" : "Cerrar visita"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : canOpenVisit(selectedTable.status) ? (
                    <form
                      className="floor-open-visit-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void openVisitMutation.mutateAsync(selectedTable.id);
                      }}
                    >
                      <label>
                        <span>Comensales</span>
                        <input
                          type="number"
                          min={1}
                          max={selectedTable.capacity}
                          value={guestCount}
                          onChange={(event) =>
                            setGuestCount(
                              Math.max(1, Math.min(selectedTable.capacity, Number(event.target.value) || 1)),
                            )
                          }
                        />
                      </label>
                      <button type="submit" className="public-button-primary" disabled={openVisitMutation.isPending}>
                        {openVisitMutation.isPending ? "Abriendo…" : "Abrir visita"}
                      </button>
                    </form>
                  ) : (
                    <p>Esta mesa no está disponible para abrir una visita nueva desde esta pantalla.</p>
                  )}

                  {mutationError ? (
                    <p role="alert" className="login-error">
                      {mutationError instanceof ApiError
                        ? mutationError.problem.title
                        : (mutationError as Error).message}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p>Elegí una mesa para ver su detalle o abrir una visita.</p>
              )}
            </div>

            {!isWaiterMode ? (
              <div className="profile-card">
                <h2>Visitas activas</h2>
                {activeVisits.length > 0 ? (
                  <ul className="floor-visit-list">
                    {activeVisits.map((visit) => (
                      <li key={visit.id}>
                        <strong>{visit.id.slice(0, 8)}</strong>
                        <span>{visit.guestCount} pax</span>
                        <span>{visit.status}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay visitas abiertas en esta sucursal.</p>
                )}
              </div>
            ) : null}

            {selectedVisit ? (
              <div className="profile-card">
                <h2>Pedido del mozo</h2>
                <div className="floor-panel-content">
                  <p>
                    Visita activa: <strong>{selectedVisit.id.slice(0, 8)}</strong>
                  </p>

                  {visitOrdersQuery.isLoading ? (
                    <p role="status">Cargando órdenes…</p>
                  ) : visitOrders.length === 0 ? (
                    <button
                      type="button"
                      className="public-button-primary"
                      disabled={createOrderMutation.isPending}
                      onClick={() => void createOrderMutation.mutateAsync(selectedVisit.id)}
                    >
                      {createOrderMutation.isPending ? "Creando…" : "Crear pedido"}
                    </button>
                  ) : (
                    <>
                      <div className="floor-order-list">
                        {visitOrders.map((order) => (
                          <article key={order.id} className="floor-order-card">
                            <strong>Pedido {order.id.slice(0, 8)}</strong>
                            <span>Estado: {order.status}</span>
                            <span>
                              Total: {formatMoney(order.grandTotalMinorUnits, order.currency)}
                            </span>
                            <span>Ítems: {order.items.length}</span>
                            {order.items.length > 0 ? (
                              <ul className="floor-order-card-items">
                                {order.items.map((item) => (
                                  <li key={item.id}>
                                    <div className="floor-order-card-item-head">
                                      <strong>{item.name}</strong>
                                      <span>{item.status}</span>
                                    </div>
                                    <span>
                                      {item.quantity} × {formatMoney(item.unitPriceMinorUnits, item.currency)}
                                    </span>
                                    {item.status === "READY" ? (
                                      <button
                                        type="button"
                                        className="public-button-primary"
                                        disabled={deliverOrderItemMutation.isPending}
                                        onClick={() =>
                                          void deliverOrderItemMutation.mutateAsync({
                                            orderId: order.id,
                                            itemId: item.id,
                                          })
                                        }
                                      >
                                        {deliverOrderItemMutation.isPending ? "Entregando…" : "Marcar entregado"}
                                      </button>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </article>
                        ))}
                      </div>

                      {draftOrder ? (
                        <div className="floor-order-compose">
                          <p>
                            Borrador activo: <strong>{draftOrder.id.slice(0, 8)}</strong>
                          </p>

                          <label>
                            <span>Menú</span>
                            <select
                              value={selectedMenuId}
                              onChange={(event) => setSelectedMenuId(event.target.value)}
                            >
                              {(menuCatalogQuery.data?.menus ?? []).map((menu) => (
                                <option key={menu.id} value={menu.id}>
                                  {menu.name}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label>
                            <span>Producto</span>
                            <select
                              value={selectedProductId}
                              onChange={(event) => setSelectedProductId(event.target.value)}
                            >
                              {selectedMenuCategories.map((category) => (
                                <optgroup key={category.id} label={category.name}>
                                  {(menuCatalogQuery.data?.productsByCategoryId.get(category.id) ?? []).map(
                                    (product) => (
                                      <option key={product.id} value={product.id}>
                                        {product.name} · {formatMoney(product.priceMinorUnits, product.currency)}
                                      </option>
                                    ),
                                  )}
                                </optgroup>
                              ))}
                            </select>
                          </label>

                          <label>
                            <span>Cantidad</span>
                            <input
                              type="number"
                              min={1}
                              value={orderQuantity}
                              onChange={(event) => setOrderQuantity(Math.max(1, Number(event.target.value) || 1))}
                            />
                          </label>

                          {selectedProduct ? (
                            <p className="floor-table-note">
                              Seleccionado: {selectedProduct.name} ·{" "}
                              {formatMoney(selectedProduct.priceMinorUnits, selectedProduct.currency)}
                            </p>
                          ) : null}

                          <div className="floor-action-group">
                            <button
                              type="button"
                              className="public-secondary-cta"
                              disabled={!selectedProductId || addOrderItemMutation.isPending}
                              onClick={() => {
                                if (!selectedProductId) return;
                                void addOrderItemMutation.mutateAsync({
                                  orderId: draftOrder.id,
                                  productId: selectedProductId,
                                  quantity: orderQuantity,
                                });
                              }}
                            >
                              {addOrderItemMutation.isPending ? "Agregando…" : "Agregar ítem"}
                            </button>

                            <button
                              type="button"
                              className="public-button-primary"
                              disabled={draftOrder.items.length === 0 || submitOrderMutation.isPending}
                              onClick={() => void submitOrderMutation.mutateAsync(draftOrder.id)}
                            >
                              {submitOrderMutation.isPending ? "Enviando…" : "Enviar a cocina"}
                            </button>
                          </div>

                          <div className="floor-order-items">
                            {draftOrder.items.length > 0 ? (
                              <ul className="floor-visit-list">
                                {draftOrder.items.map((item) => (
                                  <li key={item.id}>
                                    <strong>{item.name}</strong>
                                    <span>
                                      {item.quantity} × {formatMoney(item.unitPriceMinorUnits, item.currency)}
                                    </span>
                                    <span>{item.status}</span>
                                    {item.status !== "CANCELLED" && item.status !== "DELIVERED" ? (
                                      <div className="floor-order-item-actions">
                                        <button
                                          type="button"
                                          className="public-secondary-cta"
                                          disabled={
                                            item.quantity <= 1 || changeOrderItemQuantityMutation.isPending
                                          }
                                          onClick={() =>
                                            void changeOrderItemQuantityMutation.mutateAsync({
                                              orderId: draftOrder.id,
                                              itemId: item.id,
                                              newQuantity: item.quantity - 1,
                                            })
                                          }
                                        >
                                          −
                                        </button>
                                        <span className="floor-order-qty">{item.quantity}</span>
                                        <button
                                          type="button"
                                          className="public-secondary-cta"
                                          disabled={changeOrderItemQuantityMutation.isPending}
                                          onClick={() =>
                                            void changeOrderItemQuantityMutation.mutateAsync({
                                              orderId: draftOrder.id,
                                              itemId: item.id,
                                              newQuantity: item.quantity + 1,
                                            })
                                          }
                                        >
                                          +
                                        </button>
                                        <button
                                          type="button"
                                          className="public-button-danger"
                                          disabled={cancelOrderItemMutation.isPending}
                                          onClick={() =>
                                            void cancelOrderItemMutation.mutateAsync({
                                              orderId: draftOrder.id,
                                              itemId: item.id,
                                            })
                                          }
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>El borrador todavía no tiene ítems.</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p>No hay borrador editable. Si todos los pedidos ya fueron enviados, creá uno nuevo.</p>
                      )}

                      {!draftOrder ? (
                        <button
                          type="button"
                          className="public-secondary-cta"
                          disabled={createOrderMutation.isPending}
                          onClick={() => void createOrderMutation.mutateAsync(selectedVisit.id)}
                        >
                          {createOrderMutation.isPending ? "Creando…" : "Nuevo pedido"}
                        </button>
                      ) : null}
                    </>
                  )}

                  {menuCatalogQuery.isLoading ? <p role="status">Cargando catálogo…</p> : null}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </StateView>
    </section>
  );
}
