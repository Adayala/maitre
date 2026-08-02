export const DASHBOARD_SIDEBAR_STORAGE_KEY =
  "maitre.dashboardSidebar.preference";

export type DashboardSidebarPreference = "expanded" | "collapsed";

export function resolveDashboardSidebarCollapsed(
  storedPreference: string | null,
): boolean {
  return storedPreference === "collapsed";
}

export function dashboardSidebarPreference(
  collapsed: boolean,
): DashboardSidebarPreference {
  return collapsed ? "collapsed" : "expanded";
}
