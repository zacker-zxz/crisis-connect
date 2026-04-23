import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models';
import { registerSchema } from '@/lib/validation';
import { rateLimiter } from '@/lib/rateLimiter';

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const limitResult = await rateLimiter(request);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate request body
    const parseResult = registerSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request payload', 
        details: parseResult.error.format() 
      }, { status: 400 });
    }

    const { name, email, password, role, skills, organizationName, availability, profileImageUrl } = parseResult.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for better security

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      skills: skills || [],
      availability: availability || [],
      profileImageUrl: profileImageUrl || undefined,
      organizationName: role === 'ngo' ? organizationName : undefined
    });

    return NextResponse.json({ 
      message: 'User created successfully', 
      userId: newUser._id 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
