import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/rbac';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ConversationsPage() {
  const user = await requireSession();
  const conversations = await prisma.conversation.findMany({
    where: { agencyId: user.agencyId },
    include: { lead: true, client: true },
    orderBy: { timestamp: 'desc' }
  });

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="rounded-xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{conversation.lead.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {conversation.client.businessName} • {conversation.messageType}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {conversation.timestamp.toLocaleString()}
                  </p>
                </div>
                <p className="mt-3 text-sm">{conversation.lastMessage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
