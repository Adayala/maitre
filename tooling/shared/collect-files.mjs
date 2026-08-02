import { readdirSync } from "node:fs";
import { join } from "node:path";

export function collectFiles(
  directory,
  { ignoredDirectories = new Set(), select = () => true } = {},
) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? collectFiles(path, { ignoredDirectories, select })
      : select(path)
        ? [path]
        : [];
  });
}
