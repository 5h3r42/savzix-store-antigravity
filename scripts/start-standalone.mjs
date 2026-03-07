import { spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const nextDir = path.join(rootDir, ".next");
const standaloneDir = path.join(nextDir, "standalone");
const serverPath = path.join(standaloneDir, "server.js");
const staticDir = path.join(nextDir, "static");
const standaloneStaticDir = path.join(standaloneDir, ".next", "static");
const publicDir = path.join(rootDir, "public");
const standalonePublicDir = path.join(standaloneDir, "public");

if (!existsSync(serverPath)) {
  console.error("Missing .next/standalone/server.js. Run `npm run build` first.");
  process.exit(1);
}

if (existsSync(publicDir)) {
  mkdirSync(standalonePublicDir, { recursive: true });
  cpSync(publicDir, standalonePublicDir, { recursive: true, force: true });
}

if (existsSync(staticDir)) {
  mkdirSync(path.dirname(standaloneStaticDir), { recursive: true });
  cpSync(staticDir, standaloneStaticDir, { recursive: true, force: true });
}

const child = spawn(process.execPath, [serverPath], {
  cwd: standaloneDir,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
