import Link from 'next/link';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/rbac';
import { getPagination } from '@/lib/pagination';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default async function PortalLeadsPage({\n  searchParams\n}: {\n  searchParams: { page?: string };\n}) {
  const user = await requireSession();
  if (!user.clientId) {
    throw new Error('Client account required');
  }
  const { page, skip, take } = getPagination(searchParams.page);
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where: { agencyId: user.agencyId, clientId: user.clientId },
      orderBy: { createdAt: 'desc' },
      skip,\n      take
    }),
    prisma.lead.count({ where: { agencyId: user.agencyId, clientId: user.clientId } })
  ]);
  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <AppShell variant="portal">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leads</CardTitle>
            <Button variant="outline" asChild>
              <Link href="/portal/leads/export">Export CSV</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="font-medium">{lead.customerName}</div>
                    <div className="text-xs text-muted-foreground">{lead.phoneNumber}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={lead.leadStatus === 'CONVERTED' ? 'default' : 'secondary'}>
                      {lead.leadStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className=\"mt-4 flex items-center justify-between text-sm text-muted-foreground\">\n            <span>\n              Page {page} of {totalPages}\n            </span>\n            <div className=\"flex gap-2\">\n              <a\n                className={`rounded-md border px-3 py-1 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}\n                href={`/portal/leads?page=${page - 1}`}\n              >\n                Previous\n              </a>\n              <a\n                className={`rounded-md border px-3 py-1 ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}\n                href={`/portal/leads?page=${page + 1}`}\n              >\n                Next\n              </a>\n            </div>\n          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
