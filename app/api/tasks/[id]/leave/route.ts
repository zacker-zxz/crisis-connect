import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Task } from '@/models';
import { env } from '@/lib/env';
import { getAuthToken, verifyAuthToken } from '@/lib/auth';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAuthToken(token, env.JWT_SECRET);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'volunteer') {
      return NextResponse.json({ error: 'Forbidden: Only volunteers can leave missions' }, { status: 403 });
    }

    const { id } = await context.params;

    await connectToDatabase();
    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    const volunteerId = String(decoded.userId);
    const assigned = (task.assignedVolunteers || []).map((v: any) => String(v));
    const hasMission = assigned.includes(volunteerId);
    if (!hasMission) {
      return NextResponse.json({ error: 'Mission not assigned to this volunteer' }, { status: 400 });
    }

    task.assignedVolunteers = (task.assignedVolunteers || []).filter(
      (v: any) => String(v) !== volunteerId
    );
    task.filledVolunteers = Math.max(0, (task.filledVolunteers || 0) - 1);
    if (task.filledVolunteers < task.requiredVolunteers && task.status !== 'Completed') {
      task.status = 'Open';
    }
    await task.save();

    return NextResponse.json({ success: true, task }, { status: 200 });
  } catch (error: any) {
    console.error('Leave mission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
