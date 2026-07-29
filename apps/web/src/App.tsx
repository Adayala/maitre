import { Suspense, lazy, type ComponentType, type ReactNode } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./app/auth-context.js";
import { TenantProvider, useTenantContext } from "./app/tenant-context.js";
import { DashboardLayout } from "./app/dashboard-layout.js";
import { PublicLayout } from "./app/public-layout.js";
import { CustomerAuthRequired } from "./app/customer-auth-required.js";
import { BrandPresentationProvider } from "../../../packages/brand-presentation/src/index.js";

const queryClient = new QueryClient();
const LoginPage = lazyNamed(() => import("./features/login/login-page.js"), "LoginPage");
const OverviewPage = lazyNamed(() => import("./features/overview/overview-page.js"), "OverviewPage");
const SetupPage = lazyNamed(() => import("./features/setup/setup-page.js"), "SetupPage");
const BrandsPage = lazyNamed(() => import("./features/brands/brands-page.js"), "BrandsPage");
const BranchesPage = lazyNamed(() => import("./features/branches/branches-page.js"), "BranchesPage");
const UsersPage = lazyNamed(() => import("./features/users/users-page.js"), "UsersPage");
const SubscriptionPage = lazyNamed(() => import("./features/subscription/subscription-page.js"), "SubscriptionPage");
const FiscalSettingsPage = lazyNamed(() => import("./features/fiscal/fiscal-settings-page.js"), "FiscalSettingsPage");
const AuditLogsPage = lazyNamed(() => import("./features/audit/audit-logs-page.js"), "AuditLogsPage");
const SettingsPage = lazyNamed(() => import("./features/settings/settings-page.js"), "SettingsPage");
const PublicHomePage = lazyNamed(() => import("./features/public/public-home-page.js"), "PublicHomePage");
const PublicMenuPage = lazyNamed(() => import("./features/public/public-menu-page.js"), "PublicMenuPage");
const PublicBranchesPage = lazyNamed(
  () => import("./features/public/public-branches-page.js"),
  "PublicBranchesPage",
);
const PublicPromotionsPage = lazyNamed(
  () => import("./features/public/public-promotions-page.js"),
  "PublicPromotionsPage",
);
const PublicAvailabilityPage = lazyNamed(
  () => import("./features/public/public-availability-page.js"),
  "PublicAvailabilityPage",
);
const CustomerReservationPage = lazyNamed(
  () => import("./features/public/customer-reservation-page.js"),
  "CustomerReservationPage",
);
const CustomerReservationConfirmationPage = lazyNamed(
  () => import("./features/public/customer-reservation-confirmation-page.js"),
  "CustomerReservationConfirmationPage",
);
const CustomerReservationsPage = lazyNamed(
  () => import("./features/public/customer-reservations-page.js"),
  "CustomerReservationsPage",
);
const CustomerReservationDetailPage = lazyNamed(
  () => import("./features/public/customer-reservation-detail-page.js"),
  "CustomerReservationDetailPage",
);

function BrandTheme({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const { selectedTenantId } = useTenantContext();
  return <BrandPresentationProvider apiUrl={import.meta.env["VITE_API_URL"] ?? "http://localhost:3001"} accessToken={accessToken} tenantId={selectedTenantId} surface="DASH">{children}</BrandPresentationProvider>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TenantProvider>
            <BrandTheme>
            <a href="#main-content" className="skip-link">
              Saltar al contenido principal
            </a>
            <Routes>
              <Route path="/login" element={withSuspense(<LoginPage />)} />
              <Route path="/public" element={<PublicLayout />}>
                <Route index element={withSuspense(<PublicHomePage />)} />
                <Route path="menu" element={withSuspense(<PublicMenuPage />)} />
                <Route path="branches" element={withSuspense(<PublicBranchesPage />)} />
                <Route path="promotions" element={withSuspense(<PublicPromotionsPage />)} />
                <Route path="availability" element={withSuspense(<PublicAvailabilityPage />)} />
                <Route
                  path="reservations"
                  element={withSuspense(
                    <CustomerAuthRequired>
                      <CustomerReservationsPage />
                    </CustomerAuthRequired>
                  )}
                />
                <Route
                  path="reservations/new"
                  element={withSuspense(
                    <CustomerAuthRequired>
                      <CustomerReservationPage />
                    </CustomerAuthRequired>
                  )}
                />
                <Route
                  path="reservations/confirmation"
                  element={withSuspense(
                    <CustomerAuthRequired>
                      <CustomerReservationConfirmationPage />
                    </CustomerAuthRequired>
                  )}
                />
                <Route
                  path="reservations/:id"
                  element={withSuspense(
                    <CustomerAuthRequired>
                      <CustomerReservationDetailPage />
                    </CustomerAuthRequired>
                  )}
                />
              </Route>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={withSuspense(<OverviewPage />)} />
                <Route path="setup" element={withSuspense(<SetupPage />)} />
                <Route path="brands" element={withSuspense(<BrandsPage />)} />
                <Route path="branches" element={withSuspense(<BranchesPage />)} />
                <Route path="users" element={withSuspense(<UsersPage />)} />
                <Route path="subscription" element={withSuspense(<SubscriptionPage />)} />
                <Route path="fiscal" element={withSuspense(<FiscalSettingsPage />)} />
                <Route path="audit" element={withSuspense(<AuditLogsPage />)} />
                <Route path="settings" element={withSuspense(<SettingsPage />)} />
                <Route path="profiles" element={<Navigate to="/users" replace />} />
              </Route>
            </Routes>
            </BrandTheme>
          </TenantProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function RouteLoadingFallback() {
  return (
    <div role="status" aria-live="polite" className="state-view state-view--loading">
      Cargando pantalla…
    </div>
  );
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<RouteLoadingFallback />}>{node}</Suspense>;
}

function lazyNamed<TModule extends Record<string, unknown>, TKey extends keyof TModule & string>(
  loader: () => Promise<TModule>,
  key: TKey,
) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[key] as ComponentType };
  });
}
