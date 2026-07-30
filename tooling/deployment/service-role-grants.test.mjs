import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationsDirectory = new URL(
  "../../supabase/migrations/",
  import.meta.url,
);
const migrationFiles = readdirSync(migrationsDirectory)
  .filter((file) => file.endsWith(".sql"))
  .sort();
const migrations = migrationFiles.map((file) => ({
  file,
  sql: readFileSync(new URL(file, migrationsDirectory), "utf8"),
}));

test("every public runtime table has an explicit service-role DML grant", () => {
  const runtimeTables = new Set(
    migrations
      .filter(({ file }) => file >= "20260723010000")
      .flatMap(({ sql }) =>
        [
          ...withoutComments(sql).matchAll(
            /create\s+table\s+(?:if\s+not\s+exists\s+)?((?:public\.)?[a-z_]+)/gi,
          ),
        ].map((match) => normalizeTable(match[1])),
      ),
  );
  const grantedTables = new Set(
    migrations.flatMap(({ sql }) =>
      [
        ...withoutComments(sql).matchAll(
          /grant\s+(?:all|(?:select|insert|update|delete)(?:\s*,\s*(?:select|insert|update|delete))*)\s+on\s+([\s\S]*?)\s+to\s+service_role\s*;/gi,
        ),
      ].flatMap((match) =>
        match[1].split(",").map((table) => normalizeTable(table)),
      ),
    ),
  );

  assert.deepEqual(
    [...runtimeTables].filter((table) => !grantedTables.has(table)).sort(),
    [],
  );
});

function withoutComments(sql) {
  return sql.replace(/--[^\n]*/g, "");
}

function normalizeTable(table) {
  return table
    .trim()
    .replace(/^public\./i, "")
    .toLowerCase();
}
