// FoodBridge Demo Auth
// Simple cookie-based session for demo purposes
import { cookies } from 'next/headers';
import { getUserByEmail, getUserById } from './store';
import { User } from '@/types';

const SESSION_COOKIE = 'foodbridge-session-v2';

export async function login(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user || user.password !== password) return null;
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    secure: false, // demo only
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
  
  return user;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  if (!sessionCookie?.value) return null;
  
  const user = await getUserById(sessionCookie.value);
  return user || null;
}

export async function requireAuth(): Promise<User> {
  const user = await getSession();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
