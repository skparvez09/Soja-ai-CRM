import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/rbac';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

export default async function AutomationLogsPage({
  searchParams
}: {
  searchParams: { status?: string; eventType?: string };
}) {
  const user = await requireSession();
  const logs = await prisma.automationLog.findMany({
    where: {
      agencyId: user.agencyId,
      ...(searchParams.status ? { status: searchParams.status } : {}),
      ...(searchParams.eventType
        ? { eventType: { contains: searchParams.eventType, mode: 'insensitive' } }
        : {})
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Automation Logs</CardTitle>
          <form className="mt-4 flex flex-wrap gap-3" method="GET">
            <Input name="eventType" placeholder="Filter by event" defaultValue={searchParams.eventType} />
            <Input name="status" placeholder="Status" defaultValue={searchParams.status} />
          </form>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Triggered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="font-medium">{log.eventType}</div>
                    <div className="text-xs text-muted-foreground">{log.eventId}</div>
                  </TableCell>
                  <TableCell>{log.status}</TableCell>
                  <TableCell>{log.createdAt.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
