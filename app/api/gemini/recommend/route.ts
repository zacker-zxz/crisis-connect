import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { rateLimiter } from "@/lib/rateLimiter";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");

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

  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 });
  }
}
