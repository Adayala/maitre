import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./app/auth-context.js";
import { TenantProvider } from "./app/tenant-context.js";
import { DashboardLayout } from "./app/dashboard-layout.js";
import { PublicLayout } from "./app/public-layout.js";
import { CustomerAuthRequired } from "./app/customer-auth-required.js";
import { LoginPage } from "./features/login/login-page.js";
import { OverviewPage } from "./features/overview/overview-page.js";
import { SetupPage } from "./features/setup/setup-page.js";
import { BrandsPage } from "./features/brands/brands-page.js";
import { BranchesPage } from "./features/branches/branches-page.js";
import { UsersPage } from "./features/users/users-page.js";
import { SubscriptionPage } from "./features/subscription/subscription-page.js";
import { AuditLogsPage } from "./features/audit/audit-logs-page.js";
import { SettingsPage } from "./features/settings/settings-page.js";
import { ProfilesPage } from "./features/profiles/profiles-page.js";
import { PublicHomePage } from "./features/public/public-home-page.js";
import { PublicMenuPage } from "./features/public/public-menu-page.js";
import { PublicBranchesPage } from "./features/public/public-branches-page.js";
import { PublicPromotionsPage } from "./features/public/public-promotions-page.js";
import { PublicAvailabilityPage } from "./features/public/public-availability-page.js";
import { CustomerReservationPage } from "./features/public/customer-reservation-page.js";
import { CustomerReservationConfirmationPage } from "./features/public/customer-reservation-confirmation-page.js";
import { CustomerReservationsPage } from "./features/public/customer-reservations-page.js";
import { CustomerReservationDetailPage } from "./features/public/customer-reservation-detail-page.js";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantProvider>
          <BrowserRouter>
            <a href="#main-content" className="skip-link">
              Saltar al contenido principal
            </a>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/public" element={<PublicLayout />}>
                <Route index element={<PublicHomePage />} />
                <Route path="menu" element={<PublicMenuPage />} />
                <Route path="branches" element={<PublicBranchesPage />} />
                <Route path="promotions" element={<PublicPromotionsPage />} />
                <Route path="availability" element={<PublicAvailabilityPage />} />
                <Route
                  path="reservations"
                  element={
                    <CustomerAuthRequired>
                      <CustomerReservationsPage />
                    </CustomerAuthRequired>
                  }
                />
                <Route
                  path="reservations/new"
                  element={
                    <CustomerAuthRequired>
                      <CustomerReservationPage />
                    </CustomerAuthRequired>
                  }
                />
                <Route
                  path="reservations/confirmation"
                  element={
                    <CustomerAuthRequired>
                      <CustomerReservationConfirmationPage />
                    </CustomerAuthRequired>
                  }
                />
                <Route
                  path="reservations/:id"
                  element={
                    <CustomerAuthRequired>
                      <CustomerReservationDetailPage />
                    </CustomerAuthRequired>
                  }
                />
              </Route>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<OverviewPage />} />
                <Route path="setup" element={<SetupPage />} />
                <Route path="brands" element={<BrandsPage />} />
                <Route path="branches" element={<BranchesPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="audit" element={<AuditLogsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profiles" element={<ProfilesPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TenantProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
