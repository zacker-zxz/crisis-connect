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
      return NextResponse.json({ error: 'Forbidden: Only volunteers can accept missions' }, { status: 403 });
    }

    const { id } = await context.params;

    await connectToDatabase();
    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    // Check if already assigned
    if (task.assignedVolunteers.includes(decoded.userId)) {
      return NextResponse.json({ error: 'Mission already accepted' }, { status: 400 });
    }

    // Check if full
    if (task.filledVolunteers >= task.requiredVolunteers) {
      return NextResponse.json({ error: 'Mission is already full' }, { status: 400 });
    }

    // Update task
    task.assignedVolunteers.push(decoded.userId);
    task.filledVolunteers += 1;
    if (task.filledVolunteers >= task.requiredVolunteers) {
      task.status = 'In Progress';
    }
    await task.save();

    return NextResponse.json({ success: true, task }, { status: 200 });
  } catch (error: any) {
    console.error('Accept mission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
