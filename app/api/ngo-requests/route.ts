import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { NGORequest, User } from '@/models';
import { env } from '@/lib/env';
import { getAuthToken, verifyAuthToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAuthToken(token, env.JWT_SECRET);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
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

export async function GET(request: Request) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAuthToken(token, env.JWT_SECRET);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    if (decoded.role === 'ngo') {
      const requests = await NGORequest.find({ ngoId: decoded.userId }).populate('volunteerId', 'name email skills location phone');
      return NextResponse.json(requests);
    } else {
      const requests = await NGORequest.find({ volunteerId: decoded.userId });
      return NextResponse.json(requests);
    }
  } catch (error) {
    console.error('Fetch NGO requests error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
      return NextResponse.json({ error: 'Only NGOs can manage requests' }, { status: 403 });
    }
    
    const body = await request.json();
    const { requestId, status } = body;
    
    if (!requestId || !status) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    
    await connectToDatabase();
    
    const update = await NGORequest.findOneAndUpdate(
      { _id: requestId, ngoId: decoded.userId },
      { status },
      { new: true }
    );
    
    if (!update) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    
    return NextResponse.json(update);
  } catch (error) {
    console.error('Update NGO requests error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
