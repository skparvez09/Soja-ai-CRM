import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/rbac';
import { getPagination } from '@/lib/pagination';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

export default async function ClientsPage({
  searchParams
}: {
  searchParams: { status?: string; query?: string; page?: string };
}) {
  const user = await requireSession();
  const statusFilter = searchParams.status === 'ACTIVE' ? 'ACTIVE' : undefined;
  const query = searchParams.query ?? '';
  const { page, skip, take } = getPagination(searchParams.page);

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where: {
        agencyId: user.agencyId,
        ...(statusFilter ? { status: statusFilter } : {}),
      ...(query
        ? {
            OR: [
              { businessName: { contains: query, mode: 'insensitive' } },
              { contactPerson: { contains: query, mode: 'insensitive' } }
            ]
          }
        : {})
    },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.client.count({
      where: {
        agencyId: user.agencyId,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(query
          ? {
              OR: [
                { businessName: { contains: query, mode: 'insensitive' } },
                { contactPerson: { contains: query, mode: 'insensitive' } }
              ]
            }
          : {})
      }
    })
  ]);
  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <AppShell>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                className={`rounded-full px-3 py-1 text-sm ${statusFilter ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}
                href="/clients"
              >
                All
              </a>
              <a
                className={`rounded-full px-3 py-1 text-sm ${statusFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                href="/clients?status=ACTIVE"
              >
                Active clients
              </a>
              <Input
                name="query"
                defaultValue={query}
                placeholder="Search clients"
                className="max-w-xs"
                form="client-search"
              />
              <form id="client-search" method="GET" className="hidden">
                <input name="status" defaultValue={statusFilter ?? ''} />
              </form>
            </div>
          </CardHeader>
          <CardContent>
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-medium">{client.businessName}</div>
                      <div className="text-xs text-muted-foreground">{client.clientCode}</div>
                    </TableCell>
                    <TableCell>{client.packageType}</TableCell>
                    <TableCell>
                      <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{client.contactPerson}</div>
                      <div className="text-xs text-muted-foreground">{client.email}</div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <a
                className={`rounded-md border px-3 py-1 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                href={`/clients?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ''}${query ? `&query=${query}` : ''}`}
              >
                Previous
              </a>
              <a
                className={`rounded-md border px-3 py-1 ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                href={`/clients?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ''}${query ? `&query=${query}` : ''}`}
              >
                Next
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </AppShell>
  );
}
