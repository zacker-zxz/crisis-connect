import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Task } from '@/models';
import { env } from '@/lib/env';
import { getAuthToken, verifyAuthToken } from '@/lib/auth';

// GET a single task
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const task = await Task.findById(id).populate('ngoId', 'name organizationName');
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(task, { status: 200 });
  } catch (error: any) {
    console.error('Fetch task error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// UPDATE a task (NGO only)
export async function PUT(
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

    if (decoded.role !== 'ngo') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;

    await connectToDatabase();
    const body = await request.json();
    
    // Check ownership
    const task = await Task.findById(id);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    if (task.ngoId.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this mission' }, { status: 403 });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error: any) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a task (NGO only)
export async function DELETE(
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

    if (decoded.role !== 'ngo') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;

    await connectToDatabase();
    const task = await Task.findById(id);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    if (task.ngoId.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this mission' }, { status: 403 });
    }

    await Task.findByIdAndDelete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
