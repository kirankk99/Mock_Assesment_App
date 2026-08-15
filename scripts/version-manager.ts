// Keeps the app version in sync across package.json and lib/constants.ts.
//
// Deliberately NOT named "version" as an npm script — that name is reserved
// by npm's own `npm version <bump>` command (which requires a clean git tree
// and bumps package.json itself before this file ever runs).
//
// Usage:
//   npm run version:bump                # no change, just re-sync lib/constants.ts
//   npm run version:bump -- patch       # 1.0.0 -> 1.0.1, then sync
//   npm run version:bump -- minor       # 1.0.0 -> 1.1.0, then sync
//   npm run version:bump -- major       # 1.0.0 -> 2.0.0, then sync
//   npm run version:bump -- 2.3.0       # set an explicit version, then sync
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PACKAGE_JSON_PATH = path.join(ROOT, "package.json");
const CONSTANTS_PATH = path.join(ROOT, "lib", "constants.ts");

const SEMVER = /^\d+\.\d+\.\d+$/;
const PACKAGE_VERSION_LINE = /("version"\s*:\s*")\d+\.\d+\.\d+(")/;
const CONSTANTS_VERSION_LINE = /(App_version\s*=\s*")\d+\.\d+\.\d+(")/;

function readPackageVersion(): { raw: string; current: string } {
  const raw = fs.readFileSync(PACKAGE_JSON_PATH, "utf-8");
  const match = raw.match(PACKAGE_VERSION_LINE);
  if (!match) {
    throw new Error(`Could not find a "version" field in ${PACKAGE_JSON_PATH}`);
  }
  return { raw, current: JSON.parse(raw).version };
}

function bumpVersion(current: string, kind: string): string {
  if (SEMVER.test(kind)) return kind;

  const [major, minor, patch] = current.split(".").map(Number);
  switch (kind) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(
        `Unrecognized bump kind "${kind}". Use patch, minor, major, or an explicit x.y.z version.`
      );
  }
}

function writePackageVersion(raw: string, nextVersion: string): void {
  const updated = raw.replace(PACKAGE_VERSION_LINE, `$1${nextVersion}$2`);
  fs.writeFileSync(PACKAGE_JSON_PATH, updated);
}

function writeConstantsVersion(nextVersion: string): void {
  const raw = fs.readFileSync(CONSTANTS_PATH, "utf-8");
  if (!CONSTANTS_VERSION_LINE.test(raw)) {
    throw new Error(`Could not find "App_version" in ${CONSTANTS_PATH}`);
  }
  const updated = raw.replace(CONSTANTS_VERSION_LINE, `$1${nextVersion}$2`);
  fs.writeFileSync(CONSTANTS_PATH, updated);
}

function main() {
  const [, , kind] = process.argv;
  const { raw, current } = readPackageVersion();

  const nextVersion = kind ? bumpVersion(current, kind) : current;

  if (kind) {
    writePackageVersion(raw, nextVersion);
    console.log(`package.json version: ${current} -> ${nextVersion}`);
  } else {
    console.log(`package.json version: ${current} (unchanged)`);
  }

  writeConstantsVersion(nextVersion);
  console.log(`lib/constants.ts App_version synced to ${nextVersion}`);
}

main();
