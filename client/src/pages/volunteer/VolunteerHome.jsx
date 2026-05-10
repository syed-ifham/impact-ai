import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { ArrowRight, Sparkles, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import VolunteerNav    from '../../components/volunteer/VolunteerNav';
import StatsRow        from '../../components/volunteer/StatsRow';
import TaskFeed        from '../../components/volunteer/TaskFeed';
import ProfileWidget   from '../../components/volunteer/ProfileWidget';
import ImpactWidget    from '../../components/volunteer/ImpactWidget';

const VolunteerHome = () => {
  const { userData } = useAuth();
  const username = userData?.fullName || 'Volunteer';

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">

      <VolunteerNav />

      <main className="max-w-6xl mx-auto px-4 mt-6">

        {/* ── Welcome Banner ── */}
        <div className="bg-slate-900 rounded-2xl p-8 mb-6 relative overflow-hidden shadow-md group cursor-pointer">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-slate-900/75 mix-blend-multiply pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full mb-4">
              • Volunteer Dashboard
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
              Welcome back, {username}! 🦸‍♂️
            </h1>
            <p className="text-slate-300 text-sm">Your community needs you. New tasks available.</p>
          </div>
        </div>

        {/* ── Stats Row (live from Firestore) ── */}
        <StatsRow />

        {/* ── AI Promotion Banner ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-purple-900 to-slate-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl group flex flex-col md:flex-row items-center justify-between gap-8 border border-indigo-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-30 -translate-y-1/2 translate-x-1/3 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-20 translate-y-1/2 -translate-x-1/3 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />
          
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-gradient-to-r from-amber-200 to-amber-400 text-transparent bg-clip-text font-bold uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" /> Premium AI Feature
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
              Never feel unprepared again.
            </h2>
            <p className="text-indigo-100/80 text-sm md:text-base max-w-2xl leading-relaxed">
              Meet your personal Impact AI Coach. Whenever you're viewing a task, ask our AI for step-by-step guidance, preparation tips, and best practices tailored exactly to what the NGO needs.
            </p>
          </div>
          
          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <Link to="/volunteer/find-tasks" className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 bg-white hover:bg-indigo-50 text-indigo-900 font-bold rounded-2xl transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:-translate-y-1">
              <Wand2 className="w-5 h-5 text-indigo-600" />
              Try it on a Task
            </Link>
          </div>
        </div>

        {/* ── Two Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Task Feed (live from Firestore) */}
          <div className="lg:col-span-2">
            <TaskFeed />
          </div>

          {/* Right — Sidebar Widgets */}
          <div className="flex flex-col gap-6">

            {/* Profile widget with profile link */}
            <ProfileWidget />

            {/* Impact score widget */}
            <ImpactWidget />



            {/* Map / available needs teaser */}
            <div className="rounded-2xl overflow-hidden relative shadow-sm h-48 bg-slate-800 group cursor-pointer">
              <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-linear-to-t from-emerald-950 via-slate-900/60 to-transparent mix-blend-multiply" />
              <div className="absolute bottom-0 left-0 w-full p-5">
                <h4 className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">Nearby</h4>
                <div className="text-lg font-serif font-bold text-white mb-3">Needs in your area</div>
                <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  View on map <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default VolunteerHome;