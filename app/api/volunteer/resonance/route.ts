import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { Task, User } from "@/models";
import { rateLimiter } from "@/lib/rateLimiter";
import { computeResonance, type ResonanceTaskInput } from "@/lib/resonanceEngine";

async function polishReasoningWithGemini(baseReasoning: string, taskTitle: string): Promise<string> {
  const keys = [env.GEMINI_API_KEY, env.GEMINI_API_KEY_BACKUP].filter(Boolean) as string[];
  if (keys.length === 0) return baseReasoning;

  for (const apiKey of keys) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are Guardian AI for Crisis Connect. Rewrite the following resonance briefing in 1–2 sentences, clinical and inspiring, under 280 characters. Do not change any numbers or percentages. Task: "${taskTitle}". Text: ${baseReasoning}`;
      const result = await model.generateContent(prompt);
      const text = (await result.response.text()).trim().replace(/^["']|["']$/g, "");
      return text.length > 10 ? text : baseReasoning;
    } catch (err: any) {
      const errorStr = String(err).toLowerCase();
      if (err?.status === 429 || errorStr.includes('quota') || errorStr.includes('429')) {
        continue; // Quota exhausted, try next key
      }
      break; // Other error, exit loop
    }
  }
  return baseReasoning;
}

export async function POST(req: Request) {
  try {
    const limitResult = await rateLimiter(req);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const userId = req.headers.get('x-user-id');
    const role = req.headers.get('x-user-role');

    if (role !== "volunteer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    const volunteerDoc = await User.findById(userId)
      .select("skills location name")
      .lean();

    const volunteer = volunteerDoc as {
      skills?: string[];
      location?: { lat?: number; lng?: number };
      name?: string;
    } | null;

    if (!volunteer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const rawTasks = await Task.find({
      status: { $in: ["Open", "In Progress"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    const volunteerId = String(userId);
    const eligible = rawTasks.filter((t) => {
      const ids = (t.assignedVolunteers || []).map((id) => String(id));
      return !ids.includes(volunteerId);
    });

    const tasks: ResonanceTaskInput[] = eligible.map((t) => ({
      _id: String(t._id),
      title: t.title,
      priority: t.priority,
      requiredSkills: (t.requiredSkills as string[]) || [],
      requiredVolunteers: t.requiredVolunteers,
      filledVolunteers: t.filledVolunteers ?? 0,
      location: {
        lat: t.location?.lat,
        lng: t.location?.lng,
      },
    }));

    const userSkills = (volunteer.skills as string[]) || [];
    const userLat = volunteer.location?.lat;
    const userLng = volunteer.location?.lng;

    const computed = computeResonance({
      tasks,
      userSkills,
      userLat: userLat ?? undefined,
      userLng: userLng ?? undefined,
    });

    if (!computed) {
      return NextResponse.json({
        recommendation: null,
        message: "No eligible missions for resonance scoring.",
      });
    }

    const recommendedTitle =
      tasks.find((x) => x._id === computed.recommendedTaskId)?.title ?? "";

    const reasoning = await polishReasoningWithGemini(computed.reasoning, recommendedTitle);

    return NextResponse.json({
      recommendedTaskId: computed.recommendedTaskId,
      recommendedTitle,
      reasoning,
      impactPotential: computed.impactPotential,
      marginalImpactIndex: computed.marginalImpactIndex,
      bottleneck: computed.bottleneck,
      projectedDeltaPercent: computed.projectedDeltaPercent,
      breakdown: computed.breakdown,
    });
  } catch (error) {
    console.error("Resonance API error:", error);
    return NextResponse.json({ error: "Failed to compute resonance" }, { status: 500 });
  }
}
