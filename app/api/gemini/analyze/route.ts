import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { rateLimiter } from "@/lib/rateLimiter";
import { GoogleGenerativeAI } from "@google/generative-ai";

type ListModelsResponse = {
  models?: Array<{
    name?: string; // e.g. "models/gemini-1.5-flash"
    supportedGenerationMethods?: string[];
    description?: string;
  }>;
};

async function listGenerateContentModels(apiKey: string): Promise<string[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    { method: "GET" }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as ListModelsResponse;
  const names =
    data.models
      ?.map((m) => ({
        name: m.name?.replace(/^models\//, "") ?? "",
        methods: m.supportedGenerationMethods ?? [],
      }))
      .filter((m) => m.name && m.methods.includes("generateContent"))
      .map((m) => m.name) ?? [];
  return names;
}

function pickBestVisionCandidate(modelNames: string[]): string[] {
  // Heuristic preference order:
  // - image/vision models first if present
  // - then general flash/pro models
  const preferred = [
    // image-capable models observed in ListModels
    "gemini-2.5-flash-image",
    "gemini-3-pro-image-preview",
    "gemini-3.1-flash-image-preview",

    // vision models (older naming)
    "gemini-pro-vision",
    "gemini-1.0-pro-vision",
    "gemini-1.5-pro-vision",

    // general multimodal (often supports images too; depends on rollout)
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-exp",

    // legacy aliases that may exist on some keys
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-pro-latest",
  ];

  const available = new Set(modelNames);
  const ordered = preferred.filter((m) => available.has(m));
  // Add the rest (stable ordering) so we still try something.
  const remaining = modelNames.filter((m) => !ordered.includes(m));
  return [...ordered, ...remaining];
}

export async function POST(req: Request) {
  try {
    // 1. Rate limiting
    const limitResult = await rateLimiter(req);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // 2. Authentication via Middleware Headers
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key missing in environment" }, { status: 500 });
    }

    // Extract MIME type and data from data URL
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (image.startsWith("data:")) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const payload = {
      contents: [
        {
          parts: [
            { text: `
              You are an expert Social Impact & Crisis Analyst for a volunteer management platform called Crisis Connect.
              Analyze this image through the lens of community service and humanitarian needs.
              
              Provide a detailed assessment in the following JSON format:
              {
                "crisisType": "Short title (e.g. Animal Rescue, Structural Collapse, Food Drive)",
                "severity": "Critical, High, Medium, or Low",
                "description": "2-3 sentences describing the situation empatheticly.",
                "recommendedSkills": ["Skill 1", "Skill 2"], 
                "requiredSupplies": ["Supply 1", "Supply 2"],
                "suggestedPriority": "Critical", // MUST be exactly one of: Critical, Urgent, Medium, Low
                "estimatedVolunteersNeeded": 5
              }
              
              Return ONLY the JSON. No markdown, no extra text.
            ` },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ]
    };

    // Resolve an actually available model for THIS key.
    const discovered = await listGenerateContentModels(apiKey);
    const candidates = pickBestVisionCandidate(discovered);
    const fallback = [
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-pro-vision",
      "gemini-1.5-flash",
    ];
    const modelsToTry = candidates.length ? candidates : fallback;

    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError = "No compatible model found";

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(payload as any);
        const response = await result.response;
        const text = response.text()?.trim() ?? "";
        if (!text) continue;

        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start === -1 || end === -1) {
          lastError = `Model ${modelName} returned non-JSON output`;
          continue;
        }
        const jsonStr = text.substring(start, end + 1);
        return NextResponse.json(JSON.parse(jsonStr));
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    return NextResponse.json(
      {
        error: `AI analysis failed: ${lastError}`,
        hint:
          discovered.length === 0
            ? "ListModels returned no generateContent models for this key (check key/project/billing)."
            : `Tried models: ${modelsToTry.slice(0, 8).join(", ")}${modelsToTry.length > 8 ? ", …" : ""}`,
      },
      { status: 500 }
    );

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
