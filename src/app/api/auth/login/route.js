import { NextResponse } from 'next/server';
import { withDatabase } from '@/lib/database';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';
import { successResponse } from '@/lib/utils';

export const POST = withDatabase(async (request) => {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated. Please contact support.' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    // Create response with user data (excluding password)
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      accountNumber: user.accountNumber,
      meterNumber: user.meterNumber,
      customerType: user.customerType,
      address: user.address,
      preferences: user.preferences,
      lastLogin: user.lastLogin
    };

    const response = NextResponse.json(
      successResponse({ user: userResponse }, 'Login successful')
    );

    // Set cookie
    setTokenCookie(response, token);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});