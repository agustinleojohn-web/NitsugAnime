import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded bg-[#18181B] border border-[#2C2C32] flex items-center justify-center text-[#7C3AED] mb-4">
        <Film className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-[#FAFAFA] mb-2">404 — Page Not Found</h1>
      <p className="text-sm text-[#A1A1AA] mb-8 leading-relaxed">
        The anime title, episode, or page you were looking for does not exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/explore">
          <Button variant="secondary" size="md" icon={<Compass className="w-4 h-4" />}>
            Browse Catalog
          </Button>
        </Link>
      </div>
    </div>
  );
};
