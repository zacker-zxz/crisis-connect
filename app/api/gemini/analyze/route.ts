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
  // try image-first models, then fall back to general multimodal ones
  const preferred = [
    // image models (newer API surface)
    "gemini-2.5-flash-image",
    "gemini-3-pro-image-preview",
    "gemini-3.1-flash-image-preview",

    // older vision naming convention
    "gemini-pro-vision",
    "gemini-1.0-pro-vision",
    "gemini-1.5-pro-vision",

    // these usually handle images too
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-exp",

    // might still exist on some keys
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-pro-latest",
  ];

  const available = new Set(modelNames);
  const ordered = preferred.filter((m) => available.has(m));
  // tack on anything else we found so we don't miss a model
  const remaining = modelNames.filter((m) => !ordered.includes(m));
  return [...ordered, ...remaining];
}

export async function POST(req: Request) {
  try {
    // rate limit first
    const limitResult = await rateLimiter(req);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // auth — middleware injects the user id header
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const keys = [env.GEMINI_API_KEY, env.GEMINI_API_KEY_BACKUP].filter(Boolean) as string[];
    if (keys.length === 0) {
      return NextResponse.json({ error: "Gemini API Key missing in environment" }, { status: 500 });
    }

    // pull the mime + base64 payload out of the data URL
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

    let lastError = "No compatible model found";
    let discovered: string[] = [];

    for (const [index, apiKey] of keys.entries()) {
      try {
        console.log(`[Gemini Analyze] Attempting with Key #${index + 1}...`);
        discovered = await listGenerateContentModels(apiKey);
        const candidates = pickBestVisionCandidate(discovered);
        const fallback = [
          "gemini-2.0-flash",
          "gemini-2.0-flash-lite",
          "gemini-pro-vision",
        ];
        const modelsToTry = candidates.length ? candidates : fallback;

        const genAI = new GoogleGenerativeAI(apiKey);

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
            console.log(`[Gemini Analyze] Success with Key #${index + 1} using model ${modelName}`);
            return NextResponse.json(JSON.parse(jsonStr));
          } catch (err: any) {
            lastError = err?.message || String(err);
            const isQuotaError = err?.status === 429 || lastError.toLowerCase().includes('quota') || lastError.toLowerCase().includes('429');
            
            if (isQuotaError) {
              console.warn(`[Gemini Analyze] Key #${index + 1} failed on model ${modelName} (Quota). Trying next model...`);
              continue; // Instead of breaking the key, try the next fallback model for this key
            }
          }
        }
      } catch (err: any) {
         lastError = err?.message || String(err);
         const isQuotaError = err?.status === 429 || lastError.toLowerCase().includes('quota') || lastError.toLowerCase().includes('429');
         if (isQuotaError) {
            console.warn(`[Gemini Analyze] Key #${index + 1} failed listing models. Trying next key...`);
            continue; 
         }
      }
    }

    return NextResponse.json(
      {
        error: `AI analysis failed: ${lastError}`,
        hint:
          discovered.length === 0
            ? "ListModels returned no generateContent models (check key/project/billing)."
            : "Tried multiple models and keys.",
      },
      { status: 500 }
    );

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
