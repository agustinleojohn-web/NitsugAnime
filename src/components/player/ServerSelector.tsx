import React from 'react';
import { Subtitles, Mic, Play } from 'lucide-react';
import { PlayerServer, PlayerLanguage } from '@/lib/api/client';

export interface ServerSelectorProps {
  episodeNumber: number;
  servers: Record<PlayerLanguage, PlayerServer[]>;
  activeLanguage: PlayerLanguage;
  activeServerId?: string;
  onSelect: (server: PlayerServer) => void;
}

const ROWS: { lang: PlayerLanguage; label: string; Icon: typeof Mic }[] = [
  { lang: 'sub', label: 'SUB', Icon: Subtitles },
  { lang: 'dub', label: 'DUB', Icon: Mic },
];

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  episodeNumber,
  servers,
  activeLanguage,
  activeServerId,
  onSelect,
}) => {
  const alternates = [...servers.sub, ...servers.dub].filter((s) => s.kind === 'alternate');

  const button = (server: PlayerServer, lang: PlayerLanguage, dashed = false) => {
    const active = activeLanguage === lang && activeServerId === server.id;
    return (
      <button
        key={server.id}
        type="button"
        aria-pressed={active}
        onClick={() => onSelect(server)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] ${
          active ? 'bg-[#7C3AED] text-white' : 'bg-[#18181B] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#202024]'
        } ${dashed && !active ? 'border border-dashed border-[#2C2C32]' : ''}`}
      >
        <Play className="w-3 h-3 fill-current" />
        {server.label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] bg-[#0D0D0F] border border-[#2C2C32] rounded-lg overflow-hidden">
        <div className="p-3 sm:p-4 text-center text-xs text-[#A1A1AA] leading-relaxed bg-[#111113] flex flex-col items-center justify-center">
          <p>
            You&apos;re watching <span className="text-[#A78BFA] font-semibold">Episode {episodeNumber}</span>.
          </p>
          <p className="mt-1">If the current server doesn&apos;t work, try another server beside.</p>
        </div>

        <div className="divide-y divide-dashed divide-[#2C2C32]">
          {ROWS.map(({ lang, label, Icon }) => {
            const list = servers[lang].filter((s) => s.kind === 'provider');
            return (
              <div key={lang} className="flex items-center gap-3 px-3 py-2.5 min-h-[3.25rem]">
                <div className="flex items-center gap-1.5 w-12 shrink-0 text-[11px] font-bold tracking-wider text-[#A1A1AA]">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </div>
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={`${label} servers`}>
                  {list.length === 0 && <span className="text-xs text-[#71717A]">Not available for this episode</span>}
                  {list.map((server) => button(server, lang))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {alternates.length > 0 && (
        <details className="group bg-[#0D0D0F] border border-[#2C2C32] rounded-lg text-xs">
          <summary className="cursor-pointer select-none px-3 py-2 text-[#A1A1AA] hover:text-[#FAFAFA] list-none flex items-center gap-2">
            <span className="text-[#71717A] group-open:rotate-90 transition-transform">&#9656;</span>
            Other playback routes (unverified)
          </summary>
          <div className="px-3 pb-3 flex flex-col gap-2">
            <p className="text-[11px] text-[#71717A] leading-relaxed">
              These open the same MegaPlay embed by MAL or AniList id. The provider says not every title is mapped, so they may not play. The API does not list named servers such as HD-1 or Vidstream.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ROWS.flatMap(({ lang, label }) =>
                servers[lang]
                  .filter((s) => s.kind === 'alternate')
                  .map((server) => (
                    <span key={server.id} className="inline-flex items-center gap-1">
                      <span className="text-[10px] font-bold text-[#71717A]">{label}</span>
                      {button(server, lang, true)}
                    </span>
                  ))
              )}
            </div>
          </div>
        </details>
      )}
    </div>
  );
};
