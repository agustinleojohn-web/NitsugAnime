import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

interface Props {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
  wide?: boolean;
  emptyText?: string;
  className?: string;
}

export const FilterDropdown: React.FC<Props> = ({
  label, options, selected, onChange, multi = false, wide = false, emptyText = 'No options', className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggleOpen = () => {
    if (!open && wide && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const panelWidth = Math.min(544, window.innerWidth - 32);
      setAlignRight(rect.left + panelWidth > window.innerWidth - 16 && rect.right - panelWidth >= 16);
    }
    setOpen((o) => !o);
  };

  const toggleValue = (value: string) => {
    if (multi) {
      onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
    } else {
      onChange(selected[0] === value ? [] : [value]);
      setOpen(false);
    }
  };

  const summary =
    selected.length === 0
      ? label
      : multi
        ? selected.length === 1 ? options.find((o) => o.value === selected[0])?.label ?? selected[0] : `${label} (${selected.length})`
        : options.find((o) => o.value === selected[0])?.label ?? selected[0];

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={toggleOpen}
        className={`w-full h-9 flex items-center justify-between gap-2 px-3 rounded-lg border text-[13px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] ${
          open ? 'bg-[#18181B] border-[#7C3AED]' : 'bg-[#111113] border-[#2C2C32] hover:border-[#3F3F46]'
        } ${selected.length ? 'text-[#FAFAFA]' : 'text-[#A1A1AA]'}`}
      >
        <span className="truncate">{summary}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-[#71717A] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 sm:hidden" aria-hidden onClick={() => setOpen(false)} />
          <div
            id={panelId}
            className={`z-50 flex flex-col bg-[#111113] border border-[#2C2C32] rounded-lg shadow-2xl shadow-black/60
              fixed inset-x-3 bottom-3 max-h-[70vh]
              sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:mt-1 sm:max-h-80
              ${alignRight ? 'sm:right-0' : 'sm:left-0'}
              ${wide ? 'sm:w-[34rem] sm:max-w-[calc(100vw-2rem)]' : 'sm:w-full sm:min-w-[11rem]'}`}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#2C2C32] text-xs">
              <span className="font-semibold text-[#FAFAFA]">
                {label}
                {multi && selected.length > 0 && <span className="text-[#A78BFA]"> · {selected.length} selected</span>}
              </span>
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={() => onChange([])}
                className="text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                Clear all
              </button>
            </div>
            <div
              role="listbox"
              aria-multiselectable={multi}
              aria-label={label}
              className={`overflow-y-auto p-1.5 ${wide ? 'grid grid-cols-2 md:grid-cols-3 gap-x-1' : 'flex flex-col'}`}
            >
              {options.length === 0 && <p className="px-2 py-3 text-xs text-[#71717A]">{emptyText}</p>}
              {options.map((o) => {
                const on = selected.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => toggleValue(o.value)}
                    className="flex items-center gap-2.5 px-2 py-2.5 sm:py-1.5 rounded-lg text-left text-[13px] text-[#D4D4D8] hover:bg-[#18181B] hover:text-white cursor-pointer min-w-0"
                  >
                    {multi ? (
                      <span className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center ${on ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-[#3F3F46] bg-[#18181B]'}`}>
                        {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </span>
                    ) : (
                      <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${on ? 'bg-[#7C3AED]' : 'bg-transparent'}`} />
                    )}
                    <span className={`truncate ${on ? 'text-[#FAFAFA] font-semibold' : ''}`}>{o.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
