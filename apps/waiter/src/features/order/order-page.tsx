import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../app/use-api.js";
import { useSession } from "../../app/session-context.js";
import { useNav } from "../../app/nav-context.js";
import { AppHeader } from "../../components/app-header.js";
import { StateView } from "../../components/state-view.js";
import { ApiError } from "../../lib/api-client.js";
import { formatMoney } from "../../lib/format.js";
import type {
  ApiData,
  Branch,
  Category,
  Menu,
  Order,
  Product,
} from "../../lib/waiter-types.js";
import { ProductAddSheet } from "./product-add-sheet.js";
import { CartSheet } from "./cart-sheet.js";

interface MenuData {
  menuId: string;
  categories: Category[];
}

type OrderFocusSection = "menu" | "cart";

export function OrderPage({ visitId, orderId }: { visitId: string; orderId: string }) {
  const api = useApi();
  const qc = useQueryClient();
  const { selectedBranchId } = useSession();
  const { back } = useNav();

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [addProduct, setAddProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusSection, setFocusSection] = useState<OrderFocusSection | null>(null);

  // Resolve brand → default menu → categories. Needs branch/menu read; a plain
  // waiter token may lack branch:read, which surfaces as a clear error state.
  const menuQ = useQuery({
    queryKey: ["menu", selectedBranchId],
    enabled: Boolean(selectedBranchId),
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<MenuData> => {
      const branch = await api<ApiData<Branch>>(`/v1/branches/${selectedBranchId}`);
      const menus = await api<{ data: Menu[] }>(`/v1/brands/${branch.data.brandId}/menus`);
      const active = menus.data.filter((m) => m.status === "ACTIVE");
      const chosen = active.find((m) => m.isDefault) ?? active[0] ?? menus.data[0];
      if (!chosen) return { menuId: "", categories: [] };
      const detail = await api<ApiData<Menu & { categories: Category[] }>>(`/v1/menus/${chosen.id}`);
      const categories = (detail.data.categories ?? [])
        .filter((c) => c.status === "ACTIVE")
        .sort((a, b) => a.displayOrder - b.displayOrder);
      return { menuId: chosen.id, categories };
    },
  });

  const categories = menuQ.data?.categories ?? [];
  const currentCategoryId = activeCategoryId ?? categories[0]?.id ?? null;

  const productsQ = useQuery({
    queryKey: ["products", currentCategoryId],
    enabled: Boolean(currentCategoryId),
    queryFn: async () =>
      (await api<ApiData<Product[]>>(`/v1/categories/${currentCategoryId}/products`)).data,
  });

  const orderQ = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => (await api<ApiData<Order>>(`/v1/orders/${orderId}`)).data,
  });

  const order = orderQ.data;
  const cartItems = useMemo(
    () => (order?.items ?? []).filter((i) => i.status !== "CANCELLED"),
    [order],
  );
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const searchActive = searchTerm.trim().length > 0;

  function invalidateOrder() {
    void qc.invalidateQueries({ queryKey: ["order", orderId] });
  }

  const submit = useMutation({
    mutationFn: async () => {
      await api(`/v1/orders/${orderId}/submit`, { method: "POST", body: {} });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["orders", visitId] });
      void qc.invalidateQueries({ queryKey: ["check", visitId] });
      void qc.invalidateQueries({ queryKey: ["floor", selectedBranchId] });
      back();
    },
  });

  const products = (productsQ.data ?? [])
    .filter((p) => p.status !== "ARCHIVED")
    .filter((p) => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        (p.description?.toLowerCase().includes(term) ?? false)
      );
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const submitError =
    submit.error instanceof ApiError
      ? submit.error.problem.title
      : submit.error instanceof Error
        ? submit.error.message
        : null;
  const orderPriority = getOrderPriority({
    cartCount,
    searchActive,
    resultCount: products.length,
  });

  return (
    <div className="screen">
      <AppHeader title="Nuevo pedido" subtitle="Tocá un plato para agregarlo" />

      {/* Category chip strip */}
      {categories.length > 0 && (
        <>
          <nav className="cat-strip" aria-label="Categorías">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`cat-chip ${c.id === currentCategoryId ? "cat-chip--on" : ""}`}
                onClick={() => setActiveCategoryId(c.id)}
              >
                {c.name}
              </button>
            ))}
          </nav>
          <div className="waiter-search-wrap">
            <input
              type="search"
              className="waiter-search"
              placeholder="Buscar plato…"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </>
      )}

      <main className="screen-body screen-body--with-dock">
        <div className={`waiter-banner waiter-banner--${orderPriority.tone}`}>
          <div className="waiter-banner-copy">
            <strong>{orderPriority.title}</strong>
            <span>{orderPriority.message}</span>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setFocusSection(orderPriority.section)}
          >
            {orderPriority.cta}
          </button>
        </div>

        <StateView
          isLoading={menuQ.isLoading}
          error={(menuQ.error as Error) ?? null}
          isEmpty={!menuQ.isLoading && categories.length === 0}
          onRetry={() => menuQ.refetch()}
          loadingLabel="Cargando menú…"
          emptyIcon="📖"
          emptyTitle="Menú vacío"
          emptyMessage="No hay categorías activas en el menú de esta marca."
        >
          <StateView
            isLoading={productsQ.isLoading}
            error={(productsQ.error as Error) ?? null}
            isEmpty={!productsQ.isLoading && products.length === 0}
            loadingLabel="Cargando platos…"
            emptyIcon="🍽️"
            emptyTitle={searchActive ? "Sin resultados" : "Sin platos"}
            emptyMessage={
              searchActive
                ? "No encontramos platos con esa búsqueda dentro de esta categoría."
                : "Esta categoría no tiene platos disponibles."
            }
          >
            <div className="waiter-list-hint">
              {searchActive
                ? `${products.length} resultado${products.length === 1 ? "" : "s"} para “${searchTerm.trim()}”.`
                : "Elegí platos del menú y revisá el pedido antes de enviarlo a cocina."}
            </div>
            <ul className={`product-list${focusSection === "menu" ? " product-list--focus" : ""}`}>
              {products.map((p) => {
                const available = p.status === "AVAILABLE";
                return (
                  <li key={p.id} className={`product-row ${available ? "" : "product-row--off"}`}>
                    <button
                      type="button"
                      className="product-main"
                      disabled={!available}
                      onClick={() => setAddProduct(p)}
                    >
                      <span className="product-name">{p.name}</span>
                      {p.description && <span className="product-desc">{p.description}</span>}
                      <span className="product-price">
                        {formatMoney(p.priceMinorUnits, p.currency)}
                        {!available && <span className="product-off"> · no disponible</span>}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="product-add"
                      aria-label={`Agregar ${p.name}`}
                      disabled={!available}
                      onClick={() => setAddProduct(p)}
                    >
                      ＋
                    </button>
                  </li>
                );
              })}
            </ul>
          </StateView>
        </StateView>
      </main>

      {/* Cart dock */}
      <div className={`dock dock--cart${focusSection === "cart" || cartCount > 0 ? " dock--focus" : ""}`}>
        {submitError && (
          <p role="alert" className="dock-error">
            {submitError}
          </p>
        )}
        <p className="dock-hint">
          {cartCount === 0
            ? "Armá el pedido tocando platos del menú."
            : "Revisá cantidades y subtotal antes de enviar a cocina."}
        </p>
        <div className="cart-dock-row">
          <button
            type="button"
            className="cart-summary"
            onClick={() => {
              if (cartCount > 0) {
                setFocusSection("cart");
                setCartOpen(true);
              }
            }}
            disabled={cartCount === 0}
          >
            <span className="cart-count">{cartCount}</span>
            <span className="cart-summary-label">
              {cartCount === 0 ? "Pedido vacío" : "Ver pedido"}
            </span>
            {order && cartCount > 0 && (
              <span className="cart-subtotal">
                {formatMoney(order.subtotalMinorUnits, order.currency)}
              </span>
            )}
          </button>
          <button
            type="button"
            className="btn btn--success btn--lg cart-submit"
            onClick={() => submit.mutate()}
            disabled={cartCount === 0 || submit.isPending}
          >
            {submit.isPending ? "Enviando…" : "Enviar a cocina"}
          </button>
        </div>
      </div>

      {addProduct && (
        <ProductAddSheet
          product={addProduct}
          orderId={orderId}
          onClose={() => setAddProduct(null)}
          onAdded={() => {
            setAddProduct(null);
            invalidateOrder();
            setFocusSection("cart");
          }}
        />
      )}

      {cartOpen && order && (
        <CartSheet
          order={order}
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onChanged={invalidateOrder}
        />
      )}
    </div>
  );
}

function getOrderPriority({
  cartCount,
  searchActive,
  resultCount,
}: {
  cartCount: number;
  searchActive: boolean;
  resultCount: number;
}) {
  if (cartCount > 0) {
    return {
      tone: "success" as const,
      title: "Pedido en armado",
      message: `Ya hay ${cartCount} ítem${cartCount === 1 ? "" : "s"} cargado${cartCount === 1 ? "" : "s"}. Revisalo antes de enviar.`,
      cta: "Ver pedido",
      section: "cart" as const,
    };
  }

  if (searchActive && resultCount === 0) {
    return {
      tone: "warning" as const,
      title: "Sin coincidencias",
      message: "Probá cambiar la búsqueda o navegar otra categoría para seguir armando el pedido.",
      cta: "Ver menú",
      section: "menu" as const,
    };
  }

  return {
    tone: "info" as const,
    title: "Listo para tomar pedido",
    message: "Buscá platos por categoría o por texto y cargalos al carrito para enviarlos a cocina.",
    cta: "Ver menú",
    section: "menu" as const,
  };
}
