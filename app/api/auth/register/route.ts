import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, password, role, skills, organizationName } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      skills: skills || [],
      organizationName: role === 'ngo' ? organizationName : undefined
    });

    return NextResponse.json({ message: 'User created successfully', userId: newUser._id }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
