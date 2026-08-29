export const forbiddenRootOutputs = [
  ".nyc_output",
  "allure-results",
  "blob-report",
  "coverage",
  "dist",
  "junit.xml",
  "maitre-foundation-v0.1.zip",
  "playwright-report",
  "test-results",
];

export const requiredIgnoreRules = [
  "*.tsbuildinfo",
  ".artifacts/",
  ".claude/settings.local.json",
  ".claude/worktrees/",
  ".env",
  ".env.*",
  ".secrets/",
  ".superpowers/",
  "dist/",
  "node_modules/",
];

export const forbiddenTrackedPaths = [
  ".artifacts",
  ".claude/settings.local.json",
  ".claude/worktrees",
  ".env",
  ".secrets",
  ".superpowers",
];

export function rootLayoutViolations({
  rootEntries,
  ignoreRules,
  trackedFiles,
}) {
  const violations = [];
  const entries = new Set(rootEntries);
  const ignores = new Set(ignoreRules);

  for (const path of forbiddenRootOutputs) {
    if (entries.has(path)) violations.push(`forbidden root output: ${path}`);
  }

  for (const rule of requiredIgnoreRules) {
    if (!ignores.has(rule)) violations.push(`missing .gitignore rule: ${rule}`);
  }

  for (const path of forbiddenTrackedPaths) {
    const isTracked = trackedFiles.some(
      (file) => file === path || file.startsWith(`${path}/`),
    );
    if (isTracked) violations.push(`local path is tracked: ${path}`);
  }

  return violations;
}
