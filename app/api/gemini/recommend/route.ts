import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { rateLimiter } from "@/lib/rateLimiter";

// Remove global genAI instance to allow dynamic keys

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

    const { tasks, userSkills, userName } = await req.json();

    const keys = [env.GEMINI_API_KEY, env.GEMINI_API_KEY_BACKUP].filter(Boolean) as string[];
    if (keys.length === 0) {
      return NextResponse.json({ error: "Gemini API Key missing in environment" }, { status: 500 });
    }

    let lastError = "Recommendation failed";

    for (const apiKey of keys) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
          You are "Guardian AI", a high-performance orchestration engine for Crisis Connect.
          Your job is to analyze a volunteer's skillset and the active crisis missions to suggest the most IMPACTFUL deployment.
          
          Volunteer: ${userName}
          Skills: ${userSkills?.join(", ") || "General"}
          
          Missions:
          ${tasks.map((t: any) => `- ID: ${t._id}, Title: ${t.title}, Priority: ${t.priority}, Required Skills: ${t.requiredSkills?.join(", ") || "None"}`).join("\n")}
          
          Return a JSON object with:
          1. recommendedTaskId (the _id of the best task)
          2. reasoning (1-2 sentences in a highly professional, clinical, yet inspiring "AI" tone. Focus on why their specific skills save lives here).
          3. impactPotential (A percentage 0-100 of how much their presence boosts the mission success).
          
          Output ONLY the JSON. No preamble.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const cleanJson = text.replace(/```json|```/gi, "").trim();
        return NextResponse.json(JSON.parse(cleanJson));
      } catch (err: any) {
        lastError = err?.message || String(err);
        if (err?.status === 429 || lastError.toLowerCase().includes('quota') || lastError.toLowerCase().includes('429')) {
          continue; // Quota exhausted, try next key
        }
        break; // Other error, exit loop
      }
    }
    
    return NextResponse.json({ error: lastError }, { status: 500 });

  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 });
  }
}
