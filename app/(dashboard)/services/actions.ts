'use server';

import { prisma } from '@/lib/db';
import { logAutomationEvent } from '@/lib/events';
import { requireSession, assertRole, agencyWhere } from '@/lib/rbac';
import { serviceSchema } from '@/lib/validators';

export async function createService(formData: unknown) {
  const user = await requireSession();
  assertRole(user, ['OWNER', 'ADMIN', 'EDITOR']);
  const data = serviceSchema.parse(formData);
  const service = await prisma.service.create({
    data: {
      ...data,
      agencyId: user.agencyId!
    }
  });
  await logAutomationEvent({
    agencyId: user.agencyId!,
    clientId: service.clientId,
    eventType: 'SERVICE_CREATED',
    triggerTable: 'Service',
    triggerRecordId: service.id,
    relatedClientId: service.clientId,
    status: 'SUCCESS',
    detailsJson: { serviceName: service.serviceName }
  });
  return service;
}

export async function updateService(serviceId: string, formData: unknown) {
  const user = await requireSession();
  assertRole(user, ['OWNER', 'ADMIN', 'EDITOR']);
  const data = serviceSchema.partial({ clientId: true }).parse(formData);
  const service = await prisma.service.update({
    where: { id: serviceId, ...agencyWhere(user) },
    data
  });
  await logAutomationEvent({
    agencyId: user.agencyId!,
    clientId: service.clientId,
    eventType: 'SERVICE_UPDATED',
    triggerTable: 'Service',
    triggerRecordId: service.id,
    relatedClientId: service.clientId,
    status: 'SUCCESS',
    detailsJson: { serviceName: service.serviceName }
  });
  return service;
}

export async function deleteService(serviceId: string) {
  const user = await requireSession();
  assertRole(user, ['OWNER', 'ADMIN']);
  const service = await prisma.service.delete({
    where: { id: serviceId, ...agencyWhere(user) }
  });
  await logAutomationEvent({
    agencyId: user.agencyId!,
    clientId: service.clientId,
    eventType: 'SERVICE_DELETED',
    triggerTable: 'Service',
    triggerRecordId: service.id,
    relatedClientId: service.clientId,
    status: 'SUCCESS',
    detailsJson: { serviceName: service.serviceName }
  });
  return service;
}
