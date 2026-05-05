import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Upload, 
  FileText, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  Clock,
  Save,
  Edit3
} from 'lucide-react';

const DonorEmailOrganizer = () => {
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
        <span className="text-emerald-600 font-medium">Inbox Organizer</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-slate-900 mb-3">Donor Email Organizer</h1>
        <p className="text-slate-600 text-lg">Automatically categorize incoming donor emails and draft thoughtful replies.</p>
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
                  Type / Paste Text
                </button>
                <button 
                  onClick={() => setActiveTab('upload')}
                  className={`w-full sm:w-auto px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upload' ? 'border-emerald-500 text-emerald-600 bg-white rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Upload Document
                </button>
              </div>

              {/* Input Area */}
              <div className="p-6 flex-1">
                {activeTab === 'paste' ? (
                  <textarea 
                    className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none text-slate-700 bg-slate-50/50 placeholder:text-slate-400"
                    placeholder="Paste the raw email content here..."
                  ></textarea>
                ) : (
                  <div className="w-full h-64 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-slate-700 font-medium">Drag and drop email files here</p>
                    <p className="text-slate-400 text-sm mt-1">Supports .eml, .txt, .pdf</p>
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
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing with Impact AI...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Process with Impact AI</>
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
                    <Tag className="w-4 h-4 text-emerald-500" /> Category
                  </div>
                  <p className="text-lg md:text-xl font-bold text-slate-900">High-Value Donation Inquiry</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-500" /> Urgency Score (1-100)
                  </div>
                  <p className="text-lg md:text-xl font-bold text-rose-600 flex items-end gap-2">85 <span className="text-sm font-medium text-rose-400 mb-1">Requires 24h response</span></p>
                </div>
              </div>

              {/* Draft Narrative */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" /> AI Generated Reply Draft
                  </h3>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
                    <Edit3 className="w-4 h-4" /> Edit Draft
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    Dear Sarah,
                    {"\n\n"}
                    Thank you so much for reaching out to Impact AI Foundation. We are deeply grateful for your interest in making a significant contribution to our upcoming community food drive.
                    {"\n\n"}
                    Your support directly enables us to provide meals to over 500 families this month. I have CC'd our Finance Director, David, who can assist you directly with the wire transfer details you requested.
                    {"\n\n"}
                    We would love to invite you to our facility next week for a brief tour to see the impact of your generosity firsthand.
                    {"\n\n"}
                    With deepest gratitude,
                    {"\n"}
                    The Impact AI Team
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500 mr-2">Auto-Tags:</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">Needs Follow-up</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">Major Donor</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => setState('saved')}
                  className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md hover:-translate-y-0.5"
                >
                  <Save className="w-5 h-5" /> Save & Approve Draft
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
               <h2 className="font-serif text-3xl font-bold text-emerald-900 mb-2">Draft Approved!</h2>
               <p className="text-emerald-700 mb-8 max-w-md">The email draft has been successfully saved to your outbox and categorized in the CRM.</p>
               <button onClick={() => setState('input')} className="px-6 py-3 bg-white text-emerald-600 rounded-full font-bold shadow-sm border border-emerald-100 hover:shadow-md transition-all">
                 Process Another Email
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
                <p className="text-xs text-emerald-600 mt-1">Review the extracted data and draft.</p>
              </div>
            </div>
          )}

          <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-lg group">
            <div className="absolute inset-0 z-0 opacity-40">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-700" alt="Context" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">Feature Highlight</span>
              <h3 className="text-white font-serif text-xl font-bold mb-2">Smart Sentiment Analysis</h3>
              <p className="text-slate-300 text-sm leading-relaxed">Impact AI detects the emotional tone and urgency of emails, ensuring critical messages bypass the queue.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              {state === 'review' ? <><Sparkles className="w-5 h-5 text-emerald-500" /> Best Results Tips</> : <><Clock className="w-5 h-5 text-emerald-500" /> How it works</>}
            </h3>
            
            {state === 'review' ? (
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-400"><Edit3 className="w-3 h-3" /></div>
                  Always briefly review facts before sending, especially names and financial figures.
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-400"><Tag className="w-3 h-3" /></div>
                  Adjust tags if necessary to improve AI learning for future categorizations.
                </li>
              </ul>
            ) : (
              <ol className="space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-xs">1</div>
                  Paste raw email text or upload a document.
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-xs">2</div>
                  AI extracts key donor info, intent, and urgency.
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-xs">3</div>
                  Review the auto-generated draft and approve.
                </li>
              </ol>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default DonorEmailOrganizer;
