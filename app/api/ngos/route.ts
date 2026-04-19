import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const ngos = await User.find({ role: 'ngo' })
      .select('_id name email organizationName publicDescription location createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(ngos, { status: 200 });
  } catch (error) {
    console.error('Fetch NGOs error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
