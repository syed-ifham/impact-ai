import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Mail, 
  Users, 
  FileText, 
  Calendar, 
  LogOut, 
  Menu, 
  X,
  Leaf,
  Activity,
  BarChart3
} from 'lucide-react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
      isActive 
        ? 'bg-emerald-50 text-emerald-600' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
    }`;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 1. Left Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 flex-shrink-0 h-full bg-slate-900 text-slate-300 flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/60 justify-between shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Leaf className="w-6 h-6 text-emerald-500" />
            <span className="font-serif text-xl font-bold tracking-wide">Impact AI</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-6 pb-2 shrink-0">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
              AF
            </div>
            <div>
              <p className="text-white font-medium text-sm">Impact AI Foundation</p>
              <p className="text-xs text-slate-400 mt-0.5">NGO Account</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-500 tracking-wider mb-4 mt-2">MAIN MENU</p>
          
          <NavLink to="/dashboard" end className={navLinkClass}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>
          <NavLink to="/dashboard/email-organizer" className={navLinkClass}>
            <Mail className="w-5 h-5" />
            Inbox Organizer
          </NavLink>
          <NavLink to="/dashboard/volunteer-matcher" className={navLinkClass}>
            <Users className="w-5 h-5" />
            Volunteer Matcher
          </NavLink>
          <NavLink to="/dashboard/event-scheduler" className={navLinkClass}>
            <Calendar className="w-5 h-5" />
            Event Scheduler
          </NavLink>
          <NavLink to="/dashboard/grant-assistant" className={navLinkClass}>
            <FileText className="w-5 h-5" />
            Grant Assistant
          </NavLink>
          <NavLink to="/dashboard/impact-report" className={navLinkClass}>
            <Activity className="w-5 h-5" />
            Impact Reports
          </NavLink>
        </div>

        {/* Bottom Pinned Action */}
        <div className="p-4 border-t border-slate-800/60 shrink-0">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-left">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto flex flex-col min-w-0 bg-slate-50 relative">
        
        {/* Mobile Header (Visible only on lg-) */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-slate-900">
            <Leaf className="w-6 h-6 text-emerald-500" />
            <span className="font-serif text-lg font-bold">Impact AI</span>
          </div>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Outlet for nested routes */}
        <Outlet />

      </main>
    </div>
  );
};

export default DashboardLayout;
