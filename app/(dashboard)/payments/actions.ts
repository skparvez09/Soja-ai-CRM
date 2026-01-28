'use server';

import { prisma } from '@/lib/db';
import { logAutomationEvent } from '@/lib/events';
import { requireSession, assertRole, agencyWhere } from '@/lib/rbac';
import { paymentSchema } from '@/lib/validators';

export async function createPayment(formData: unknown) {
  const user = await requireSession();
  assertRole(user, ['OWNER', 'ADMIN', 'EDITOR']);
  const data = paymentSchema.parse(formData);
  const payment = await prisma.payment.create({
    data: {
      ...data,
      agencyId: user.agencyId!
    }
  });
  await logAutomationEvent({
    agencyId: user.agencyId!,
    clientId: payment.clientId,
    eventType: 'PAYMENT_CREATED',
    triggerTable: 'Payment',
    triggerRecordId: payment.id,
    relatedClientId: payment.clientId,
    status: 'SUCCESS',
    detailsJson: { amount: payment.amount, status: payment.paymentStatus }
  });
  return payment;
}

export async function updatePayment(paymentId: string, formData: unknown) {
  const user = await requireSession();
  assertRole(user, ['OWNER', 'ADMIN', 'EDITOR']);
  const data = paymentSchema.partial({ clientId: true }).parse(formData);
  const payment = await prisma.payment.update({
    where: { id: paymentId, ...agencyWhere(user) },
    data
  });
  await logAutomationEvent({
    agencyId: user.agencyId!,
    clientId: payment.clientId,
    eventType: 'PAYMENT_UPDATED',
    triggerTable: 'Payment',
    triggerRecordId: payment.id,
    relatedClientId: payment.clientId,
    status: 'SUCCESS',
    detailsJson: { amount: payment.amount, status: payment.paymentStatus }
  });
  return payment;
}

export async function deletePayment(paymentId: string) {
  const user = await requireSession();
  assertRole(user, ['OWNER', 'ADMIN']);
  const payment = await prisma.payment.delete({
    where: { id: paymentId, ...agencyWhere(user) }
  });
  await logAutomationEvent({
    agencyId: user.agencyId!,
    clientId: payment.clientId,
    eventType: 'PAYMENT_DELETED',
    triggerTable: 'Payment',
    triggerRecordId: payment.id,
    relatedClientId: payment.clientId,
    status: 'SUCCESS',
    detailsJson: { amount: payment.amount, status: payment.paymentStatus }
  });
  return payment;
}
