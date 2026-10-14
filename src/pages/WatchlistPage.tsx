import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Play, Compass, Star } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/states/EmptyState';

export const WatchlistPage: React.FC = () => {
  const { watchlist, remove, clear } = useWatchlist();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearAll = () => {
    if (confirmClear) {
      clear();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2C32] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[#7C3AED]" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
              My Watchlist
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
            {watchlist.length} {watchlist.length === 1 ? 'anime' : 'animes'} saved locally on this device
          </p>
        </div>

        {watchlist.length > 0 && (
          <div className="flex items-center gap-2">
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400 font-semibold">Clear all saved titles?</span>
                <Button variant="danger" size="sm" onClick={handleClearAll}>
                  Yes, Clear All
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearAll}
                icon={<Trash2 className="w-4 h-4 text-red-400" />}
              >
                Clear Watchlist
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      {watchlist.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-8 h-8 text-[#7C3AED]" />}
          title="Your watchlist is empty"
          description="Explore our anime catalog and click the bookmark icon on any poster to save anime to your personal watchlist."
          actionText="Explore Anime"
          actionHref="/explore"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {watchlist.map((item) => (
            <div
              key={item.animeId}
              className="group relative flex flex-col bg-[#111113] rounded border border-[#2C2C32] overflow-hidden hover:border-[#7C3AED]/70 transition-all hover:-translate-y-1"
            >
              <Link to={`/watch/${item.animeId}`} className="block relative aspect-[3/4] w-full bg-[#18181B] overflow-hidden">
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-black/30 pointer-events-none" />

                {item.type && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="type" className="text-[10px]">
                      {item.type}
                    </Badge>
                  </div>
                )}

                {item.scoreFormatted && (
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="score" className="text-[10px]" icon={<Star className="w-2.5 h-2.5 fill-current" />}>
                      {item.scoreFormatted}
                    </Badge>
                  </div>
                )}

                {/* Hover Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded bg-[#7C3AED] text-white flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </Link>

              <div className="p-2.5 flex flex-col justify-between flex-1 gap-2">
                <Link to={`/watch/${item.animeId}`}>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#FAFAFA] line-clamp-2 hover:text-[#A78BFA] transition-colors">
                    {item.title}
                  </h3>
                </Link>

                <div className="flex items-center justify-between pt-1 border-t border-[#2C2C32]">
                  <Link
                    to={`/watch/${item.animeId}`}
                    className="text-[11px] font-semibold text-[#A78BFA] hover:underline"
                  >
                    View Series
                  </Link>

                  <button
                    type="button"
                    onClick={() => remove(item.animeId)}
                    aria-label={`Remove ${item.title} from watchlist`}
                    className="p-1 rounded text-[#71717A] hover:text-red-400 hover:bg-[#18181B] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
