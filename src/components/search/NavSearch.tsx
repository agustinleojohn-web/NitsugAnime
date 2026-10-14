import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { useCatalogIndex } from '@/lib/catalog/indexStore';
import { describeCoverage } from '@/components/states/IndexCoverage';
import { matchRank, norm } from '@/lib/catalog/filters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { NormalizedAnime } from '@/types/anime';

const MAX_RESULTS = 8;

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded border border-[#2C2C32] bg-[#18181B] text-[10px] font-semibold text-[#A1A1AA]">
    {children}
  </kbd>
);

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return Boolean(el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"], [role="combobox"]'));
}

export const NavSearch: React.FC = () => {
  const navigate = useNavigate();
  const uid = useId();
  const listId = `${uid}-list`;
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [active, setActive] = useState(0);
  const debounced = useDebouncedValue(term, 200);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const index = useCatalogIndex({ enabled: open });
  const { items } = index;
  const isError = index.status === 'error' && items.length === 0;

  const results = useMemo<NormalizedAnime[]>(() => {
    const q = norm(debounced);
    if (!q) return [];
    const scored: { a: NormalizedAnime; rank: number }[] = [];
    for (const a of items) {
      const rank = matchRank(a, q);
      if (rank >= 0) scored.push({ a, rank });
    }
    scored.sort((x, y) => x.rank - y.rank || (y.a.score ?? 0) - (x.a.score ?? 0));
    return scored.slice(0, MAX_RESULTS).map((x) => x.a);
  }, [debounced, items]);

  // Reset the highlight only when the query changes, not whenever the index grows or re-renders.
  useEffect(() => setActive(0), [debounced]);
  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(0, results.length - 1)));
  }, [results.length]);

  useEffect(() => {
    if (!results[active]) return;
    document.getElementById(`${uid}-opt-${results[active].id}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, results, uid]);

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    setTerm('');
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 's' || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.isComposing || e.repeat) return;
      if (e.defaultPrevented || isTypingTarget(e.target)) return;
      e.preventDefault();
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const select = (a: NormalizedAnime) => {
    close(false);
    navigate(`/watch/${a.id}`);
  };

  const submitFull = () => {
    const q = term.trim();
    if (!q) return;
    close(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length) setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length) setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active] && norm(term) === norm(debounced)) select(results[active]);
      else submitFull();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
    }
  };

  const searching = open && (index.status === 'loading' || index.status === 'idle');
  const hasQuery = Boolean(norm(debounced));

  return (
    <div ref={rootRef} className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => navigate('/explore')}
        aria-label="Open filters"
        className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg bg-[#111113] border border-[#2C2C32] text-xs font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#7C3AED]/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden sm:inline">Filter</span>
      </button>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search anime (press S)"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 h-9 px-2.5 lg:w-60 xl:w-72 rounded-lg bg-[#111113] border border-[#2C2C32] text-xs text-[#71717A] hover:border-[#7C3AED]/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
      >
        <Search className="w-4 h-4 shrink-0 text-[#A1A1AA]" />
        <span className="hidden lg:inline flex-1 text-left">Search anime...</span>
        <span className="hidden lg:inline-flex items-center gap-1.5">
          <Kbd>S</Kbd>
          <span>Quick access</span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-x-3 top-[4.25rem] z-50 md:absolute md:inset-x-auto md:right-0 md:top-0 md:w-[min(32rem,calc(100vw-2rem))] bg-[#0D0D0F] border border-[#2C2C32] rounded-lg shadow-2xl shadow-black/60 overflow-hidden">
          <div className="flex items-center gap-2.5 px-3 h-11">
            {searching ? (
              <Loader2 className="w-4 h-4 text-[#7C3AED] animate-spin shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-[#A1A1AA] shrink-0" />
            )}
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={results[active] ? `${uid}-opt-${results[active].id}` : undefined}
              aria-label="Search anime"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={onInputKey}
              placeholder="Search anime..."
              autoComplete="off"
              spellCheck={false}
              className="flex-1 min-w-0 bg-transparent text-sm text-[#FAFAFA] placeholder-[#71717A] focus:outline-none"
            />
            {term && (
              <button
                type="button"
                onClick={() => {
                  setTerm('');
                  inputRef.current?.focus();
                }}
                className="text-xs text-[#A1A1AA] hover:text-[#FAFAFA] underline underline-offset-2 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-3 border-t border-[#2C2C32] h-9 text-xs">
            <span className="text-[#FAFAFA] font-semibold border-b-2 border-[#7C3AED] h-full inline-flex items-center">Anime</span>
            <button
              type="button"
              onClick={() => {
                close(false);
                navigate('/explore');
              }}
              className="inline-flex items-center gap-1.5 text-[#A1A1AA] hover:text-[#FAFAFA] cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
            </button>
          </div>

          <div className="border-t border-[#2C2C32] max-h-[55vh] overflow-y-auto" aria-live="polite">
            {isError && (
              <div className="p-4 flex items-start gap-2 text-xs text-[#A1A1AA]">
                <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{index.error ?? 'The catalog index could not be loaded.'}</p>
                  <button type="button" onClick={() => index.retry()} className="mt-1.5 text-[#A78BFA] hover:underline cursor-pointer">
                    Retry
                  </button>
                </div>
              </div>
            )}

            {!isError && !hasQuery && (
              <p className="p-4 text-xs text-[#71717A]">Type a title, romaji or native name.</p>
            )}

            {!isError && hasQuery && results.length === 0 && (
              <p className="p-4 text-xs text-[#A1A1AA]">
                {searching
                  ? `No match yet in the ${items.length.toLocaleString()} titles indexed so far...`
                  : index.complete
                    ? `No title in the ${items.length.toLocaleString()}-title index matches "${debounced.trim()}".`
                    : `No match in the ${items.length.toLocaleString()} titles indexed, but the index is incomplete.`}
                {!searching && (
                  <>
                    {' '}
                    <button type="button" onClick={submitFull} className="text-[#A78BFA] hover:underline cursor-pointer">
                      Open full search
                    </button>
                  </>
                )}
              </p>
            )}

            {results.length > 0 && (
              <ul id={listId} role="listbox" aria-label="Search results" className="p-1.5 flex flex-col gap-0.5">
                {results.map((a, i) => (
                  <li
                    key={a.id}
                    id={`${uid}-opt-${a.id}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(a)}
                    className={`flex items-center gap-3 p-1.5 rounded-lg cursor-pointer ${i === active ? 'bg-[#7C3AED]/20 ring-1 ring-[#7C3AED]/60' : ''}`}
                  >
                    <img src={a.posterUrl} alt="" loading="lazy" className="w-9 h-12 rounded object-cover bg-[#202024] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#FAFAFA] truncate">{a.title}</p>
                      <p className="text-[11px] text-[#71717A] truncate">
                        {[a.type, a.releaseYear, a.genres.slice(0, 2).join(', ')].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 border-t border-[#2C2C32] text-[11px] text-[#71717A]">
            <span className="inline-flex items-center gap-1.5"><Kbd>↓</Kbd><Kbd>↑</Kbd> navigate</span>
            <span className="inline-flex items-center gap-1.5"><Kbd>↵</Kbd> select</span>
            <span className="inline-flex items-center gap-1.5"><Kbd>esc</Kbd> exit</span>
            {(items.length > 0 || index.status === 'loading') && (
              <span className="ml-auto text-right" title={describeCoverage(index)}>
                {index.complete
                  ? `${items.length.toLocaleString()} titles searched`
                  : index.status === 'ready' || index.status === 'error'
                    ? `Partial: ${items.length.toLocaleString()}${index.catalogTotal ? ` of ${index.catalogTotal.toLocaleString()}` : ''} titles`
                    : `Indexing ${index.loadedChunks}/${index.totalChunks || '…'}`}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
