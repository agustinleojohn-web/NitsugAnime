import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { MEGAPLAY_ORIGIN } from '@/lib/api/config';
import { Button } from '@/components/ui/Button';

export interface AnimePlayerProps {
  embedUrl: string | null;
  animeTitle: string;
  episodeNumber: number;
  episodeTitle?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEpisodeCompleted?: () => void;
  onRetry?: () => void;
}

export const AnimePlayer: React.FC<AnimePlayerProps> = ({
  embedUrl,
  animeTitle,
  episodeNumber,
  episodeTitle,
  onTimeUpdate,
  onEpisodeCompleted,
  onRetry,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const completedRef = useRef(false);
  const handlers = useRef({ onTimeUpdate, onEpisodeCompleted });
  handlers.current = { onTimeUpdate, onEpisodeCompleted };

  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
    completedRef.current = false;
  }, [embedUrl]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== MEGAPLAY_ORIGIN) return;
      if (event.source !== iframeRef.current?.contentWindow) return;

      let data: unknown = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== 'object') return;
      const msg = data as { event?: unknown; type?: unknown; time?: unknown; duration?: unknown };

      if (msg.event === 'time' || msg.type === 'watching-log') {
        const time = Number(msg.time);
        const duration = Number(msg.duration);
        if (Number.isFinite(time) && Number.isFinite(duration) && duration > 0 && time >= 0) {
          handlers.current.onTimeUpdate?.(time, duration);
        }
      } else if (msg.event === 'complete') {
        if (!completedRef.current) {
          completedRef.current = true;
          handlers.current.onEpisodeCompleted?.();
        }
      } else if (msg.event === 'error') {
        setIsLoading(false);
        setLoadError(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fullDisplayTitle = `${animeTitle} - Ep ${episodeNumber}${episodeTitle ? `: ${episodeTitle}` : ''}`;

  if (!embedUrl) {
    return (
      <div className="w-full aspect-video bg-[#111113] border border-[#2C2C32] rounded flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-[#A78BFA] mb-3" />
        <h3 className="text-base font-bold text-[#FAFAFA] mb-1">No Stream Available</h3>
        <p className="text-xs text-[#A1A1AA] max-w-sm mb-4">
          The catalog did not provide a stream for this episode in the selected language.
        </p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} icon={<RefreshCw className="w-4 h-4" />}>
            Retry Episode
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 16:9 Player Frame */}
      <div className="relative w-full aspect-video bg-black rounded-lg border border-[#2C2C32] overflow-hidden">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-[#09090B] flex flex-col items-center justify-center p-4">
            <div className="w-10 h-10 rounded border-2 border-[#7C3AED] border-t-transparent animate-spin mb-3" />
            <p className="text-xs font-semibold text-[#A1A1AA]">Initializing video player...</p>
            <p className="text-[11px] text-[#71717A] mt-1">{fullDisplayTitle}</p>
          </div>
        )}

        {/* Error Fallback */}
        {loadError && (
          <div className="absolute inset-0 z-20 bg-[#111113] flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-10 h-10 text-[#A78BFA] mb-3" />
            <h3 className="text-base font-bold text-[#FAFAFA] mb-1">Playback Encountered an Issue</h3>
            <p className="text-xs text-[#A1A1AA] max-w-md mb-4 leading-relaxed">
              The player reported an error or failed to load. Try reloading, or pick another server below.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setLoadError(false);
                  setIsLoading(true);
                  if (iframeRef.current) iframeRef.current.src = embedUrl;
                }}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Reload Player
              </Button>

            </div>
          </div>
        )}

        {/* Native Iframe Embed */}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={fullDisplayTitle}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setLoadError(true);
          }}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="origin"
        />
      </div>

    
    </div>
  );
};
