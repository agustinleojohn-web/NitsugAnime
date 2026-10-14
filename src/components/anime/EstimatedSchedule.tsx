import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { NormalizedAnime } from '@/types/anime';

export interface EstimatedScheduleProps {
  animeList: NormalizedAnime[];
}

interface ScheduleEntry {
  time: string;
  animeId: string;
  title: string;
  episodeNumber: number;
}

export const EstimatedSchedule: React.FC<EstimatedScheduleProps> = ({ animeList }) => {
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [selectedDayOffset, setSelectedDayOffset] = useState(2); // Wednesday by default

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }) +
          ' ' +
          now.toLocaleTimeString('en-US')
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const weekDays = [
    { code: 'MON', label: 'OCT 12', full: 'Monday' },
    { code: 'TUE', label: 'OCT 13', full: 'Tuesday' },
    { code: 'WED', label: 'OCT 14', full: 'Wednesday' },
    { code: 'THU', label: 'OCT 15', full: 'Thursday' },
    { code: 'FRI', label: 'OCT 16', full: 'Friday' },
    { code: 'SAT', label: 'OCT 17', full: 'Saturday' },
    { code: 'SUN', label: 'OCT 18', full: 'Sunday' },
  ];

  const scheduledAnime: ScheduleEntry[] = React.useMemo(() => {
    if (animeList.length === 0) return [];

    const times = ['00:35', '00:45', '07:00', '10:00', '14:30', '18:00', '20:30', '21:00'];
    const entries: ScheduleEntry[] = [];

    const daySubset = animeList.slice(selectedDayOffset * 2, selectedDayOffset * 2 + times.length);
    const pool = daySubset.length > 0 ? daySubset : animeList.slice(0, times.length);

    pool.forEach((anime, idx) => {
      entries.push({
        time: times[idx % times.length],
        animeId: anime.id,
        title: anime.title,
        episodeNumber: anime.isSubCount || anime.episodeCount || 1,
      });
    });

    return entries;
  }, [animeList, selectedDayOffset]);

  const handlePrevDay = () => {
    setSelectedDayOffset((prev) => (prev > 0 ? prev - 1 : 6));
  };

  const handleNextDay = () => {
    setSelectedDayOffset((prev) => (prev < 6 ? prev + 1 : 0));
  };

  return (
    <section className="bg-[#111113] border border-[#2C2C32] rounded p-5 flex flex-col gap-5">
      {/* Schedule Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C2C32] pb-3">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-[#FAFAFA] tracking-tight">
            Estimated Schedule
          </h2>
        </div>

        {currentTimeStr && (
          <div className="text-xs text-[#A1A1AA] font-mono">
            Now: <span className="text-[#A78BFA] font-semibold">{currentTimeStr}</span>
          </div>
        )}
      </div>

      {/* Days Strip with Navigation */}
      <div className="flex items-center justify-between gap-1 border-b border-[#2C2C32] pb-2">
        <button
          type="button"
          onClick={handlePrevDay}
          aria-label="Previous day"
          className="p-1.5 rounded text-[#71717A] hover:text-white hover:bg-[#18181B] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center justify-around overflow-x-auto no-scrollbar gap-2">
          {weekDays.map((day, idx) => {
            const isActive = idx === selectedDayOffset;
            return (
              <button
                key={day.code}
                type="button"
                onClick={() => setSelectedDayOffset(idx)}
                className={`relative flex flex-col items-center py-2 px-3 rounded transition-colors cursor-pointer shrink-0 ${
                  isActive ? 'text-white font-extrabold' : 'text-[#71717A] hover:text-[#A1A1AA]'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider">{day.label}</span>
                <span className="text-base sm:text-lg font-black tracking-tight">{day.code}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-[#7C3AED] rounded" />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          aria-label="Next day"
          className="p-1.5 rounded text-[#71717A] hover:text-white hover:bg-[#18181B] transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Scheduled Items List */}
      <div className="flex flex-col divide-y divide-[#1F1F23]">
        {scheduledAnime.map((item) => (
          <div
            key={`${item.time}-${item.animeId}`}
            className="flex items-center justify-between py-3 px-2 rounded hover:bg-[#18181B] transition-colors gap-3"
          >
            {/* Time & Title */}
            <div className="flex items-center gap-4 min-w-0">
              <span className="text-xs font-mono font-bold text-[#71717A] shrink-0">
                {item.time}
              </span>

              <Link
                to={`/watch/${item.animeId}`}
                className="text-xs sm:text-sm font-semibold text-[#FAFAFA] hover:text-[#A78BFA] transition-colors truncate"
              >
                {item.title}
              </Link>
            </div>

            {/* Episode Link Button */}
            <Link
              to={`/watch/${item.animeId}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-[#A78BFA] bg-[#18181B] hover:bg-[#202024] px-3 py-1.5 rounded border border-[#2C2C32] shrink-0 transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Episode {item.episodeNumber}</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
