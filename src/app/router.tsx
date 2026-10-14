import React from 'react';
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { HomePage } from '@/pages/HomePage';
import { ExplorePage } from '@/pages/ExplorePage';
import { SearchPage } from '@/pages/SearchPage';
import { WatchPage } from '@/pages/WatchPage';
import { WatchlistPage } from '@/pages/WatchlistPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const LegacyAnimeRedirect: React.FC = () => {
  const { animeId } = useParams();
  return <Navigate to={`/watch/${animeId}`} replace />;
};

// One persistent layout route: header, footer and ScrollManager stay mounted across navigations.
export const router = createBrowserRouter([
  {
    element: <PageContainer />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/explore', element: <ExplorePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/anime/:animeId', element: <LegacyAnimeRedirect /> },
      { path: '/watch/:animeId', element: <WatchPage /> },
      { path: '/watch/:animeId/:episodeId', element: <WatchPage /> },
      { path: '/watchlist', element: <WatchlistPage /> },
      { path: '/history', element: <HistoryPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
