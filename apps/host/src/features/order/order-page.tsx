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

export function OrderPage({ visitId, orderId }: { visitId: string; orderId: string }) {
  const api = useApi();
  const qc = useQueryClient();
  const { selectedBranchId } = useSession();
  const { back } = useNav();

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [addProduct, setAddProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

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
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const submitError =
    submit.error instanceof ApiError
      ? submit.error.problem.title
      : submit.error instanceof Error
        ? submit.error.message
        : null;

  return (
    <div className="screen">
      <AppHeader title="Nuevo pedido" subtitle="Tocá un plato para agregarlo" />

      {/* Category chip strip */}
      {categories.length > 0 && (
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
      )}

      <main className="screen-body screen-body--with-dock">
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
            emptyTitle="Sin platos"
            emptyMessage="Esta categoría no tiene platos disponibles."
          >
            <ul className="product-list">
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
      <div className="dock dock--cart">
        {submitError && (
          <p role="alert" className="dock-error">
            {submitError}
          </p>
        )}
        <div className="cart-dock-row">
          <button
            type="button"
            className="cart-summary"
            onClick={() => cartCount > 0 && setCartOpen(true)}
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
