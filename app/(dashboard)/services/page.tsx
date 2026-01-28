import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/rbac';
import { getPagination } from '@/lib/pagination';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function ServicesPage({\n  searchParams\n}: {\n  searchParams: { page?: string };\n}) {
  const user = await requireSession();
  const { page, skip, take } = getPagination(searchParams.page);
  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where: { agencyId: user.agencyId },
      include: { client: true },
      orderBy: { serviceName: 'asc' },
      skip,\n      take
    }),
    prisma.service.count({ where: { agencyId: user.agencyId } })
  ]);
  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Go-live</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="font-medium">{service.serviceName}</div>
                    <div className="text-xs text-muted-foreground">{service.serviceType}</div>
                  </TableCell>
                  <TableCell>{service.client.businessName}</TableCell>
                  <TableCell>{service.deliveryStatus}</TableCell>
                  <TableCell>{service.goLiveDate ? service.goLiveDate.toDateString() : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className=\"mt-4 flex items-center justify-between text-sm text-muted-foreground\">\n            <span>\n              Page {page} of {totalPages}\n            </span>\n            <div className=\"flex gap-2\">\n              <a\n                className={`rounded-md border px-3 py-1 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}\n                href={`/services?page=${page - 1}`}\n              >\n                Previous\n              </a>\n              <a\n                className={`rounded-md border px-3 py-1 ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}\n                href={`/services?page=${page + 1}`}\n              >\n                Next\n              </a>\n            </div>\n          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
