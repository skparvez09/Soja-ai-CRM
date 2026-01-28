'use server';

import { prisma } from '@/lib/db';
import { generateClientCode } from '@/lib/id';
import { logAutomationEvent } from '@/lib/events';
import { requireSession, assertRole, agencyWhere } from '@/lib/rbac';
import { clientSchema } from '@/lib/validators';

export async function createClient(formData: unknown) {
  const user = await requireSession();
  assertRole(user, ['OWNER', 'ADMIN', 'EDITOR']);
  const data = clientSchema.parse(formData);
  const client = await prisma.client.create({
    data: {
      ...data,
      agencyId: user.agencyId!,
      clientCode: generateClientCode(),
      startDate: data.startDate
    }
  });
  await logAutomationEvent({
    agencyId: user.agencyId!,
    clientId: client.id,
    eventType: 'CLIENT_CREATED',
    triggerTable: 'Client',
    triggerRecordId: client.id,
    relatedClientId: client.id,
    status: 'SUCCESS',
    detailsJson: { clientCode: client.clientCode }
  });
  return client;
}

export async function updateClient(clientId: string, formData: unknown) {
  const user = await requireSession();
  assertRole(user, ['OWNER', 'ADMIN', 'EDITOR']);
  const data = clientSchema.parse(formData);
  const client = await prisma.client.update({
    where: { id: clientId, ...agencyWhere(user) },
    data
  });
  await logAutomationEvent({
    agencyId: user.agencyId!,
    clientId: client.id,
    eventType: 'CLIENT_UPDATED',
    triggerTable: 'Client',
    triggerRecordId: client.id,
    relatedClientId: client.id,
    status: 'SUCCESS',
    detailsJson: { clientCode: client.clientCode }
  });
  return client;
}

export async function deleteClient(clientId: string) {
  const user = await requireSession();
  assertRole(user, ['OWNER', 'ADMIN']);
  const client = await prisma.client.delete({
    where: { id: clientId, ...agencyWhere(user) }
  });
  await logAutomationEvent({
    agencyId: user.agencyId!,
    clientId: client.id,
    eventType: 'CLIENT_DELETED',
    triggerTable: 'Client',
    triggerRecordId: client.id,
    relatedClientId: client.id,
    status: 'SUCCESS',
    detailsJson: { clientCode: client.clientCode }
  });
  return client;
}
