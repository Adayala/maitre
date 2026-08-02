module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {
        pathNot: "^apps/web/src/lib/route-prefetch\\.ts$",
      },
      // Route prefetch intentionally lazy-imports route chunks which import the
      // intent helper back. It is a bundling edge, not a runtime layer cycle.
      to: {
        circular: true,
        pathNot: "^apps/web/src/lib/route-prefetch\\.ts$",
      },
    },
    {
      name: "domain-does-not-depend-on-apps-or-adapters",
      severity: "error",
      from: { path: "^packages/modules/" },
      to: { path: "^(apps|adapters)/" },
    },
    {
      name: "contracts-do-not-depend-on-runtime",
      severity: "error",
      from: { path: "^packages/contracts/" },
      to: { path: "^(apps|adapters|packages/modules)/" },
    },
    {
      name: "adapters-do-not-depend-on-apps",
      severity: "error",
      from: { path: "^adapters/" },
      to: { path: "^apps/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: "(^|/)(dist|node_modules|\\.artifacts)/",
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "types", "default"],
    },
  },
};
