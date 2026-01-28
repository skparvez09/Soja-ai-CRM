import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/rbac';

export async function GET() {
  const user = await requireSession();
  if (!user.clientId) {
    return new Response('Unauthorized', { status: 401 });
  }
  const leads = await prisma.lead.findMany({
    where: { agencyId: user.agencyId, clientId: user.clientId },
    orderBy: { createdAt: 'desc' }
  });
  const headers = ['Lead Code', 'Customer Name', 'Phone Number', 'Source', 'Status', 'Created At'];
  const rows = leads.map((lead) => [
    lead.leadCode,
    lead.customerName,
    lead.phoneNumber,
    lead.source,
    lead.leadStatus,
    lead.createdAt.toISOString()
  ]);
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="leads.csv"'
    }
  });
}
