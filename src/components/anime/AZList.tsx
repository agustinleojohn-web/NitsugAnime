import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export const AZList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const currentLetter = searchParams.get('letter') || 'All';

  const letters = [
    'All',
    '#',
    '0-9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <h3 className="text-sm font-extrabold text-[#FAFAFA] tracking-tight">
          A-Z List
        </h3>
        <p className="text-[11px] text-[#A1A1AA]">
          Search anime order by alphabet name A to Z
        </p>
      </div>

      {/* Letters Strip with brand purple */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {letters.map((letter) => {
          const isActive = currentLetter.toUpperCase() === letter.toUpperCase();
          const targetHref = letter === 'All' ? '/explore' : `/explore?letter=${encodeURIComponent(letter)}`;

          return (
            <Link
              key={letter}
              to={targetHref}
              className={`px-2.5 py-1 text-md font-bold rounded border transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#7C3AED] text-white border-[#8B5CF6] shadow-sm'
                  : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border-[#2C2C32] hover:bg-[#202024] hover:border-[#7C3AED]/50'
              }`}
            >
              {letter}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
