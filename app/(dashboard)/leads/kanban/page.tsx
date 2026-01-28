import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/rbac';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const columns = ['NEW', 'FOLLOW_UP', 'CONVERTED', 'LOST'] as const;

export default async function LeadsKanbanPage() {
  const user = await requireSession();
  const leads = await prisma.lead.findMany({
    where: { agencyId: user.agencyId },
    orderBy: { createdAt: 'desc' },
    include: { client: true }
  });

  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="grid gap-4 lg:grid-cols-4">
          {columns.map((column) => (
            <Card key={column}>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">{column}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {leads
                  .filter((lead) => lead.leadStatus === column)
                  .map((lead) => (
                    <div key={lead.id} className="rounded-lg border border-border bg-white p-3">
                      <p className="text-sm font-semibold">{lead.customerName}</p>
                      <p className="text-xs text-muted-foreground">{lead.client.businessName}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
