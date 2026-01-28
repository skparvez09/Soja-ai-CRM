import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/rbac';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PortalPage() {
  const user = await requireSession();
  if (!user.clientId) {
    throw new Error('Client account required');
  }
  const [leadCount, paymentCount, serviceCount] = await Promise.all([
    prisma.lead.count({ where: { agencyId: user.agencyId, clientId: user.clientId } }),
    prisma.payment.count({ where: { agencyId: user.agencyId, clientId: user.clientId } }),
    prisma.service.count({ where: { agencyId: user.agencyId, clientId: user.clientId } })
  ]);

  const cards = [
    { title: 'Leads', value: leadCount },
    { title: 'Payments', value: paymentCount },
    { title: 'Services', value: serviceCount }
  ];

  return (
    <AppShell variant="portal">
      <div className="grid gap-4 md:grid-cols-3">
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
    </AppShell>
  );
}
