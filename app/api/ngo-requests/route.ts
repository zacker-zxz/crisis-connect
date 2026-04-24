import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { NGORequest, User, Notification } from '@/models';
import { NGORequest, User, Notification } from '@/models';

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (role !== 'volunteer') {
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
      volunteerId: userId,
      status: 'Pending',
    });
    if (existing) {
      return NextResponse.json({ error: 'Request already pending' }, { status: 409 });
    }

    const newRequest = await NGORequest.create({
      ngoId,
      volunteerId: userId,
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
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');
    
    await connectToDatabase();
    
    if (role === 'ngo') {
      const requests = await NGORequest.find({ ngoId: userId }).populate('volunteerId', 'name email skills location phone');
      return NextResponse.json(requests);
    } else {
      const requests = await NGORequest.find({ volunteerId: userId });
      return NextResponse.json(requests);
    }
  } catch (error) {
    console.error('Fetch NGO requests error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');
    
    if (role !== 'ngo') {
      return NextResponse.json({ error: 'Only NGOs can manage requests' }, { status: 403 });
    }
    
    const body = await request.json();
    const { requestId, status, reason } = body;
    
    if (!requestId || !status) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    
    await connectToDatabase();
    
    const ngo = await User.findById(userId);
    const ngoName = ngo?.organizationName || ngo?.name || 'an NGO';

    const reqDoc = await NGORequest.findOne({ _id: requestId, ngoId: userId });
    if (!reqDoc) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    if (status === 'Approved') {
      const update = await NGORequest.findByIdAndUpdate(
        requestId,
        { status },
        { new: true }
      );
      
      await Notification.create({
        userId: reqDoc.volunteerId,
        title: 'Join Request Approved',
        message: `Welcome to the team! ${ngoName} has accepted your request to join.`,
        type: 'join'
      });

      return NextResponse.json(update);
    } 
    else if (status === 'Rejected') {
      await Notification.create({
        userId: reqDoc.volunteerId,
        title: 'Join Request Update',
        message: `We appreciate your interest in joining ${ngoName}. After careful review, we cannot accept your request at this time. Reason: ${reason || 'Capacity reached'}. Please keep training and feel free to re-apply in the future!`,
        type: 'alert'
      });

      // Automatically delete the request so the volunteer can re-apply and it disappears from their pending list
      await NGORequest.findByIdAndDelete(requestId);
      return NextResponse.json({ success: true, deleted: true });
    }

    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  } catch (error) {
    console.error('Update NGO requests error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
