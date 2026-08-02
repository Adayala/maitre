import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { collectFiles } from "./collect-files.mjs";

test("collectFiles recorre archivos, aplica el selector e ignora directorios locales", (t) => {
  const root = mkdtempSync(join(tmpdir(), "maitre-collect-files-"));
  t.after(() => rmSync(root, { recursive: true }));
  mkdirSync(join(root, "docs"));
  mkdirSync(join(root, ".artifacts"));
  writeFileSync(join(root, "README.md"), "# Root\n");
  writeFileSync(join(root, "docs", "guide.md"), "# Guide\n");
  writeFileSync(join(root, "docs", "data.json"), "{}\n");
  writeFileSync(join(root, ".artifacts", "report.md"), "# Generated\n");

  const files = collectFiles(root, {
    ignoredDirectories: new Set([".artifacts"]),
    select: (file) => file.endsWith(".md"),
  });

  assert.deepEqual(files.sort(), [
    join(root, "README.md"),
    join(root, "docs", "guide.md"),
  ]);
});

test("collectFiles usa defaults para incluir todos los archivos", (t) => {
  const root = mkdtempSync(join(tmpdir(), "maitre-collect-files-defaults-"));
  t.after(() => rmSync(root, { recursive: true }));
  writeFileSync(join(root, "file.txt"), "content\n");

  assert.deepEqual(collectFiles(root), [join(root, "file.txt")]);
});
