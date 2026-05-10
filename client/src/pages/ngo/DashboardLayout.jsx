import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X, Leaf } from 'lucide-react';
import NGOProfileCard from '../../components/ngo/NGOProfileCard';

/**
 * Pure layout shell — sidebar open/close state only.
 * All nav links, profile info, and sign-out live in NGOProfileCard.
 */
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 flex-shrink-0 h-full bg-slate-900 text-slate-300 flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/60 justify-between shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Leaf className="w-6 h-6 text-emerald-500" />
            <span className="font-serif text-xl font-bold tracking-wide">Impact AI</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile card + nav + sign-out — all in one component */}
        <div className="flex-1 flex flex-col min-h-0">
          <NGOProfileCard />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 h-full overflow-y-auto flex flex-col min-w-0 bg-slate-50 relative">

        {/* Mobile header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-slate-900">
            <Leaf className="w-6 h-6 text-emerald-500" />
            <span className="font-serif text-lg font-bold">Impact AI</span>
          </div>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
