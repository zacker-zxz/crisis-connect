import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function PUT(request: Request) {
  try {
    if (!JWT_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

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

    await connectToDatabase();
    
    const body = await request.json();
    
    // Allowed fields to update — profile + new settings fields
    const ALLOWED_FIELDS = [
      'name', 'email', 'organizationName', 'publicDescription',
      'skills', 'phone', 'website', 'sector', 'city', 'operatingRegions',
      'notifyOnVolunteerJoin', 'notifyOnDeadline', 'notifyOnCapacityFull', 'emailNotifications'
    ];

    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.organizationName) updateData.organizationName = body.organizationName;
    if (body.publicDescription) updateData.publicDescription = body.publicDescription;
    if (body.skills) updateData.skills = body.skills;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        skills: updatedUser.skills,
        organizationName: updatedUser.organizationName,
        publicDescription: updatedUser.publicDescription
    }, { status: 200 });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
