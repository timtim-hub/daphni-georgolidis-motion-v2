#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Mandatory extraction tool: Instaloader (GitHub: instaloader/instaloader)
// Wrapper to keep `npm run fetch:instagram` stable while executing the Python pipeline.

const scriptPath = path.resolve(process.cwd(), "scripts", "fetch-instagram-instaloader.py");

// Optional CI-friendly auth: allow providing the Instaloader sessionfile as base64 via env.
// This avoids storing a session cookie file in the repo while still enabling full extraction on Netlify.
if (process.env.IG_SESSION_BASE64 && !process.env.IG_SESSIONFILE) {
  const username = process.env.IG_USERNAME;
  if (!username) {
    console.error("ERROR: IG_SESSION_BASE64 is set but IG_USERNAME is missing.");
    process.exit(1);
  }

  const dataDir = path.resolve(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const sessionPath = path.join(dataDir, `ig-session-${(process.env.IG_PROFILE || "profile").replace(/^@/, "")}`);

  // Do not log the content. This is a secret.
  const buf = Buffer.from(process.env.IG_SESSION_BASE64, "base64");
  fs.writeFileSync(sessionPath, buf);
  process.env.IG_SESSIONFILE = sessionPath;
}

execFileSync("python3", [scriptPath], {
  stdio: "inherit",
  env: process.env
});
