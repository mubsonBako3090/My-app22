import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import { requireAuth } from '@/middleware/auth';

export async function POST(request) {
  try {
    await connectDB();

    // Authenticate user via cookie
    const user = await requireAuth(request);

    // Only customers can generate meters
    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can generate a meter' },
        { status: 403 }
      );
    }

    // Generate meter number if not present
    if (!user.meterNumber) {
      user.meterNumber = 'MTR' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    // Default meter fields
    user.meterType = user.meterType || 'smart';
    user.meterInstallationStatus = 'pending';
    user.meterRequestDate = new Date();

    // Optional: set next meter reading date automatically
    user.nextMeterReadingDate =
      user.nextMeterReadingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Save changes
    await user.save();

    return NextResponse.json({
      message: 'Meter generated successfully',
      meterNumber: user.meterNumber,
      meterType: user.meterType,
      installationStatus: user.meterInstallationStatus,
      requestDate: user.meterRequestDate,
      nextReadingDate: user.nextMeterReadingDate
    });
  } catch (err) {
    console.error('Meter generation error:', err);
    const status = err.status || 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
