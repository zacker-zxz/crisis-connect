import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Task } from '@/models';
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
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (!userId || role !== 'ngo') {
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
      ngoId: userId,
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
