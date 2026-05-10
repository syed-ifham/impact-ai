import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Upload, FileText, Sparkles,
  CheckCircle2, AlertCircle, Tag, Clock, Save, Edit3, User, Loader2
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useToast } from '../../components/ui/ToastContext';

const DonorEmailOrganizer = () => {
  const [state, setState] = useState('input'); // input, processing, review, saved
  const [activeTab, setActiveTab] = useState('paste');
  const [emailText, setEmailText] = useState('');
  
  const [aiResult, setAiResult] = useState({
    senderName: '',
    category: '',
    urgency: 0,
    replyDraft: ''
  });

  const { showToast } = useToast();

  const handleProcess = async () => {
    if (!emailText.trim()) return;
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      showToast("LLM API missing, please contact the developer.", "error");
      return;
    }

    setState('processing');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are an intelligent AI assistant for an NGO called "Impact AI Foundation".
        Analyze the following incoming email/message.
        
        1. Extract the sender's name (if missing, use "Supporter").
        2. Categorize it strictly into ONE of these: "Material Donation", "Monetary Donation", "Volunteer Inquiry", "Partnership Inquiry", "Emergency Request", "General Inquiry".
        3. Assign an urgency score (1 to 100) based on tone, keywords (e.g. ASAP, emergency = high score).
        4. Draft a warm, professional, and empathetic email reply addressing their specific points.

        Incoming Message:
        """${emailText}"""

        Return EXACTLY a raw JSON object with NO markdown formatting or code blocks:
        {
          "senderName": "Name",
          "category": "Category",
          "urgency": 85,
          "replyDraft": "Dear Name,\\n\\n..."
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);

      setAiResult(parsed);
      setState('review');
      showToast("AI extraction and draft complete!", "success");
      
    } catch (error) {
      console.error("AI Error:", error);
      showToast("AI Assistant is currently unavailable. Please check your input and try again.", "error");
      setState('input');
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-500 pb-20">

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-indigo-600 font-medium">Inbox Organizer</span>
      </div>

      <div className="mb-10">
        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-slate-900 mb-3">AI Inbox Organizer</h1>
        <p className="text-slate-600 text-lg max-w-3xl">Instantly categorize unstructured donor emails, extract intent, and generate highly personalized reply drafts using Gemini AI.</p>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-2 md:flex md:items-center md:justify-between mb-10 max-w-3xl gap-4 md:gap-0">
        {[
          { step: 1, label: 'Input Message', active: state === 'input'      },
          { step: 2, label: 'AI Processing', active: state === 'processing' },
          { step: 3, label: 'Review Draft',  active: state === 'review'     },
          { step: 4, label: 'Send & Save',   active: state === 'saved'      },
        ].map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-2 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${
                s.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-50'
                : (state === 'review' && s.step < 3) || state === 'saved' ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}>{s.step}</div>
              <span className={`text-xs font-bold uppercase tracking-wider ${s.active ? 'text-indigo-700' : 'text-slate-400'}`}>{s.label}</span>
            </div>
            {i < 3 && (
              <div className="hidden md:block flex-1 h-1 bg-slate-100 mx-4 rounded-full overflow-hidden">
                <div className={`h-full bg-indigo-500 transition-all duration-1000 ease-in-out ${
                  (state === 'processing' && i === 0) || (state === 'review' && i <= 1) || state === 'saved' ? 'w-full' : 'w-0'
                }`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Main Interaction Area */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {(state === 'input' || state === 'processing') && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
              
              {/* Processing Overlay */}
              {state === 'processing' && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-100 rounded-full" />
                    <div className="w-20 h-20 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute inset-0" />
                    <Sparkles className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-6 mb-2">Analyzing Intent...</h3>
                  <p className="text-slate-500 text-sm animate-pulse">Gemini 1.5 Flash is reading the message</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center border-b border-slate-100 bg-slate-50 px-2 pt-2">
                <button onClick={() => setActiveTab('paste')} className={`w-full sm:w-auto px-6 py-3.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'paste' ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Type / Paste Email</button>
                <button onClick={() => setActiveTab('upload')} className={`w-full sm:w-auto px-6 py-3.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'upload' ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Upload EML / PDF</button>
              </div>
              
              <div className="p-6 flex-1 bg-white">
                {activeTab === 'paste' ? (
                  <textarea
                    value={emailText}
                    onChange={e => setEmailText(e.target.value)}
                    className="w-full h-72 p-5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none text-slate-700 bg-slate-50/50 placeholder:text-slate-400 transition-all font-medium text-lg leading-relaxed"
                    placeholder="E.g., Hi Impact AI, I have 50 unused blankets from my hotel business that I would like to donate before winter. Let me know where I can drop them off. - Sarah"
                  />
                ) : (
                  <div className="w-full h-72 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 cursor-pointer group hover:bg-indigo-50/30 hover:border-indigo-300 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-white text-indigo-500 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform"><Upload className="w-8 h-8" /></div>
                    <p className="text-slate-700 font-bold text-lg">Drag & Drop Email File</p>
                    <p className="text-slate-400 text-sm mt-1 font-medium">Supports .eml, .txt, .pdf</p>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={handleProcess}
                  disabled={state === 'processing' || !emailText.trim()}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                    state === 'processing' || !emailText.trim() ? 'bg-slate-300 cursor-not-allowed shadow-none text-slate-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:-translate-y-0.5 shadow-indigo-500/25'
                  }`}
                >
                  <Sparkles className="w-5 h-5" /> Analyze Email & Draft Reply
                </button>
              </div>
            </div>
          )}

          {state === 'review' && (
            <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-8 duration-700">
              
              {/* Data Extraction Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2 font-bold uppercase tracking-wider"><User className="w-4 h-4 text-indigo-500" /> Sender Name</div>
                  <p className="text-xl font-bold text-slate-900">{aiResult.senderName}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2 font-bold uppercase tracking-wider"><Tag className="w-4 h-4 text-indigo-500" /> Category</div>
                  <p className="text-xl font-bold text-indigo-700 bg-indigo-50 w-fit px-3 py-1 rounded-lg">{aiResult.category}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-2 font-bold uppercase tracking-wider"><AlertCircle className={`w-4 h-4 ${aiResult.urgency >= 70 ? 'text-rose-500' : 'text-emerald-500'}`} /> Urgency (1-100)</div>
                  <p className={`text-xl font-black flex items-end gap-2 ${aiResult.urgency >= 70 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {aiResult.urgency} <span className={`text-xs font-bold mb-1 px-2 py-0.5 rounded-md ${aiResult.urgency >= 70 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{aiResult.urgency >= 70 ? 'High Priority' : 'Standard'}</span>
                  </p>
                </div>
              </div>

              {/* Generated Draft */}
              <div className="bg-white rounded-3xl shadow-sm border border-indigo-100 overflow-hidden ring-1 ring-indigo-50">
                <div className="p-4 border-b border-indigo-50 flex items-center justify-between bg-indigo-50/50">
                  <h3 className="font-bold text-indigo-900 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" /> AI Generated Reply Draft</h3>
                  <button className="text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 text-sm font-bold flex items-center gap-2 transition-colors"><Edit3 className="w-4 h-4" /> Edit Draft</button>
                </div>
                <div className="p-8">
                  <textarea 
                    value={aiResult.replyDraft}
                    onChange={(e) => setAiResult({...aiResult, replyDraft: e.target.value})}
                    className="w-full h-64 text-slate-700 leading-relaxed text-lg outline-none resize-none font-medium"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <button onClick={() => { setState('saved'); showToast("Reply sent and logged to CRM!", "success"); }} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5">
                  <CheckCircle2 className="w-5 h-5" /> Send Reply & Log to CRM
                </button>
                <button onClick={() => { setState('input'); setEmailText(''); }} className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-lg transition-colors">Discard</button>
              </div>
            </div>
          )}

          {state === 'saved' && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-12 flex flex-col items-center text-center border border-indigo-100 animate-in zoom-in-95 duration-500 shadow-inner">
              <div className="w-24 h-24 rounded-full bg-white shadow-xl shadow-indigo-200/50 text-indigo-600 flex items-center justify-center mb-8">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="font-serif text-4xl font-bold text-slate-900 mb-4">Reply Sent!</h2>
              <p className="text-slate-600 text-lg mb-8 max-w-md font-medium">The email has been categorized as <span className="font-bold text-indigo-700">{aiResult.category}</span> and logged in your CRM.</p>
              <button onClick={() => { setState('input'); setEmailText(''); setAiResult({}); }} className="px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-bold shadow-sm border border-indigo-100 hover:shadow-md hover:-translate-y-0.5 transition-all">Process Next Email</button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Info Panel */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 relative overflow-hidden shadow-xl border border-indigo-900/50">
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <Sparkles className="w-8 h-8 text-indigo-400 mb-6" />
              <h3 className="text-white font-serif text-2xl font-bold mb-4 leading-tight">Supercharge your inbox with AI</h3>
              <p className="text-indigo-200 text-sm leading-relaxed mb-6">
                Impact AI doesn't just read words—it understands intent. It automatically separates urgent emergency requests from standard donation inquiries so your team always focuses on what matters most.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-indigo-100 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant Categorization
                </li>
                <li className="flex items-center gap-3 text-indigo-100 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Emotional Urgency Scoring
                </li>
                <li className="flex items-center gap-3 text-indigo-100 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Empathetic Draft Generation
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2 text-lg"><Clock className="w-5 h-5 text-indigo-500" /> How it works</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-black flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Input Data</h4>
                  <p className="text-sm text-slate-500 font-medium">Paste unstructured text from an email, SMS, or WhatsApp message.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-black flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">AI Analysis</h4>
                  <p className="text-sm text-slate-500 font-medium">Gemini processes the natural language to extract structured CRM fields.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-black flex items-center justify-center shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Send & Log</h4>
                  <p className="text-sm text-slate-500 font-medium">Review the drafted reply, hit send, and automatically log the contact.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DonorEmailOrganizer;
