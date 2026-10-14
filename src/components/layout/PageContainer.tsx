import React from 'react';
import { Outlet } from 'react-router-dom';
import { ScrollManager } from './ScrollManager';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { Footer } from './Footer';

export interface PageContainerProps {
  children?: React.ReactNode;
  hideFooter?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, hideFooter = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-[#FAFAFA] antialiased">
      <ScrollManager />
      <Header />
      <main className="flex-1 container w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {children ?? <Outlet />}
      </main>
      {!hideFooter && <Footer />}
      <MobileBottomNav />
    </div>
  );
};
