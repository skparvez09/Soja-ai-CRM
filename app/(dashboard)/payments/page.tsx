import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/rbac';
import { getPagination } from '@/lib/pagination';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function PaymentsPage({
  searchParams
}: {
  searchParams: { view?: string; page?: string; status?: string };
}) {
  const user = await requireSession();
  const pendingOnly = searchParams.view === 'pending';
  const validStatuses = ['PENDING', 'PAID', 'OVERDUE', 'FAILED'];
  const statusFilter = validStatuses.includes(searchParams.status ?? '')
    ? (searchParams.status as (typeof validStatuses)[number])
    : undefined;
  const { page, skip, take } = getPagination(searchParams.page);
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: {
        agencyId: user.agencyId,
        ...(pendingOnly ? { paymentStatus: { in: ['PENDING', 'OVERDUE'] } } : {}),
        ...(statusFilter ? { paymentStatus: statusFilter } : {})
      },
      include: { client: true },
      orderBy: pendingOnly ? { dueDate: 'asc' } : { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.payment.count({
      where: {
        agencyId: user.agencyId,
        ...(pendingOnly ? { paymentStatus: { in: ['PENDING', 'OVERDUE'] } } : {}),
        ...(statusFilter ? { paymentStatus: statusFilter } : {})
      }
    })
  ]);
  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              className={`rounded-full px-3 py-1 text-sm ${!pendingOnly ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              href="/payments"
            >
              All payments
            </a>
            <a
              className={`rounded-full px-3 py-1 text-sm ${pendingOnly ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              href="/payments?view=pending"
            >
              Pending payments
            </a>
            <form method="GET" className="flex items-center gap-2">
              <input type="hidden" name="view" value={searchParams.view ?? ''} />
              <select
                name="status"
                defaultValue={searchParams.status ?? ''}
                className="h-9 rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="FAILED">Failed</option>
              </select>
              <button className="h-9 rounded-md border border-input bg-white px-3 text-sm" type="submit">
                Filter
              </button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.client.businessName}</TableCell>
                  <TableCell>
                    {payment.currency} {payment.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                      {payment.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.dueDate.toDateString()}</TableCell>
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
                href={`/payments?page=${page - 1}${pendingOnly ? '&view=pending' : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
              >
                Previous
              </a>
              <a
                className={`rounded-md border px-3 py-1 ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                href={`/payments?page=${page + 1}${pendingOnly ? '&view=pending' : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
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
