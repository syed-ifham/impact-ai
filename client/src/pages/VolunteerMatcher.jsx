import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Upload, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  Clock,
  Save,
  Edit3,
  Users,
  MapPin
} from 'lucide-react';

const VolunteerMatcher = () => {
  // state: 'input', 'processing', 'review', 'saved'
  const [state, setState] = useState('input');
  const [activeTab, setActiveTab] = useState('paste');

  const handleProcess = () => {
    setState('processing');
    setTimeout(() => {
      setState('review');
    }, 2000);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-500">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-emerald-600 font-medium">Volunteer Matcher</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-slate-900 mb-3">Volunteer Matcher</h1>
        <p className="text-slate-600 text-lg">Instantly pair community needs with the perfect volunteer profiles based on skills and location.</p>
      </div>

      {/* Progress Tracker */}
      <div className="grid grid-cols-2 md:flex md:items-center md:justify-between mb-10 max-w-3xl gap-4 md:gap-0">
        {[
          { step: 1, label: 'Input', active: state === 'input' },
          { step: 2, label: 'AI Processing', active: state === 'processing' },
          { step: 3, label: 'Review', active: state === 'review' },
          { step: 4, label: 'Saved', active: state === 'saved' }
        ].map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                s.active ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : state === 'review' && s.step < 3 || state === 'saved' ? 'bg-emerald-100 text-emerald-600'
                : 'bg-slate-200 text-slate-500'
              }`}>
                {s.step}
              </div>
              <span className={`text-xs font-medium ${s.active ? 'text-emerald-600' : 'text-slate-500'}`}>{s.label}</span>
            </div>
            {i < 3 && (
              <div className="hidden md:block flex-1 h-px bg-slate-200 mx-4 mt-[-20px]">
                <div className={`h-full bg-emerald-500 transition-all duration-500 ${
                  (state === 'processing' && i === 0) || (state === 'review' && i <= 1) || (state === 'saved') ? 'w-full' : 'w-0'
                }`}></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (Main Action Area) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {(state === 'input' || state === 'processing') && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              {/* Tabs */}
              <div className="flex flex-col sm:flex-row items-center border-b border-slate-200 bg-slate-50/50 px-2 pt-2">
                <button 
                  onClick={() => setActiveTab('paste')}
                  className={`w-full sm:w-auto px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'paste' ? 'border-emerald-500 text-emerald-600 bg-white rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Type / Paste Description
                </button>
                <button 
                  onClick={() => setActiveTab('upload')}
                  className={`w-full sm:w-auto px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upload' ? 'border-emerald-500 text-emerald-600 bg-white rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Upload Request Form
                </button>
              </div>

              {/* Input Area */}
              <div className="p-6 flex-1">
                {activeTab === 'paste' ? (
                  <textarea 
                    className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none text-slate-700 bg-slate-50/50 placeholder:text-slate-400"
                    placeholder="Describe the task, role, location, and any required skills..."
                  ></textarea>
                ) : (
                  <div className="w-full h-64 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-slate-700 font-medium">Drag and drop forms or spreadsheets here</p>
                    <p className="text-slate-400 text-sm mt-1">Supports .csv, .pdf, .docx</p>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <button 
                  onClick={handleProcess}
                  disabled={state === 'processing'}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md ${
                    state === 'processing' ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-0.5 shadow-emerald-500/20'
                  }`}
                >
                  {state === 'processing' ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Finding Matches...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Find Best Matches</>
                  )}
                </button>
              </div>
            </div>
          )}

          {state === 'review' && (
            <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* Extracted Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2 font-medium">
                    <MapPin className="w-4 h-4 text-emerald-500" /> Extracted Location
                  </div>
                  <p className="text-lg md:text-xl font-bold text-slate-900">Downtown Community Center</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2 font-medium">
                    <Users className="w-4 h-4 text-emerald-500" /> Top Matches Found
                  </div>
                  <p className="text-lg md:text-xl font-bold text-slate-900">3 Highly Qualified</p>
                </div>
              </div>

              {/* Draft Narrative / Match Results */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI Matched Volunteers
                  </h3>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
                    <Edit3 className="w-4 h-4" /> Edit Selection
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { name: "Marcus Johnson", match: "98%", desc: "Available Saturday mornings. Lives 2 miles away." },
                      { name: "Elena Rodriguez", match: "92%", desc: "Fluent in Spanish. Has heavy lifting experience." },
                      { name: "Sam Lee", match: "85%", desc: "Logistics expert. Previous event coordination." }
                    ].map((v, i) => (
                      <div key={i} className="p-4 border border-slate-100 bg-slate-50/30 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{v.name} <span className="text-emerald-600 text-sm font-bold ml-2">{v.match} Match</span></h4>
                          <p className="text-slate-600 text-sm mt-1">{v.desc}</p>
                        </div>
                        <button className="w-full sm:w-auto px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-colors">Select</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500 mr-2">Required Skills:</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">Event Coordination</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">Bilingual (ES)</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => setState('saved')}
                  className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md hover:-translate-y-0.5"
                >
                  <Save className="w-5 h-5" /> Confirm & Notify Volunteers
                </button>
                <button className="px-8 py-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-lg transition-colors">
                  Discard
                </button>
              </div>

            </div>
          )}

          {state === 'saved' && (
             <div className="bg-emerald-50 rounded-2xl p-10 flex flex-col items-center justify-center text-center border border-emerald-100 animate-in zoom-in-95 duration-500">
               <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center mb-6">
                 <CheckCircle2 className="w-10 h-10" />
               </div>
               <h2 className="font-serif text-3xl font-bold text-emerald-900 mb-2">Matches Confirmed!</h2>
               <p className="text-emerald-700 mb-8 max-w-md">Automated emails have been sent to the selected volunteers with task details.</p>
               <button onClick={() => setState('input')} className="px-6 py-3 bg-white text-emerald-600 rounded-full font-bold shadow-sm border border-emerald-100 hover:shadow-md transition-all">
                 Find More Volunteers
               </button>
             </div>
          )}

        </div>

        {/* RIGHT COLUMN (Context & Help) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {state === 'review' && (
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 flex items-start gap-3 shadow-sm animate-in slide-in-from-right-4 duration-500">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">AI processing complete!</p>
                <p className="text-xs text-emerald-600 mt-1">Review the top matches and select volunteers.</p>
              </div>
            </div>
          )}

          <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-lg group">
            <div className="absolute inset-0 z-0 opacity-40">
              <img src="https://images.unsplash.com/photo-1593113512602-0e9bd2e8fc35?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-700" alt="Context" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">Feature Highlight</span>
              <h3 className="text-white font-serif text-xl font-bold mb-2">Proximity Scoring</h3>
              <p className="text-slate-300 text-sm leading-relaxed">Impact AI prioritizes volunteers who live close to the event location, significantly improving attendance rates.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              {state === 'review' ? <><Sparkles className="w-5 h-5 text-emerald-500" /> Best Results Tips</> : <><Clock className="w-5 h-5 text-emerald-500" /> How it works</>}
            </h3>
            
            {state === 'review' ? (
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-400"><Users className="w-3 h-3" /></div>
                  You can select multiple volunteers at once if the task requires a team.
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-400"><Tag className="w-3 h-3" /></div>
                  Adjust required skills tags to broaden or narrow the search radius.
                </li>
              </ul>
            ) : (
              <ol className="space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-xs">1</div>
                  Input task details, timeline, and location.
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-xs">2</div>
                  AI scans your CRM for availability and matching skills.
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-xs">3</div>
                  Review top matches and bulk-notify them.
                </li>
              </ol>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default VolunteerMatcher;
