import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getAuthToken, verifyAuthToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Task, User } from "@/models";
import { rateLimiter } from "@/lib/rateLimiter";
import { computeResonance, type ResonanceTaskInput } from "@/lib/resonanceEngine";

async function polishReasoningWithGemini(baseReasoning: string, taskTitle: string): Promise<string> {
  if (!env.GEMINI_API_KEY?.trim()) return baseReasoning;
  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are Guardian AI for Crisis Connect. Rewrite the following resonance briefing in 1–2 sentences, clinical and inspiring, under 280 characters. Do not change any numbers or percentages. Task: "${taskTitle}". Text: ${baseReasoning}`;
    const result = await model.generateContent(prompt);
    const text = (await result.response.text()).trim().replace(/^["']|["']$/g, "");
    return text.length > 10 ? text : baseReasoning;
  } catch {
    return baseReasoning;
  }
}

export async function POST(req: Request) {
  try {
    const limitResult = await rateLimiter(req);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: { userId: string; role: "ngo" | "volunteer" };
    try {
      decoded = verifyAuthToken(token, env.JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (decoded.role !== "volunteer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    const volunteerDoc = await User.findById(decoded.userId)
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

    const volunteerId = String(decoded.userId);
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
