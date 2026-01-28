import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppShell } from '@/components/layout/app-shell';
import { QuickToast } from '@/components/layout/quick-toast';

export default async function DashboardPage() {
  const user = await requireSession();
  const [activeClients, newLeadsToday, conversionsWeek, pendingPayments] = await Promise.all([
    prisma.client.count({
      where: { agencyId: user.agencyId, status: 'ACTIVE' }
    }),
    prisma.lead.count({
      where: {
        agencyId: user.agencyId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.lead.count({
      where: {
        agencyId: user.agencyId,
        leadStatus: 'CONVERTED',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.payment.count({
      where: {
        agencyId: user.agencyId,
        paymentStatus: { in: ['PENDING', 'OVERDUE'] }
      }
    })
  ]);

  const cards = [
    { title: 'Active clients', value: activeClients },
    { title: 'New leads today', value: newLeadsToday },
    { title: 'Conversions (7d)', value: conversionsWeek },
    { title: 'Pending payments', value: pendingPayments }
  ];

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex justify-end">
          <QuickToast />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-foreground">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
