import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 p-8">
      <div className="max-w-xl space-y-6 rounded-3xl bg-white p-10 shadow-lg">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Soja AI CRM
          </p>
          <h1 className="text-3xl font-semibold text-foreground">
            Multi-tenant AI Automation Agency Hub
          </h1>
          <p className="text-muted-foreground">
            Manage clients, leads, conversations, services, and payments with secure
            tenant isolation and automation tracking.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/portal">Client Portal</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
