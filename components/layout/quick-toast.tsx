'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export function QuickToast() {
  const { addToast } = useToast();

  return (
    <Button
      variant="outline"
      onClick={() =>
        addToast({
          title: 'Automation synced',
          description: 'Latest metrics have been refreshed.'
        })
      }
    >
      Trigger toast
    </Button>
  );
}
