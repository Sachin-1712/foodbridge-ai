import { NextRequest, NextResponse } from 'next/server';
import { login, logout } from '@/lib/auth';
import { getUserByEmail } from '@/lib/store';
import { UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  donor: 'Donor',
  ngo: 'NGO',
  delivery: 'Delivery Partner',
};

const roleArticle: Record<UserRole, string> = {
  donor: 'a',
  ngo: 'an',
  delivery: 'a',
};

export async function POST(request: NextRequest) {
  try {
    const { email, password, selectedRole } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!selectedRole || !['donor', 'ngo', 'delivery'].includes(selectedRole)) {
      return NextResponse.json(
        { error: 'Please select a role before logging in' },
        { status: 400 }
      );
    }

    const profile = await getUserByEmail(email);

    if (!profile || profile.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (profile.role !== selectedRole) {
      const selected = selectedRole as UserRole;
      return NextResponse.json(
        { error: `This account is not registered as ${roleArticle[selected]} ${roleLabels[selected]}.` },
        { status: 403 }
      );
    }

    const user = await login(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await logout();
  return NextResponse.json({ success: true });
}
