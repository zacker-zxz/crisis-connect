import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Task, User, Notification } from '@/models';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (role !== 'volunteer') {
      return NextResponse.json({ error: 'Forbidden: Only volunteers can accept missions' }, { status: 403 });
    }

    const { id } = await context.params;

    await connectToDatabase();
    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    // already on this mission?
    if (task.assignedVolunteers.includes(userId)) {
      return NextResponse.json({ error: 'Mission already accepted' }, { status: 400 });
    }

    // no more slots
    if (task.filledVolunteers >= task.requiredVolunteers) {
      return NextResponse.json({ error: 'Mission is already full' }, { status: 400 });
    }

    // add volunteer + bump count
    task.assignedVolunteers.push(userId);
    task.filledVolunteers += 1;
    if (task.filledVolunteers >= task.requiredVolunteers) {
      task.status = 'In Progress';
    }
    await task.save();

    // let the NGO know someone joined
    const volunteer = await User.findById(userId).select('name');
    const volName = volunteer?.name || 'A volunteer';
    await Notification.create({
      userId: task.ngoId,
      title: 'Volunteer Joined Mission',
      message: `${volName} has joined your mission "${task.title}".`,
      type: 'mission'
    });

    return NextResponse.json({ success: true, task }, { status: 200 });
  } catch (error: any) {
    console.error('Accept mission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
