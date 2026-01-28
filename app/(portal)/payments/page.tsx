import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/rbac';
import { getPagination } from '@/lib/pagination';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function PortalPaymentsPage({\n  searchParams\n}: {\n  searchParams: { page?: string };\n}) {
  const user = await requireSession();
  if (!user.clientId) {
    throw new Error('Client account required');
  }
  const { page, skip, take } = getPagination(searchParams.page);
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { agencyId: user.agencyId, clientId: user.clientId },
      orderBy: { dueDate: 'asc' },
      skip,\n      take
    }),
    prisma.payment.count({ where: { agencyId: user.agencyId, clientId: user.clientId } })
  ]);
  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <AppShell variant="portal">
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
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
          <div className=\"mt-4 flex items-center justify-between text-sm text-muted-foreground\">\n            <span>\n              Page {page} of {totalPages}\n            </span>\n            <div className=\"flex gap-2\">\n              <a\n                className={`rounded-md border px-3 py-1 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}\n                href={`/portal/payments?page=${page - 1}`}\n              >\n                Previous\n              </a>\n              <a\n                className={`rounded-md border px-3 py-1 ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}\n                href={`/portal/payments?page=${page + 1}`}\n              >\n                Next\n              </a>\n            </div>\n          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
