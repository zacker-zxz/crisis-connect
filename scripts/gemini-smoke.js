const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const r = await model.generateContent("Reply with exactly: OK");
  console.log(String(r.response.text()).trim());
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});

