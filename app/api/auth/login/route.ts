import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models';
import { env } from '@/lib/env';
import { setAuthCookie, verifyAuthToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { rateLimiter } from '@/lib/rateLimiter';

export async function POST(request: Request) {
  try {
    // Apply simple IP rate limiting
    const limitResult = await rateLimiter(request);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Validate request body
    const body = await request.json();
    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid request payload', details: parseResult.error.format() }, { status: 400 });
    }
    const { email, password } = parseResult.data;

    if (!env.JWT_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id.toString(), role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });

    // Prepare response without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
      skills: user.skills,
      profileImageUrl: user.profileImageUrl,
      availability: user.availability,
      location: user.location,
      organizationName: user.organizationName,
      publicDescription: user.publicDescription,
    };

    const response = NextResponse.json({ token, user: userResponse }, { status: 200 });
    // Set auth cookie (httpOnly, secure, sameSite)
    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
