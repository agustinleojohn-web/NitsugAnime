import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionText?: string;
  icon?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionHref,
  actionText = 'View all',
  icon,
}) => {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#7C3AED]">{icon}</span>}
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-[#FAFAFA]">{title}</h2>
        </div>
        {subtitle && <p className="text-xs text-[#A1A1AA] mt-0.5">{subtitle}</p>}
      </div>

      {actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#A78BFA] hover:text-[#C4B5FD] transition-colors group"
        >
          <span>{actionText}</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
};
