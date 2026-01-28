import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const dashboardLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/clients', label: 'Clients' },
  { href: '/leads', label: 'Leads' },
  { href: '/leads/kanban', label: 'Kanban' },
  { href: '/conversations', label: 'Conversations' },
  { href: '/services', label: 'Services' },
  { href: '/payments', label: 'Payments' },
  { href: '/automation-logs', label: 'Automation Logs' }
];

const portalLinks = [
  { href: '/portal', label: 'Overview' },
  { href: '/portal/leads', label: 'Leads' },
  { href: '/portal/payments', label: 'Payments' },
  { href: '/portal/services', label: 'Services' }
];

interface AppShellProps {
  children: React.ReactNode;
  variant?: 'dashboard' | 'portal';
}

export function AppShell({ children, variant = 'dashboard' }: AppShellProps) {
  const links = variant === 'dashboard' ? dashboardLinks : portalLinks;

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Soja AI CRM
            </p>
            <h1 className="text-xl font-semibold text-foreground">
              {variant === 'dashboard' ? 'Agency Command Center' : 'Client Portal'}
            </h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
        <aside className="hidden w-56 flex-shrink-0 flex-col gap-2 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white hover:text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
