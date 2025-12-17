// Auth helpers used by API routes (accept Next.js Request-like objects)
import connectDB from '@/lib/database';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * Ensure the incoming request is authenticated and return the user.
 * Throws an error when authentication fails so route handlers can return 401.
 */
export async function requireAuth(request) {
  await connectDB();
  const userId = await getUserIdFromRequest(request);
  if (!userId) throw new Error('Unauthorized');
  const user = await User.findById(userId);
  if (!user) throw new Error('Unauthorized');
  return user;
}

/**
 * Ensure the requester is an admin. Throws if not.
 */
export async function requireAdmin(request) {
  const user = await requireAuth(request);
  if (user.role !== 'admin') throw new Error('Admin access required');
  return true;
}
