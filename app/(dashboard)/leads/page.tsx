import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/rbac';
import { getPagination } from '@/lib/pagination';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function getLeadFilters(view?: string, startDate?: string, endDate?: string) {
  const dateRange =
    startDate && endDate
      ? {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
      : {};
  if (view === 'daily') {
    return {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    };
  }
  if (view === 'converted') {
    return { leadStatus: 'CONVERTED' };
  }
  return dateRange;
}

export default async function LeadsPage({
  searchParams
}: {
  searchParams: { view?: string; page?: string; start?: string; end?: string };
}) {
  const user = await requireSession();
  const filters = getLeadFilters(searchParams.view, searchParams.start, searchParams.end);
  const { page, skip, take } = getPagination(searchParams.page);

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where: {
        agencyId: user.agencyId,
        ...filters
      },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.lead.count({
      where: {
        agencyId: user.agencyId,
        ...filters
      }
    })
  ]);
  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              className={`rounded-full px-3 py-1 text-sm ${!searchParams.view ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              href="/leads"
            >
              All leads
            </a>
            <a
              className={`rounded-full px-3 py-1 text-sm ${searchParams.view === 'daily' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              href="/leads?view=daily"
            >
              Daily leads
            </a>
            <a
              className={`rounded-full px-3 py-1 text-sm ${searchParams.view === 'converted' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              href="/leads?view=converted"
            >
              Converted leads
            </a>
            <form className="flex flex-wrap gap-2" method="GET">
              <input type="hidden" name="view" value={searchParams.view ?? ''} />
              <input
                type="date"
                name="start"
                className="h-9 rounded-md border border-input bg-white px-3 text-sm"
                defaultValue={searchParams.start}
              />
              <input
                type="date"
                name="end"
                className="h-9 rounded-md border border-input bg-white px-3 text-sm"
                defaultValue={searchParams.end}
              />
              <button className="h-9 rounded-md border border-input bg-white px-3 text-sm" type="submit">
                Apply
              </button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="font-medium">{lead.customerName}</div>
                    <div className="text-xs text-muted-foreground">{lead.leadCode}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{lead.client.businessName}</div>
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
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <a
                className={`rounded-md border px-3 py-1 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                href={`/leads?page=${page - 1}${searchParams.view ? `&view=${searchParams.view}` : ''}${searchParams.start ? `&start=${searchParams.start}` : ''}${searchParams.end ? `&end=${searchParams.end}` : ''}`}
              >
                Previous
              </a>
              <a
                className={`rounded-md border px-3 py-1 ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                href={`/leads?page=${page + 1}${searchParams.view ? `&view=${searchParams.view}` : ''}${searchParams.start ? `&start=${searchParams.start}` : ''}${searchParams.end ? `&end=${searchParams.end}` : ''}`}
              >
                Next
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
