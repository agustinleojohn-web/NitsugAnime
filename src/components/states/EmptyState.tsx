import React from 'react';
import { Film } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 bg-[#111113] border border-[#2C2C32] rounded max-w-md mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded bg-[#18181B] border border-[#2C2C32] flex items-center justify-center text-[#71717A] mb-4">
        {icon || <Film className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-bold text-[#FAFAFA] mb-2">{title}</h3>
      <p className="text-sm text-[#A1A1AA] mb-6 leading-relaxed">{description}</p>
      {actionText && actionHref && (
        <Link to={actionHref}>
          <Button variant="primary" size="md">
            {actionText}
          </Button>
        </Link>
      )}
      {actionText && !actionHref && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
