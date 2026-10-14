import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, Trash2, Subtitles, Mic, Play, Check, Server, Info } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { getApiBaseUrl, MEGAPLAY_BASE_URL } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';

export const SettingsPage: React.FC = () => {
  const { settings, update } = useSettings();
  const { watchlist, clear: clearWatchlist } = useWatchlist();
  const { history, clear: clearHistory } = useWatchHistory();

  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [confirmClearWatchlist, setConfirmClearWatchlist] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleClearHistory = () => {
    if (confirmClearHistory) {
      clearHistory();
      setConfirmClearHistory(false);
      showNotice('Watch history cleared successfully.');
    } else {
      setConfirmClearHistory(true);
    }
  };

  const handleClearWatchlist = () => {
    if (confirmClearWatchlist) {
      clearWatchlist();
      setConfirmClearWatchlist(false);
      showNotice('Watchlist cleared successfully.');
    } else {
      setConfirmClearWatchlist(true);
    }
  };

  const handleResetPreferences = () => {
    update({
      preferredLanguage: 'sub',
      autoNext: true,
      autoplay: false,
    });
    showNotice('Preferences reset to default values.');
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#2C2C32] pb-4">
        <div className="flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#7C3AED]" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#FAFAFA]">
            Preferences & Settings
          </h1>
        </div>
        <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
          Customize playback preferences and manage locally stored browser data.
        </p>
      </div>

      {notification && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-4 py-2.5 rounded text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Playback Preferences */}
      <section className="bg-[#111113] border border-[#2C2C32] rounded p-5 flex flex-col gap-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#A78BFA] flex items-center gap-2">
          <Play className="w-4 h-4" />
          Playback Preferences
        </h2>

        {/* Preferred Language */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C2C32] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#FAFAFA]">Preferred Audio Version</h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Default to Subtitled or English Dubbed stream when both versions are available.
            </p>
          </div>

          <div className="flex items-center bg-[#18181B] border border-[#2C2C32] rounded p-0.5">
            <button
              type="button"
              onClick={() => update({ preferredLanguage: 'sub' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                settings.preferredLanguage === 'sub'
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              <Subtitles className="w-3.5 h-3.5" />
              <span>Subtitles</span>
            </button>
            <button
              type="button"
              onClick={() => update({ preferredLanguage: 'dub' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                settings.preferredLanguage === 'dub'
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Dubbed</span>
            </button>
          </div>
        </div>

        {/* Auto Next */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C2C32] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#FAFAFA]">Auto-Next Episode</h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Automatically advance to the next available episode upon verified completion.
            </p>
          </div>

          <button
            type="button"
            onClick={() => update({ autoNext: !settings.autoNext })}
            className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors cursor-pointer ${
              settings.autoNext
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                : 'bg-[#18181B] text-[#71717A] border-[#2C2C32]'
            }`}
          >
            {settings.autoNext ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Reset button */}
        <div className="pt-1">
          <Button variant="ghost" size="sm" onClick={handleResetPreferences}>
            Reset Playback Defaults
          </Button>
        </div>
      </section>

      {/* Local Storage & Privacy */}
      <section className="bg-[#111113] border border-[#2C2C32] rounded p-5 flex flex-col gap-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#A78BFA] flex items-center gap-2">
          <Database className="w-4 h-4" />
          Local Storage & Privacy
        </h2>

        <div className="bg-[#18181B] border border-[#2C2C32] rounded p-3 text-xs text-[#A1A1AA] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            NitsugAnime stores all your watchlist bookmarks and episode watch progress entirely in your browser&apos;s LocalStorage. No account is required and no telemetry or personal tracking data is shared with third parties.
          </p>
        </div>

        {/* Watchlist management */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C2C32] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#FAFAFA]">Saved Watchlist</h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Currently holding <span className="font-bold text-[#FAFAFA]">{watchlist.length}</span> saved titles.
            </p>
          </div>

          {confirmClearWatchlist ? (
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={handleClearWatchlist}>
                Confirm Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmClearWatchlist(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearWatchlist}
              disabled={watchlist.length === 0}
              icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
            >
              Clear Watchlist
            </Button>
          )}
        </div>

        {/* History management */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#FAFAFA]">Watch History</h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Currently holding <span className="font-bold text-[#FAFAFA]">{history.length}</span> watched episode entries.
            </p>
          </div>

          {confirmClearHistory ? (
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={handleClearHistory}>
                Confirm Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmClearHistory(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearHistory}
              disabled={history.length === 0}
              icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
            >
              Clear History
            </Button>
          )}
        </div>
      </section>

      {/* API & Provider Information */}
      <section className="bg-[#111113] border border-[#2C2C32] rounded p-5 flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#A78BFA] flex items-center gap-2">
          <Server className="w-4 h-4" />
          API & Service Architecture
        </h2>

        <div className="text-xs text-[#A1A1AA] flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-[#2C2C32] py-1.5">
            <span className="text-[#71717A]">Catalog API Base</span>
            <code className="text-[#FAFAFA] font-mono bg-[#18181B] px-2 py-0.5 rounded border border-[#2C2C32]">
              {getApiBaseUrl()}
            </code>
          </div>

          <div className="flex items-center justify-between border-b border-[#2C2C32] py-1.5">
            <span className="text-[#71717A]">Embed Player Origin</span>
            <code className="text-[#FAFAFA] font-mono bg-[#18181B] px-2 py-0.5 rounded border border-[#2C2C32]">
              {MEGAPLAY_BASE_URL}
            </code>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-[#71717A]">Catalog Source</span>
            <span className="text-[#FAFAFA] font-medium">Anikoto Video Catalog (9,000+ series)</span>
          </div>
        </div>

        <div className="bg-[#18181B] border border-[#2C2C32] rounded p-3 text-[11px] text-[#71717A] mt-2 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Video streams are hosted and served directly by the MegaPlay video provider. Availability of specific streams is subject to the provider&apos;s server status and copyright enforcement.
          </p>
        </div>
      </section>
    </div>
  );
};
