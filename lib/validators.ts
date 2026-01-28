import { z } from 'zod';
import { BillingCycle, ClientStatus, LeadSource, LeadStatus, PackageType, PaymentStatus } from '@prisma/client';

export const clientSchema = z.object({
  businessName: z.string().min(2),
  contactPerson: z.string().min(2),
  whatsappNumber: z.string().min(6),
  email: z.string().email(),
  packageType: z.nativeEnum(PackageType),
  status: z.nativeEnum(ClientStatus),
  startDate: z.coerce.date()
});

export const leadSchema = z.object({
  clientId: z.string().cuid(),
  customerName: z.string().min(2),
  phoneNumber: z.string().min(6),
  source: z.nativeEnum(LeadSource),
  leadStatus: z.nativeEnum(LeadStatus).optional(),
  assignedAgentUserId: z.string().cuid().optional().nullable()
});

export const paymentSchema = z.object({
  clientId: z.string().cuid(),
  amount: z.number().positive(),
  currency: z.string().min(1),
  paymentStatus: z.nativeEnum(PaymentStatus),
  billingCycle: z.nativeEnum(BillingCycle),
  dueDate: z.coerce.date(),
  paidDate: z.coerce.date().optional().nullable()
});

export const serviceSchema = z.object({
  clientId: z.string().cuid(),
  serviceName: z.string().min(2),
  serviceType: z.string().min(2),
  deliveryStatus: z.string().min(2),
  goLiveDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const webhookLeadSchema = z.object({
  clientId: z.string().cuid().optional(),
  clientCode: z.string().optional(),
  customerName: z.string().min(2),
  phoneNumber: z.string().min(6),
  source: z.nativeEnum(LeadSource),
  message: z.string().min(1),
  timestamp: z.coerce.date()
}).refine((data) => data.clientId || data.clientCode, {
  message: 'clientId or clientCode is required'
});
