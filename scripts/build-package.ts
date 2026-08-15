// Packages a platform-agnostic deployable: Next's standalone server output
// (self-contained, includes only the node_modules it actually needs) plus
// static assets and public files, archived as a single .tar.gz.
//
// Run `npm run build` first, then `npm run package` (or just `npm run package`,
// which runs both). The result lands in release/<name>-v<version>.tar.gz and
// can be shipped to any Node host: extract it, set env vars from .env.example,
// and run `node server.js`.
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const STANDALONE_DIR = path.join(ROOT, ".next", "standalone");
const RELEASE_DIR = path.join(ROOT, "release");

function main() {
  if (!fs.existsSync(STANDALONE_DIR)) {
    console.error(
      '.next/standalone not found. Run "npm run build" first (next.config.mjs must set output: "standalone").'
    );
    process.exit(1);
  }

  const { name, version } = JSON.parse(
    fs.readFileSync(path.join(ROOT, "package.json"), "utf-8")
  );

  // next build doesn't copy these into standalone/ on its own.
  fs.cpSync(path.join(ROOT, ".next", "static"), path.join(STANDALONE_DIR, ".next", "static"), {
    recursive: true,
  });
  if (fs.existsSync(path.join(ROOT, "public"))) {
    fs.cpSync(path.join(ROOT, "public"), path.join(STANDALONE_DIR, "public"), {
      recursive: true,
    });
  }

  fs.mkdirSync(RELEASE_DIR, { recursive: true });
  const archiveName = `${name}-v${version}.tar.gz`;

  // Relative paths, run from ROOT: an absolute Windows path (e.g. "D:\...")
  // makes some tar builds (bsdtar via Git Bash) misread the drive letter's
  // colon as a "host:path" remote spec instead of a local path.
  const archiveRelPath = path.join("release", archiveName);
  const standaloneRelDir = path.relative(ROOT, STANDALONE_DIR);

  execFileSync("tar", ["-czf", archiveRelPath, "-C", standaloneRelDir, "."], { cwd: ROOT });

  console.log(`Packaged release/${archiveName}`);
  console.log("Deploy anywhere Node runs:");
  console.log(`  1. Copy the archive to the target machine and extract it.`);
  console.log(`  2. Set the environment variables listed in .env.example.`);
  console.log(`  3. Run: node server.js   (defaults to PORT=3000, HOSTNAME=0.0.0.0)`);
}

main();
