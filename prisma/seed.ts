import { PrismaClient, LeadSource, LeadStatus, PackageType, ClientStatus, PaymentStatus, BillingCycle, Role } from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { generateClientCode, generateLeadCode, generateEventId } from '../lib/id';

const prisma = new PrismaClient();

async function main() {
  const ownerPassword = hashSync('password123', 10);
  const agency = await prisma.agency.create({
    data: {
      name: 'Soja AI Automation Agency',
      ownerUserId: 'seed-owner'
    }
  });

  const owner = await prisma.user.create({
    data: {
      id: agency.ownerUserId,
      name: 'Agency Owner',
      email: 'owner@soja.ai',
      passwordHash: ownerPassword,
      role: Role.OWNER,
      agencyId: agency.id
    }
  });

  const clients = await prisma.$transaction(
    ['Nimbus Dental', 'Aura Fitness', 'Lumen Realty'].map((businessName, index) =>
      prisma.client.create({
        data: {
          agencyId: agency.id,
          clientCode: generateClientCode(),
          businessName,
          contactPerson: `Contact ${index + 1}`,
          whatsappNumber: `+1555000${index + 1}`,
          email: `client${index + 1}@soja.ai`,
          packageType: [PackageType.BASIC, PackageType.GROWTH, PackageType.PREMIUM][index],
          status: ClientStatus.ACTIVE,
          startDate: new Date()
        }
      })
    )
  );

  await prisma.user.create({
    data: {
      name: 'Client User',
      email: 'client@soja.ai',
      passwordHash: ownerPassword,
      role: Role.CLIENT,
      agencyId: agency.id,
      clientId: clients[0].id
    }
  });

  const leads = await prisma.$transaction(
    Array.from({ length: 20 }).map((_, index) =>
      prisma.lead.create({
        data: {
          agencyId: agency.id,
          clientId: clients[index % clients.length].id,
          leadCode: generateLeadCode(),
          customerName: `Lead ${index + 1}`,
          phoneNumber: `+1555123${index + 1}`,
          source: [LeadSource.WHATSAPP, LeadSource.FACEBOOK, LeadSource.WEBSITE][index % 3],
          leadStatus: [LeadStatus.NEW, LeadStatus.FOLLOW_UP, LeadStatus.CONVERTED, LeadStatus.LOST][index % 4],
          convertedAt: index % 4 === 2 ? new Date() : null
        }
      })
    )
  );

  await prisma.$transaction(
    leads.map((lead) =>
      prisma.conversation.create({
        data: {
          agencyId: agency.id,
          clientId: lead.clientId,
          leadId: lead.id,
          lastMessage: `Initial message for ${lead.customerName}`,
          messageType: 'INCOMING',
          timestamp: new Date()
        }
      })
    )
  );

  await prisma.$transaction(
    clients.map((client, index) =>
      prisma.payment.create({
        data: {
          agencyId: agency.id,
          clientId: client.id,
          amount: 1200 + index * 200,
          currency: 'USD',
          paymentStatus: [PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.OVERDUE][index % 3],
          billingCycle: BillingCycle.MONTHLY,
          dueDate: new Date(Date.now() + (index + 1) * 86400000),
          paidDate: index % 3 === 1 ? new Date() : null
        }
      })
    )
  );

  await prisma.$transaction(
    clients.map((client, index) =>
      prisma.service.create({
        data: {
          agencyId: agency.id,
          clientId: client.id,
          serviceName: `Automation Suite ${index + 1}`,
          serviceType: 'AI Automation',
          deliveryStatus: index % 2 === 0 ? 'In Progress' : 'Live',
          goLiveDate: index % 2 === 0 ? null : new Date(),
          notes: 'Initial rollout plan'
        }
      })
    )
  );

  await prisma.$transaction(
    leads.slice(0, 5).map((lead) =>
      prisma.automationLog.create({
        data: {
          agencyId: agency.id,
          clientId: lead.clientId,
          eventId: generateEventId(),
          eventType: 'LEAD_CREATED',
          triggerTable: 'Lead',
          triggerRecordId: lead.id,
          relatedClientId: lead.clientId,
          relatedLeadId: lead.id,
          status: 'SUCCESS',
          detailsJson: { seed: true }
        }
      })
    )
  );

  console.log('Seed complete:', { agency: agency.id, owner: owner.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
