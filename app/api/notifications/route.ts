import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Notification } from '@/models';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    
    await connectToDatabase();
    
    // Fetch unread notifications for the user, newest first
    const notifications = await Notification.find({ userId, read: false })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');

    const body = await request.json();
    const { markAll, notificationId } = body;

    await connectToDatabase();

    if (markAll) {
      await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    } else if (notificationId) {
      await Notification.updateOne({ _id: notificationId, userId }, { $set: { read: true } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update notifications error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');

        await connectToDatabase();
        // Only delete notifications that have been read (viewed by the user)
        await Notification.deleteMany({ userId, read: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete notifications error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
