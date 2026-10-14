import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { History, Trash2, Play, CheckCircle2, Clock } from 'lucide-react';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/states/EmptyState';

export const HistoryPage: React.FC = () => {
  const { history, remove, clear } = useWatchHistory();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearAll = () => {
    if (confirmClear) {
      clear();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2C32] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-[#7C3AED]" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
              Watch History
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
            {history.length} {history.length === 1 ? 'episode' : 'episodes'} tracked locally
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400 font-semibold">Clear entire history?</span>
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
                Clear History
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      {history.length === 0 ? (
        <EmptyState
          icon={<History className="w-8 h-8 text-[#7C3AED]" />}
          title="No watch history yet"
          description="Episodes you watch will appear here so you can easily resume and keep track of your progress."
          actionText="Discover Anime"
          actionHref="/"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((item) => (
            <div
              key={`${item.animeId}-${item.episodeId}`}
              className="flex items-center justify-between p-3 sm:p-4 bg-[#111113] border border-[#2C2C32] rounded hover:border-[#7C3AED]/50 transition-colors gap-3"
            >
              {/* Left Details */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <Link
                  to={`/watch/${item.animeId}/${item.episodeId}`}
                  className="relative aspect-video w-20 sm:w-28 bg-[#18181B] rounded overflow-hidden shrink-0 group border border-[#2C2C32]"
                >
                  <img
                    src={item.posterUrl}
                    alt={item.animeTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 fill-white text-white" />
                  </div>
                </Link>

                <div className="min-w-0">
                  <Link
                    to={`/watch/${item.animeId}`}
                    className="text-xs sm:text-sm font-bold text-[#FAFAFA] hover:text-[#A78BFA] transition-colors truncate block"
                  >
                    {item.animeTitle}
                  </Link>

                  <p className="text-xs text-[#A1A1AA] mt-0.5 truncate">
                    Episode {item.episodeNumber} {item.episodeTitle ? `&bull; ${item.episodeTitle}` : ''}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-[#71717A] mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(item.lastWatchedAt)}
                    </span>
                    <span>&bull;</span>
                    <span className="uppercase font-semibold text-[#A1A1AA]">{item.selectedLanguage}</span>
                    {item.completed && (
                      <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
                        &bull; <CheckCircle2 className="w-3 h-3" /> Finished
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/watch/${item.animeId}/${item.episodeId}`}>
                  <Button variant="primary" size="sm" icon={<Play className="w-3.5 h-3.5 fill-current" />}>
                    <span className="hidden sm:inline">Resume</span>
                  </Button>
                </Link>

                <button
                  type="button"
                  onClick={() => remove(item.animeId, item.episodeId)}
                  aria-label="Remove episode from history"
                  className="p-2 rounded text-[#71717A] hover:text-red-400 hover:bg-[#18181B] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
