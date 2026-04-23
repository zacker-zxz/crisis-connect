import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models';
import { env } from '@/lib/env';
import { getAuthToken, verifyAuthToken } from '@/lib/auth';

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

    await connectToDatabase();
    
    const body = await request.json();
    
    // Allowed fields to update
    const ALLOWED_FIELDS = [
      'name', 'email', 'organizationName', 'publicDescription',
      'skills', 'phone', 'website', 'sector', 'city', 'operatingRegions',
      'notifyOnVolunteerJoin', 'notifyOnDeadline', 'notifyOnCapacityFull', 'emailNotifications'
    ];

    const updateData: any = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return sanitized user object
    const { password: _, ...sanitizedUser } = updatedUser.toObject();
    
    return NextResponse.json({
        ...sanitizedUser,
        id: updatedUser._id
    }, { status: 200 });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
