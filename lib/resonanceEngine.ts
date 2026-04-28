// Scores tasks for a volunteer based on skill overlap, how badly they
// need people, priority level, and how close the volunteer is. Runs
// entirely on the server — no external API calls.

export type ResonanceBottleneck = "skill" | "capacity" | "priority" | "geo" | "balanced";

export interface ResonanceTaskInput {
  _id: string;
  title: string;
  priority?: string;
  requiredSkills?: string[];
  requiredVolunteers: number;
  filledVolunteers: number;
  location?: { lat?: number; lng?: number };
}

export interface ResonanceBreakdownItem {
  taskId: string;
  title: string;
  marginalScore: number;
  notes: string;
}

export interface ResonanceResult {
  marginalImpactIndex: number;
  impactPotential: number;
  recommendedTaskId: string;
  bottleneck: ResonanceBottleneck;
  projectedDeltaPercent: number;
  reasoning: string;
  breakdown: ResonanceBreakdownItem[];
}

const PRIORITY_WEIGHT: Record<string, number> = {
  Critical: 1,
  Urgent: 0.9,
  High: 0.85,
  Medium: 0.55,
  Low: 0.4,
};

function normSkills(skills: string[]): string[] {
  return skills.map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function skillMatchScore(required: string[] | undefined, user: string[]): number {
  if (!required?.length) return 0.65;
  const u = new Set(normSkills(user));
  if (u.size === 0) return 0.25;
  const req = normSkills(required);
  const hit = req.filter((r) => u.has(r)).length;
  return Math.min(1, hit / req.length);
}

function priorityWeight(p?: string): number {
  if (!p) return PRIORITY_WEIGHT.Medium;
  return PRIORITY_WEIGHT[p] ?? PRIORITY_WEIGHT.Medium;
}

function capacityStress(required: number, filled: number): number {
  if (required <= 0) return 0.5;
  const gap = Math.max(0, required - filled) / required;
  return Math.min(1, gap);
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function geoScore(
  taskLat?: number,
  taskLng?: number,
  userLat?: number,
  userLng?: number
): number {
  if (
    userLat == null ||
    userLng == null ||
    taskLat == null ||
    taskLng == null ||
    !Number.isFinite(userLat) ||
    !Number.isFinite(userLng) ||
    !Number.isFinite(taskLat) ||
    !Number.isFinite(taskLng)
  ) {
    return 0.55;
  }
  const d = haversineKm(userLat, userLng, taskLat, taskLng);
  return Math.max(0.15, Math.min(1, Math.exp(-d / 45)));
}

function inferBottleneck(
  tasks: ResonanceTaskInput[],
  userSkills: string[],
  best: { task: ResonanceTaskInput; parts: { s: number; c: number; p: number; g: number } }
): ResonanceBottleneck {
  const avgSkill =
    tasks.reduce((a, t) => a + skillMatchScore(t.requiredSkills, userSkills), 0) /
    Math.max(1, tasks.length);
  const avgCap =
    tasks.reduce((a, t) => a + capacityStress(t.requiredVolunteers, t.filledVolunteers || 0), 0) /
    Math.max(1, tasks.length);
  const { s, c, p, g } = best.parts;
  if (avgSkill < 0.35 && s <= 0.5) return "skill";
  if (avgCap > 0.55 && c >= p) return "capacity";
  if (p >= s && p >= c) return "priority";
  if (g > s && g > c) return "geo";
  return "balanced";
}

function buildReasoning(
  bottleneck: ResonanceBottleneck,
  title: string,
  index: number,
  delta: number
): string {
  const b =
    bottleneck === "skill"
      ? "Skill coverage is the binding constraint in your zone right now."
      : bottleneck === "capacity"
        ? "Volunteer capacity on open missions is the limiting factor."
        : bottleneck === "priority"
          ? "High-priority missions dominate marginal humanitarian throughput."
          : bottleneck === "geo"
            ? "Proximity and reachability strongly affect marginal deployment value."
            : "Multiple factors are balanced; your profile still shifts outcomes measurably.";
  return `${b} Taking "${title}" next raises projected field clearance by about ${delta}% in the model window. Marginal impact index: ${index}.`;
}

export function computeResonance(params: {
  tasks: ResonanceTaskInput[];
  userSkills: string[];
  userLat?: number;
  userLng?: number;
}): ResonanceResult | null {
  const { tasks, userSkills, userLat, userLng } = params;
  if (!tasks.length) return null;

  const scored = tasks.map((task) => {
    const s = skillMatchScore(task.requiredSkills, userSkills);
    const c = capacityStress(task.requiredVolunteers, task.filledVolunteers || 0);
    const p = priorityWeight(task.priority);
    const g = geoScore(task.location?.lat, task.location?.lng, userLat, userLng);
    const raw = 0.38 * s + 0.28 * c + 0.22 * p + 0.12 * g;
    const notes = `Skill ${Math.round(s * 100)}% · Capacity gap ${Math.round(c * 100)}% · Priority ${Math.round(p * 100)}% · Reach ${Math.round(g * 100)}%`;
    return { task, raw, parts: { s, c, p, g }, notes };
  });

  scored.sort((a, b) => b.raw - a.raw);
  const top = scored[0];
  const second = scored[1]?.raw ?? 0;
  const spread = Math.min(1, Math.max(0, top.raw - second));

  const marginal01 = Math.min(1, Math.max(0, top.raw * 0.92 + spread * 0.18));
  const marginalImpactIndex = Math.round(52 + marginal01 * 46);
  const projectedDeltaPercent = Math.round(Math.min(38, 12 + marginalImpactIndex * 0.22));

  const bottleneck = inferBottleneck(tasks, userSkills, {
    task: top.task,
    parts: top.parts,
  });

  const reasoning = buildReasoning(
    bottleneck,
    top.task.title,
    marginalImpactIndex,
    projectedDeltaPercent
  );

  const breakdown: ResonanceBreakdownItem[] = scored.slice(0, 6).map((x) => ({
    taskId: x.task._id,
    title: x.task.title,
    marginalScore: Math.round(x.raw * 100),
    notes: x.notes,
  }));

  return {
    marginalImpactIndex,
    impactPotential: marginalImpactIndex,
    recommendedTaskId: top.task._id,
    bottleneck,
    projectedDeltaPercent,
    reasoning,
    breakdown,
  };
}
