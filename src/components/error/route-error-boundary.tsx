'use client';

import { useEffect } from 'react';
import { errorReporter } from '@/lib/errorReporter';
import { ErrorFallback } from '@/components/error/fallback';

interface RouteErrorBoundaryProps {
  error: Error | { digest?: string; message?: string };
  reset?: () => void;
}

export function RouteErrorBoundary({ error, reset }: RouteErrorBoundaryProps) {
  useEffect(() => {
    if (!error) return;

    const message = error instanceof Error ? error.message : error.message || 'Unknown route error';
    const stack = error instanceof Error ? error.stack || '' : '';

    errorReporter.reportRouteError(message, stack);
  }, [error]);

  return <ErrorFallback error={error instanceof Error ? error : undefined} />;
}
