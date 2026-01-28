import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

export type SessionUser = {
  id?: string;
  role?: Role;
  agencyId?: string;
  clientId?: string;
};

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId || !session.user.role) {
    throw new Error('Unauthorized');
  }
  return session.user as SessionUser;
}

export function assertRole(user: SessionUser, roles: Role[]) {
  if (!user.role || !roles.includes(user.role)) {
    throw new Error('Forbidden');
  }
}

export function enforceClientScope(user: SessionUser, clientId?: string | null) {
  if (user.role === 'CLIENT' && user.clientId !== clientId) {
    throw new Error('Forbidden');
  }
}

export function agencyWhere(user: SessionUser) {
  if (!user.agencyId) {
    throw new Error('Unauthorized');
  }
  return { agencyId: user.agencyId };
}
