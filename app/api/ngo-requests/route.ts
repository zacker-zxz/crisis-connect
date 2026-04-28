import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
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
      volunteerId: userId
    });
    if (existing) {
      if (existing.status === 'Rejected') {
        const cooldownDays = 14;
        // timestamps come from Mongoose's { timestamps: true }
        const rejectedAt = new Date((existing as any).updatedAt || (existing as any).createdAt || Date.now()).getTime();
        const daysSinceRejection = (Date.now() - rejectedAt) / (1000 * 60 * 60 * 24);
        
        if (daysSinceRejection < cooldownDays) {
          const daysLeft = Math.ceil(cooldownDays - daysSinceRejection);
          return NextResponse.json({ 
            error: `Your previous request to join this NGO was rejected. You can re-apply in ${daysLeft} days.` 
          }, { status: 403 });
        } else {
          // cooldown expired, nuke the old rejection so they can try again
          await NGORequest.findByIdAndDelete(existing._id);
        }
      } else {
        return NextResponse.json({ error: 'Request already pending or approved' }, { status: 409 });
      }
    }

    const newRequest = await NGORequest.create({
      ngoId,
      volunteerId: userId,
      message,
      status: 'Pending',
    });

    // ping the NGO so they see the request
    const volunteer = await User.findById(userId).select('name');
    const volName = volunteer?.name || 'A volunteer';
    const ngoName = ngo?.organizationName || ngo?.name || 'your organization';
    await Notification.create({
      userId: ngoId,
      title: 'New Join Request',
      message: `${volName} wants to join ${ngoName}.`,
      type: 'join'
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

      const update = await NGORequest.findByIdAndUpdate(
        requestId,
        { status: 'Rejected', rejectionReason: reason || '' },
        { new: true }
      );
      return NextResponse.json(update);
    }

    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  } catch (error) {
    console.error('Update NGO requests error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
