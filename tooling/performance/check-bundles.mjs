import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const budgets = JSON.parse(
  readFileSync(new URL("./budgets.json", import.meta.url), "utf8"),
);
let failed = false;

for (const [workspace, limits] of Object.entries(budgets)) {
  const assets = readdirSync(join(workspace, "dist/assets"));
  const totals = { ".js": 0, ".css": 0 };
  for (const asset of assets) {
    const extension = extname(asset);
    if (extension in totals) {
      totals[extension] += gzipSync(
        readFileSync(join(workspace, "dist/assets", asset)),
      ).byteLength;
    }
  }
  const jsKb = totals[".js"] / 1024;
  const cssKb = totals[".css"] / 1024;
  console.log(
    `${workspace}: JS ${jsKb.toFixed(1)} KiB, CSS ${cssKb.toFixed(1)} KiB (gzip)`,
  );
  if (jsKb > limits.javascriptGzipKb || cssKb > limits.cssGzipKb) {
    console.error(`Bundle budget exceeded for ${workspace}`);
    failed = true;
  }
}

if (failed) process.exitCode = 1;
