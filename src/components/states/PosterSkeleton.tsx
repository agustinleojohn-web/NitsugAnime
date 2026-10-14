import React from 'react';

export const PosterSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      <div className="relative aspect-[3/4] w-full bg-[#18181B] rounded border border-[#2C2C32] overflow-hidden" />
      <div className="h-4 bg-[#202024] rounded w-4/5" />
      <div className="h-3 bg-[#18181B] rounded w-1/2" />
    </div>
  );
};

export const PosterSkeletonGrid: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PosterSkeleton key={i} />
      ))}
    </div>
  );
};
