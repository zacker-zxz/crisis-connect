import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { NGORequest, User } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  try {
    if (!JWT_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: 'ngo' | 'volunteer' };
    if (decoded.role !== 'volunteer') {
      return NextResponse.json({ error: 'Only volunteers can send requests' }, { status: 403 });
    }

    const body = await request.json();
    const ngoId = body.ngoId as string;
    const message = (body.message as string) || '';

    if (!ngoId) {
      return NextResponse.json({ error: 'Missing ngoId' }, { status: 400 });
    }

    await connectToDatabase();

    const ngo = await User.findOne({ _id: ngoId, role: 'ngo' });
    if (!ngo) {
      return NextResponse.json({ error: 'NGO not found' }, { status: 404 });
    }

    const existing = await NGORequest.findOne({
      ngoId,
      volunteerId: decoded.userId,
      status: 'Pending',
    });
    if (existing) {
      return NextResponse.json({ error: 'Request already pending' }, { status: 409 });
    }

    const newRequest = await NGORequest.create({
      ngoId,
      volunteerId: decoded.userId,
      message,
      status: 'Pending',
    });

    return NextResponse.json({ id: newRequest._id, status: newRequest.status }, { status: 201 });
  } catch (error) {
    console.error('Create NGO request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
