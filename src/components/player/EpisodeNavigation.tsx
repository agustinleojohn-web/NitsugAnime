import React from 'react';
import { SkipBack, SkipForward, Repeat } from 'lucide-react';

export interface EpisodeNavigationProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  autoNext: boolean;
  onToggleAutoNext: () => void;
  trailing?: React.ReactNode;
}

const btn =
  'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] disabled:opacity-40 disabled:pointer-events-none';

export const EpisodeNavigation: React.FC<EpisodeNavigationProps> = ({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  autoNext,
  onToggleAutoNext,
  trailing,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-1 bg-[#0D0D0F] border border-[#2C2C32] rounded-lg px-2 py-1">
    <div className="flex items-center gap-1 flex-wrap">
      <button
        type="button"
        role="switch"
        aria-checked={autoNext}
        onClick={onToggleAutoNext}
        className={`${btn} ${autoNext ? '!text-[#A78BFA]' : ''}`}
      >
        <Repeat className="w-3.5 h-3.5" />
        Auto Next
        <span className={`w-6 h-3.5 rounded-full relative transition-colors ${autoNext ? 'bg-[#7C3AED]' : 'bg-[#2C2C32]'}`}>
          <span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${autoNext ? 'left-3' : 'left-0.5'}`} />
        </span>
      </button>
      <button type="button" onClick={onPrevious} disabled={!hasPrevious} className={btn}>
        <SkipBack className="w-3.5 h-3.5" /> Prev
      </button>
      <button type="button" onClick={onNext} disabled={!hasNext} className={btn}>
        Next <SkipForward className="w-3.5 h-3.5" />
      </button>
    </div>
    {trailing}
  </div>
);
