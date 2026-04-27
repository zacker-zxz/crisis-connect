import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Task } from '@/models';

// GET all tasks for this NGO, with assignedVolunteers populated
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (!userId || role !== 'ngo') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();

    const tasks = await Task.find({ ngoId: userId })
      .populate('assignedVolunteers', '-password')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    console.error('Missions roster error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
