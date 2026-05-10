import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, ArrowRight, FileScan } from 'lucide-react';
import WelcomeBanner  from '../../components/ngo/WelcomeBanner';
import NGOStatsGrid   from '../../components/ngo/NGOStatsGrid';
import RecentActivity from '../../components/ngo/RecentActivity';

const QUICK_ACTIONS = [
  { label: 'Post New Task',    icon: Plus,  color: 'bg-purple-50 text-purple-500', to: '/dashboard/post-task'     },
  { label: 'Find Volunteers',   icon: Users,  color: 'bg-emerald-50 text-emerald-500',to: '/dashboard/volunteer-matcher'   },
  { label: 'Scan Document',     icon: FileScan, color: 'bg-indigo-50 text-indigo-500', to: '/dashboard/scan-document' },
];

const DashboardHome = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">

      {/* Welcome banner — live NGO name + counts */}
      <WelcomeBanner />

      {/* Stats grid — live Firestore counts */}
      <NGOStatsGrid />

      {/* Bottom split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

        {/* Recent task activity */}
        <RecentActivity />

        {/* Right column */}
        <div className="lg:col-span-1 flex flex-col gap-6">

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2">
            <h3 className="px-4 pt-4 pb-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Actions</h3>
            <div className="space-y-1">
              {QUICK_ACTIONS.map(({ label, icon: Icon, color, to }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-all group border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Heatmap teaser */}
          <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-800 bg-slate-900 group">
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1526976663112-00fe81ce814d?auto=format&fit=crop&q=80&w=1000"
                alt="Community map"
                className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            </div>
            <div className="relative z-10 p-6 flex flex-col min-h-[220px] justify-between">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold tracking-wider uppercase">Live Tool</span>
              </div>
              <div>
                <h3 className="text-white font-serif text-xl font-bold leading-snug mb-4">
                  LIVE HEATMAP:<br />View needs across your region
                </h3>
                <button 
                  onClick={() => navigate('/dashboard/live-map')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Open Map <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
