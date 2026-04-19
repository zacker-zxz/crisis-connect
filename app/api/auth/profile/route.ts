import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sahayog_india_super_secret_fallback_key';

export async function PUT(request: Request) {
  try {
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
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

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
      publicDescription: updatedUser.publicDescription,
      phone: updatedUser.phone,
      website: updatedUser.website,
      sector: updatedUser.sector,
      city: updatedUser.city,
      operatingRegions: updatedUser.operatingRegions,
      notifyOnVolunteerJoin: updatedUser.notifyOnVolunteerJoin,
      notifyOnDeadline: updatedUser.notifyOnDeadline,
      notifyOnCapacityFull: updatedUser.notifyOnCapacityFull,
      emailNotifications: updatedUser.emailNotifications,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
