import React from 'react';
import { Loader2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { CatalogIndexState } from '@/lib/catalog/indexStore';

const fmtDate = (iso?: string) => {
  const d = iso ? new Date(iso) : undefined;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'unknown date';
};

/** Honest description of what the search/filter index currently covers. */
export function describeCoverage(s: CatalogIndexState): string {
  if (s.status === 'error' && s.indexedCount === 0) return 'The catalog index could not be loaded.';
  if (s.status !== 'ready' && s.totalChunks === 0) return 'Preparing the catalog index...';
  if (s.status !== 'ready') {
    return `Indexing ${s.loadedChunks} of ${s.totalChunks} parts · ${s.indexedCount.toLocaleString()} titles searchable so far`;
  }
  if (s.complete) {
    return `Complete index: ${s.indexedCount.toLocaleString()} of ${s.catalogTotal?.toLocaleString()} titles the API reported · generated ${fmtDate(s.generatedAt)}`;
  }
  return `Partial index: ${s.indexedCount.toLocaleString()}${s.catalogTotal ? ` of ${s.catalogTotal.toLocaleString()}` : ''} titles · generated ${fmtDate(s.generatedAt)}`;
}

export const IndexCoverage: React.FC<{ state: CatalogIndexState; onRetry: () => void; className?: string }> = ({ state, onRetry, className = '' }) => {
  const busy = state.status === 'loading' || state.status === 'idle';
  const failed = state.status === 'error';
  const incomplete = state.status === 'ready' && !state.complete;
  const tone = failed || incomplete ? 'text-[#FCA5A5]' : 'text-[#A1A1AA]';
  const Icon = busy ? Loader2 : failed || incomplete ? AlertTriangle : state.complete ? CheckCircle2 : Info;
  const pct = state.totalChunks ? Math.round((state.loadedChunks / state.totalChunks) * 100) : 0;
  return (
    <div className={`flex flex-col gap-1.5 text-xs ${className}`} aria-live="polite">
      <p className={`flex items-start gap-2 ${tone}`}>
        <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${busy ? 'animate-spin text-[#7C3AED]' : ''}`} />
        <span>
          {describeCoverage(state)}
          {incomplete && ' · The index generator could not collect every title the API reported, so a missing match is not proof the title is absent.'}
          {state.stale && state.status === 'ready' && ' · This index is older than 14 days; recent additions may be missing (the home feed still shows them).'}
          {failed && (
            <>
              {state.indexedCount > 0 && ` Showing the ${state.indexedCount.toLocaleString()} titles that did load.`}{' '}
              {state.error && <span className="text-[#71717A]">({state.error})</span>}{' '}
              <button type="button" onClick={onRetry} className="text-[#A78BFA] hover:underline cursor-pointer">
                Retry missing parts
              </button>
            </>
          )}
        </span>
      </p>
      {busy && state.totalChunks > 0 && (
        <div className="h-1 rounded-full bg-[#202024] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Indexing progress">
          <div className="h-full bg-[#7C3AED] transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
};
