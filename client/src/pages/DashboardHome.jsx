import React from 'react';
import { 
  Mail, 
  Users, 
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Search,
  MapPin,
  Activity,
  HeartHandshake,
  FileText
} from 'lucide-react';

const DashboardHome = () => {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
        
      {/* 1. Top Banner */}
      <div className="relative bg-slate-900 rounded-2xl p-8 lg:p-10 overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)] border border-emerald-500/30">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/small-robot.avif" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 flex flex-col items-start">
          <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-3">AI-Powered Coordination</span>
          <h1 className="font-serif text-3xl lg:text-4xl text-white font-bold mb-6 drop-shadow-md">Your community needs you today</h1>
          <div className="flex flex-wrap gap-3">
            <div className="bg-rose-500/20 border border-rose-500/30 text-rose-200 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 backdrop-blur-md shadow-sm">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              3 urgent tasks pending
            </div>
            <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 backdrop-blur-md shadow-sm">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              12 volunteers available
            </div>
          </div>
        </div>
      </div>

      {/* 2. Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {[
          { title: "Total Inquiries", value: "24", icon: Mail },
          { title: "Active Volunteers", value: "12", icon: Users },
          { title: "Tasks Completed", value: "156", icon: CheckCircle2 },
          { title: "Urgent Needs", value: "3", icon: AlertCircle }
        ].map((metric, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <metric.icon className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{metric.value}</h3>
            <p className="text-slate-600 font-medium text-sm">{metric.title}</p>
            <p className="text-slate-400 text-xs mt-3 flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-300" /> Updated just now
            </p>
          </div>
        ))}
      </div>

      {/* 3. Bottom Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
            <h2 className="font-bold text-lg text-slate-900">Recent Activity</h2>
            <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="p-2 flex-1 bg-slate-50/30">
            <ul className="space-y-1">
              {[
                { title: "New donor inquiry from Sarah Jenkins", loc: "Donation Dept", status: "Urgent", sColor: "bg-rose-100 text-rose-700 border-rose-200", dot: "bg-rose-500" },
                { title: "Volunteer match found for weekend food drive", loc: "Community Center", status: "Medium", sColor: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400" },
                { title: "Grant proposal draft generated successfully", loc: "Finance Team", status: "Done", sColor: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
                { title: "Updated community outreach schedule", loc: "Operations", status: "Done", sColor: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" }
              ].map((item, i) => (
                <li key={i} className="group p-4 hover:bg-white rounded-xl transition-colors flex items-start gap-4 border border-transparent hover:border-slate-100 hover:shadow-sm">
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${item.dot} shadow-sm`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium truncate group-hover:text-emerald-700 transition-colors">{item.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.loc}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2 hrs ago</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${item.sColor}`}>
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Quick Actions & Live Tool */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2">
            <h3 className="px-4 pt-4 pb-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Actions</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-all group border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <Search className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">Scan New Emails</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-all group border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">Draft New Grant</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-all group border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">Find Volunteers</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Live Tool Card */}
          <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-800 bg-slate-900 group">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1526976663112-00fe81ce814d?auto=format&fit=crop&q=80&w=1000" 
                alt="Community map" 
                className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
            </div>
            <div className="relative z-10 p-6 flex flex-col h-full min-h-[220px] justify-between">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold tracking-wider uppercase drop-shadow-sm">Live Tool</span>
              </div>
              <h3 className="text-white font-serif text-xl font-bold leading-snug mb-6 drop-shadow-md">
                LIVE HEATMAP:<br/>View needs across your region
              </h3>
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                Open Map <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default DashboardHome;
