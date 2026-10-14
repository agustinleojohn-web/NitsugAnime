import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Check } from 'lucide-react';
import { NormalizedEpisode } from '@/types/anime';
import { useWatchHistory } from '@/hooks/useWatchHistory';

const RANGE = 100;

export const PlayerEpisodeList: React.FC<{
  animeId: string;
  episodes: NormalizedEpisode[];
  currentEpisodeId: string;
}> = ({ animeId, episodes, currentEpisodeId }) => {
  const { history } = useWatchHistory();
  const [find, setFind] = useState('');
  const [range, setRange] = useState(0);

  const watched = useMemo(
    () => new Set(history.filter((h) => h.animeId === animeId && h.completed).map((h) => h.episodeId)),
    [history, animeId]
  );

  const ranges = useMemo(
    () => Array.from({ length: Math.ceil(episodes.length / RANGE) }, (_, i) => i),
    [episodes.length]
  );

  const visible = useMemo(() => {
    const term = find.trim().toLowerCase();
    if (term) {
      return episodes.filter((e) => String(e.number) === term || e.title.toLowerCase().includes(term));
    }
    return ranges.length > 1 ? episodes.slice(range * RANGE, (range + 1) * RANGE) : episodes;
  }, [episodes, find, range, ranges.length]);

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="flex items-center gap-2 p-2 border-b border-[#2C2C32]">
        {ranges.length > 1 && (
          <select
            aria-label="Episode range"
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="bg-[#18181B] border border-[#2C2C32] rounded-lg text-xs text-[#FAFAFA] px-2 py-1.5 focus:outline-none focus:border-[#7C3AED]"
          >
            {ranges.map((i) => (
              <option key={i} value={i}>
                {String(i * RANGE + 1).padStart(3, '0')}-{String(Math.min((i + 1) * RANGE, episodes.length)).padStart(3, '0')}
              </option>
            ))}
          </select>
        )}
        <input
          type="search"
          value={find}
          onChange={(e) => setFind(e.target.value)}
          placeholder="Find episode"
          aria-label="Find episode by number or title"
          className="min-w-0 flex-1 bg-[#18181B] border border-[#2C2C32] rounded-lg text-xs text-[#FAFAFA] placeholder-[#71717A] px-2.5 py-1.5 focus:outline-none focus:border-[#7C3AED]"
        />
      </div>

      <ul className="overflow-y-auto flex-1 p-1.5 flex flex-col gap-1 max-h-72 lg:max-h-none">
        {visible.length === 0 && <li className="p-4 text-center text-xs text-[#71717A]">No episode matches.</li>}
        {visible.map((ep) => {
          const current = ep.id === currentEpisodeId;
          return (
            <li key={ep.id}>
              <Link
                to={`/watch/${animeId}/${ep.id}`}
                aria-current={current ? 'true' : undefined}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] ${
                  current ? 'bg-[#7C3AED] text-white font-semibold' : 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-[#FAFAFA]'
                }`}
              >
                <span className={`w-7 shrink-0 tabular-nums ${current ? 'text-white/80' : 'text-[#71717A]'}`}>{ep.number}</span>
                <span className="truncate flex-1">{ep.title}</span>
                {current ? (
                  <Play className="w-3 h-3 fill-current shrink-0" />
                ) : watched.has(ep.id) ? (
                  <Check className="w-3 h-3 text-[#10B981] shrink-0" aria-label="Watched" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
