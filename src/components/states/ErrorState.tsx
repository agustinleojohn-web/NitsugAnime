import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ApiError, getRateLimitRetryAt } from '@/lib/api/client';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  /** Pass the caught error so rate-limit errors can show the real retry window. */
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}

function useSecondsUntil(retryAt: number | undefined): number {
  const compute = () => (retryAt ? Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)) : 0);
  const [secs, setSecs] = useState(compute);
  useEffect(() => {
    setSecs(compute());
    if (!retryAt) return;
    const id = setInterval(() => {
      const next = compute();
      setSecs(next);
      if (next === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryAt]);
  return secs;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load content',
  message,
  error,
  onRetry,
  className = '',
}) => {
  const rateLimited = error instanceof ApiError && error.isRateLimit;
  const retryAt = rateLimited ? Math.max(error.retryAt ?? 0, getRateLimitRetryAt()) || undefined : undefined;
  const wait = useSecondsUntil(retryAt);
  const text =
    message ??
    (error instanceof Error
      ? error.message
      : 'Unable to connect to the anime catalog service. Please check your network or try again.');

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-8 bg-[#111113] border border-[#2C2C32] rounded-lg max-w-md mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-[#FAFAFA] mb-2">{title}</h3>
      <p className="text-sm text-[#A1A1AA] mb-2 leading-relaxed">{text}</p>
      {rateLimited && (
        <p className="text-xs text-[#71717A] mb-4">
          {wait > 0
            ? `Requests are paused for ${wait}s. Nothing is retried automatically.`
            : 'The wait window has passed. You can retry now.'}
        </p>
      )}
      {!rateLimited && <div className="mb-4" />}
      {onRetry && (
        <Button
          variant="secondary"
          size="md"
          onClick={onRetry}
          disabled={wait > 0}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          {wait > 0 ? `Retry in ${wait}s` : 'Retry'}
        </Button>
      )}
    </div>
  );
};
