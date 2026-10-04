import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const floorsRoot = join(root, "src", "floors");
const floorPattern = /^floor-(\d{2})-[a-z0-9-]+$/;

const filesBelow = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesBelow(path) : [path];
  });

const failures = [];
const floorFolders = readdirSync(floorsRoot)
  .filter((name) => floorPattern.test(name))
  .sort();

for (const folder of floorFolders) {
  const floorRoot = join(floorsRoot, folder);
  const order = floorPattern.exec(folder)[1];
  const expectedId = `f${order}`;
  const indexPath = join(floorRoot, "index.ts");
  if (!existsSync(indexPath)) {
    failures.push(`${folder}: missing index.ts`);
    continue;
  }
  const indexSource = readFileSync(indexPath, "utf8");
  if (!indexSource.includes(`id: "${expectedId}"`)) {
    failures.push(`${folder}: id must be "${expectedId}"`);
  }

  for (const path of filesBelow(floorRoot).filter((file) =>
    file.endsWith(".ts"),
  )) {
    const source = readFileSync(path, "utf8");
    const imports = source.matchAll(/from\s+["']([^"']+)["']/g);
    for (const [, specifier] of imports) {
      if (!specifier.startsWith(".")) {
        failures.push(
          `${relative(root, path)}: external import "${specifier}" is not allowed`,
        );
        continue;
      }
      const target = resolve(dirname(path), specifier);
      const insideOwnFloor =
        target === floorRoot || target.startsWith(`${floorRoot}${sep}`);
      const publicCoreImport =
        target === join(root, "src", "core", "contracts") ||
        target.startsWith(`${join(root, "src", "core", "contracts")}${sep}`) ||
        target === join(root, "src", "core", "ui-kit") ||
        target.startsWith(`${join(root, "src", "core", "ui-kit")}${sep}`);
      if (!insideOwnFloor && !publicCoreImport) {
        failures.push(
          `${relative(root, path)}: import "${specifier}" crosses a floor boundary`,
        );
      }
    }
  }

  const contentPath = join(floorRoot, "definition", "content.ts");
  if (existsSync(contentPath)) {
    const source = readFileSync(contentPath, "utf8");
    for (const [, id] of source.matchAll(/\bid:\s*["']([^"']+)["']/g)) {
      if (
        !id.startsWith(`${expectedId}_`) &&
        !id.startsWith(`${expectedId}.`)
      ) {
        failures.push(`${folder}: content id "${id}" is not namespaced`);
      }
    }
  }
}

const currentBranch = (() => {
  const ciBranch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
  if (ciBranch) return ciBranch;
  try {
    return execFileSync("git", ["branch", "--show-current"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
})();
const floorBranch = currentBranch.match(/^floor\/(\d{2})-/);
if (floorBranch) {
  const allowedPrefix = `src/floors/floor-${floorBranch[1]}-`;
  const changed = new Set();
  for (const args of [
    ["diff", "--name-only", "main...HEAD"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["diff", "--name-only"],
    ["diff", "--name-only", "--cached"],
  ]) {
    try {
      execFileSync("git", args, { cwd: root, encoding: "utf8" })
        .split("\n")
        .filter(Boolean)
        .forEach((file) => changed.add(file));
    } catch {
      // A missing main ref should not hide other validation failures.
    }
  }
  for (const file of changed) {
    if (!file.startsWith(allowedPrefix)) {
      failures.push(
        `${currentBranch}: changed "${file}" outside ${allowedPrefix}*`,
      );
    }
  }
}

if (floorFolders.length === 0) {
  failures.push("No floor modules were discovered");
}

if (failures.length > 0) {
  console.error(`Floor validation failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`Validated ${floorFolders.length} isolated floor modules.`);
