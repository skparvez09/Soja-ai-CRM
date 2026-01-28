import { prisma } from '@/lib/db';
import { generateEventId } from '@/lib/id';
import { LeadStatus, type Lead } from '@prisma/client';

export type AutomationStatus = 'SUCCESS' | 'FAILED';

export async function logAutomationEvent({
  agencyId,
  clientId,
  eventType,
  triggerTable,
  triggerRecordId,
  relatedClientId,
  relatedLeadId,
  status,
  detailsJson,
  errorMessage
}: {
  agencyId: string;
  clientId?: string | null;
  eventType: string;
  triggerTable: string;
  triggerRecordId: string;
  relatedClientId?: string | null;
  relatedLeadId?: string | null;
  status: AutomationStatus;
  detailsJson: Record<string, unknown>;
  errorMessage?: string | null;
}) {
  return prisma.automationLog.create({
    data: {
      agencyId,
      clientId: clientId ?? null,
      eventId: generateEventId(),
      eventType,
      triggerTable,
      triggerRecordId,
      relatedClientId: relatedClientId ?? null,
      relatedLeadId: relatedLeadId ?? null,
      status,
      detailsJson,
      errorMessage: errorMessage ?? null
    }
  });
}

export async function notifyAgencyAdmin(agencyId: string, payload: Record<string, unknown>) {
  // Placeholder for email/notification integration.
  return logAutomationEvent({
    agencyId,
    eventType: 'NOTIFICATION_PLACEHOLDER',
    triggerTable: 'Lead',
    triggerRecordId: payload.leadId as string,
    relatedClientId: payload.clientId as string,
    relatedLeadId: payload.leadId as string,
    status: 'SUCCESS',
    detailsJson: payload
  });
}

export async function handleLeadCreated(lead: Lead) {
  try {
    await notifyAgencyAdmin(lead.agencyId, {
      leadId: lead.id,
      clientId: lead.clientId,
      message: 'New lead created'
    });
    await logAutomationEvent({
      agencyId: lead.agencyId,
      clientId: lead.clientId,
      eventType: 'LEAD_CREATED',
      triggerTable: 'Lead',
      triggerRecordId: lead.id,
      relatedClientId: lead.clientId,
      relatedLeadId: lead.id,
      status: 'SUCCESS',
      detailsJson: { leadCode: lead.leadCode }
    });
  } catch (error) {
    await logAutomationEvent({
      agencyId: lead.agencyId,
      clientId: lead.clientId,
      eventType: 'LEAD_CREATED',
      triggerTable: 'Lead',
      triggerRecordId: lead.id,
      relatedClientId: lead.clientId,
      relatedLeadId: lead.id,
      status: 'FAILED',
      detailsJson: { message: 'Automation failed' },
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function handleLeadStatusChange({
  previous,
  next
}: {
  previous: LeadStatus;
  next: LeadStatus;
}) {
  if (previous === 'CONVERTED' || next !== 'CONVERTED') {
    return;
  }
  return 'CONVERTED';
}

export async function handleLeadConverted(lead: Lead) {
  try {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { convertedAt: new Date(), leadStatus: LeadStatus.CONVERTED }
    });
    await logAutomationEvent({
      agencyId: lead.agencyId,
      clientId: lead.clientId,
      eventType: 'LEAD_CONVERTED',
      triggerTable: 'Lead',
      triggerRecordId: lead.id,
      relatedClientId: lead.clientId,
      relatedLeadId: lead.id,
      status: 'SUCCESS',
      detailsJson: { leadCode: lead.leadCode }
    });
  } catch (error) {
    await logAutomationEvent({
      agencyId: lead.agencyId,
      clientId: lead.clientId,
      eventType: 'LEAD_CONVERTED',
      triggerTable: 'Lead',
      triggerRecordId: lead.id,
      relatedClientId: lead.clientId,
      relatedLeadId: lead.id,
      status: 'FAILED',
      detailsJson: { message: 'Conversion automation failed' },
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
