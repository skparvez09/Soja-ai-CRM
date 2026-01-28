'use server';

import { prisma } from '@/lib/db';
import { generateLeadCode } from '@/lib/id';
import { handleLeadCreated, handleLeadConverted, handleLeadStatusChange, logAutomationEvent } from '@/lib/events';
import { requireSession, assertRole, agencyWhere, enforceClientScope } from '@/lib/rbac';
import { leadSchema } from '@/lib/validators';

export async function createLead(formData: unknown) {
  const user = await requireSession();
  assertRole(user, ['OWNER', 'ADMIN', 'EDITOR']);
  const data = leadSchema.parse(formData);
  const lead = await prisma.lead.create({
    data: {
      ...data,
      agencyId: user.agencyId!,
      leadCode: generateLeadCode()
    }
  });
  await handleLeadCreated(lead);
  return lead;
}

export async function updateLead(leadId: string, formData: unknown) {
  const user = await requireSession();
  assertRole(user, ['OWNER', 'ADMIN', 'EDITOR']);
  const data = leadSchema.partial({ clientId: true }).parse(formData);
  const existing = await prisma.lead.findUnique({ where: { id: leadId, ...agencyWhere(user) } });
  if (!existing) {
    throw new Error('Lead not found');
  }
  enforceClientScope(user, existing.clientId);
  const updated = await prisma.lead.update({
    where: { id: leadId },
    data
  });
  if (data.leadStatus && (await handleLeadStatusChange({ previous: existing.leadStatus, next: data.leadStatus }))) {
    await handleLeadConverted(updated);
  }
  await logAutomationEvent({
    agencyId: user.agencyId!,
    clientId: updated.clientId,
    eventType: 'LEAD_UPDATED',
    triggerTable: 'Lead',
    triggerRecordId: updated.id,
    relatedClientId: updated.clientId,
    relatedLeadId: updated.id,
    status: 'SUCCESS',
    detailsJson: { leadCode: updated.leadCode }
  });
  return updated;
}

export async function deleteLead(leadId: string) {
  const user = await requireSession();
  assertRole(user, ['OWNER', 'ADMIN']);
  const lead = await prisma.lead.delete({
    where: { id: leadId, ...agencyWhere(user) }
  });
  await logAutomationEvent({
    agencyId: user.agencyId!,
    clientId: lead.clientId,
    eventType: 'LEAD_DELETED',
    triggerTable: 'Lead',
    triggerRecordId: lead.id,
    relatedClientId: lead.clientId,
    relatedLeadId: lead.id,
    status: 'SUCCESS',
    detailsJson: { leadCode: lead.leadCode }
  });
  return lead;
}
