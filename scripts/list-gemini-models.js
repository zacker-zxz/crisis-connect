const fs = require("fs");

function readKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  const envPath = ".env";
  if (!fs.existsSync(envPath)) return "";
  const txt = fs.readFileSync(envPath, "utf8");
  const m = txt.match(/^\s*GEMINI_API_KEY\s*=\s*(.+)\s*$/m);
  if (!m) return "";
  return m[1].trim().replace(/^['"]|['"]$/g, "");
}

async function main() {
  const key = readKey();
  if (!key) {
    console.error("Missing GEMINI_API_KEY (env or .env).");
    process.exit(2);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
    key
  )}`;
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("ListModels failed:", res.status, JSON.stringify(json, null, 2));
    process.exit(3);
  }

  const models = Array.isArray(json.models) ? json.models : [];
  const gen = models
    .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map((m) => m.name)
    .filter(Boolean);

  console.log("generateContent models:", gen.length);
  console.log(gen.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

