import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Task } from '@/models';
import { env } from '@/lib/env';
import { getAuthToken, verifyAuthToken } from '@/lib/auth';
import { createTaskSchema } from '@/lib/validation';

// GET all tasks (for heatmap and volunteer dashboard)
export async function GET() {
  try {
    await connectToDatabase();
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    return NextResponse.json(tasks, { status: 200 });
  } catch (error: any) {
    console.error('Fetch tasks error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST a new task (NGO only)
export async function POST(request: Request) {
  try {
    // 1. Authenticate user via cookie
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAuthToken(token, env.JWT_SECRET);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'ngo') {
      return NextResponse.json({ error: 'Forbidden: Only NGOs can create tasks' }, { status: 403 });
    }

    // 2. Validate request body
    const body = await request.json();
    const parseResult = createTaskSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request payload', 
        details: parseResult.error.format() 
      }, { status: 400 });
    }

    const { title, description, requiredVolunteers, requiredSkills, location, dateTime, priority } = parseResult.data;

    // 3. Create task
    await connectToDatabase();
    const newTask = await Task.create({
      ngoId: decoded.userId,
      title,
      description,
      requiredVolunteers,
      requiredSkills: requiredSkills || [],
      location,
      dateTime: new Date(dateTime),
      status: 'Open',
      priority: priority || 'Medium'
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: any) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
