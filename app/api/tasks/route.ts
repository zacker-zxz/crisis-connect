import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Task } from '@/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// GET all tasks (for heatmap and volunteer dashboard)
export async function GET() {
  try {
    await connectToDatabase();
    // In a real app, we might filter by query params (e.g., status, location radius)
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
    if (!JWT_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'ngo') {
      return NextResponse.json({ error: 'Forbidden: Only NGOs can create tasks' }, { status: 403 });
    }

    // 2. Create task
    await connectToDatabase();
    const body = await request.json();
    const { title, description, requiredVolunteers, requiredSkills, location, dateTime } = body;

    if (!title || !description || !requiredVolunteers || !location || !location.lat || !location.lng || !dateTime) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTask = await Task.create({
      ngoId: decoded.userId,
      title,
      description,
      requiredVolunteers,
      requiredSkills: requiredSkills || [],
      location,
      dateTime: new Date(dateTime),
      status: 'Open'
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: any) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
