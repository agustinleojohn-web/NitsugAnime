import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'sub' | 'dub' | 'score' | 'type' | 'status' | 'neutral' | 'accent';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  icon,
}) => {
  const variantStyles = {
    sub: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50',
    dub: 'bg-blue-950/80 text-blue-400 border border-blue-800/50',
    score: 'bg-amber-950/80 text-amber-400 border border-amber-800/50',
    type: 'bg-[#202024] text-[#FAFAFA] border border-[#2C2C32]',
    status: 'bg-[#18181B] text-[#A1A1AA] border border-[#2C2C32]',
    neutral: 'bg-[#18181B] text-[#A1A1AA] border border-[#2C2C32]',
    accent: 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded shrink-0 tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
