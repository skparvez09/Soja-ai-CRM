import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { webhookLeadSchema } from '@/lib/validators';
import { generateLeadCode } from '@/lib/id';
import { handleLeadCreated, logAutomationEvent } from '@/lib/events';

export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey || apiKey !== process.env.WEBHOOK_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limiter = rateLimit({ key: apiKey, limit: 30, windowMs: 60_000 });
  if (!limiter.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const payload = webhookLeadSchema.parse(await request.json());

  const client = payload.clientId
    ? await prisma.client.findUnique({ where: { id: payload.clientId } })
    : await prisma.client.findUnique({ where: { clientCode: payload.clientCode! } });

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const existing = await prisma.lead.findFirst({
    where: {
      clientId: client.id,
      phoneNumber: payload.phoneNumber,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }
  });

  if (existing) {
    await logAutomationEvent({
      agencyId: client.agencyId,
      clientId: client.id,
      eventType: 'WEBHOOK_DEDUPE',
      triggerTable: 'Lead',
      triggerRecordId: existing.id,
      relatedClientId: client.id,
      relatedLeadId: existing.id,
      status: 'SUCCESS',
      detailsJson: { reason: 'Duplicate lead within 24h' }
    });
    return NextResponse.json({ leadId: existing.id, deduped: true });
  }

  const lead = await prisma.lead.create({
    data: {
      agencyId: client.agencyId,
      clientId: client.id,
      leadCode: generateLeadCode(),
      customerName: payload.customerName,
      phoneNumber: payload.phoneNumber,
      source: payload.source,
      leadStatus: 'NEW'
    }
  });

  await prisma.conversation.create({
    data: {
      agencyId: client.agencyId,
      clientId: client.id,
      leadId: lead.id,
      lastMessage: payload.message,
      messageType: 'INCOMING',
      timestamp: payload.timestamp
    }
  });

  await handleLeadCreated(lead);

  return NextResponse.json({ leadId: lead.id, deduped: false });
}
