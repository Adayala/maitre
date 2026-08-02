import assert from "node:assert/strict";
import test from "node:test";
import {
  DASHBOARD_SIDEBAR_STORAGE_KEY,
  dashboardSidebarPreference,
  resolveDashboardSidebarCollapsed,
} from "../src/app/dashboard-sidebar-model.js";

test("dashboard sidebar preference uses one durable application key", () => {
  assert.equal(
    DASHBOARD_SIDEBAR_STORAGE_KEY,
    "maitre.dashboardSidebar.preference",
  );
});

test("dashboard sidebar only restores the explicit collapsed preference", () => {
  assert.equal(resolveDashboardSidebarCollapsed("collapsed"), true);
  assert.equal(resolveDashboardSidebarCollapsed("expanded"), false);
  assert.equal(resolveDashboardSidebarCollapsed(null), false);
  assert.equal(resolveDashboardSidebarCollapsed("invalid"), false);
});

test("dashboard sidebar serializes both visual states", () => {
  assert.equal(dashboardSidebarPreference(true), "collapsed");
  assert.equal(dashboardSidebarPreference(false), "expanded");
});
