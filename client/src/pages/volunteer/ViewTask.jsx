import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import VolunteerNav from '../../components/volunteer/VolunteerNav';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  ArrowLeft, MapPin, Clock, CheckCircle2, Wand2, Loader2, 
  ShieldAlert, Sparkles, UserCheck, ChevronRight, Building2, Calendar, Target, HelpCircle
} from 'lucide-react';

const ViewTask = () => {
  const { taskId } = useParams();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  // AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'tasks', taskId));
        if (docSnap.exists()) {
          setTask({ id: docSnap.id, ...docSnap.data() });
        } else {
          showToast("Task not found.", "error");
          navigate('/volunteer/find-tasks');
        }
      } catch (err) {
        console.error(err);
        showToast("Error loading task details.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleAccept = async () => {
    if (!task) return;
    setAccepting(true);
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: 'accepted',
        acceptedBy: currentUser.uid,
        acceptedAt: new Date().toISOString(),
      });
      setTask({ ...task, status: 'accepted', acceptedBy: currentUser.uid });
      showToast("Task accepted successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to accept task.", "error");
    } finally {
      setAccepting(false);
    }
  };

  const handleAskAi = async () => {
    if (!task) return;
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      showToast("LLM API missing, please contact the developer.", "error");
      return;
    }

    setAiLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are an expert volunteer coordinator and AI coach.
        Analyze this volunteer task:
        Title: ${task.title}
        Category: ${task.category}
        Location: ${task.location}
        Description: ${task.description}

        Provide a structured, highly actionable guide with the following sections:
        1. "🎯 Primary Objective": A one-sentence summary of what success looks like.
        2. "🎒 What to Prepare/Bring": 3-4 bullet points of practical things the volunteer should do or bring beforehand.
        3. "✅ Step-by-Step Execution": 3-4 clear steps on how to execute the task on-site.
        4. "⚠️ Crucial Dos & Don'ts": 2 important tips (one Do, one Don't).

        Keep formatting clean using standard text with emojis. No markdown code blocks. Keep it extremely practical and concise.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setAiAdvice(text);
    } catch (err) {
      console.error(err);
      showToast("AI Assistant is currently unavailable. Please try again later.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <VolunteerNav />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <p className="text-slate-500 font-medium">Fetching details...</p>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const isEvent = !!task.isEventTask;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      <VolunteerNav />

      {/* ── Minimal Breadcrumb Header ── */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <Link to="/volunteer/find-tasks" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Task Board
        </Link>
      </div>

      <main className="max-w-5xl mx-auto px-4 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ── Main Content Area ── */}
        <div className="w-full lg:w-[65%] space-y-6">
          
          {/* Clean Title Card */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider ${
                isEvent ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {task.category}
              </span>
              {isEvent && (
                <span className="px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider bg-slate-900 text-white flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Event Role
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6 leading-tight">
              {task.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</p>
                  <p className="font-medium text-slate-900">{task.location || 'Remote'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organizer</p>
                  <p className="font-medium text-slate-900">{task.ngoName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-500" /> Mission Details
            </h2>
            <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-loose text-base">
              <p className="whitespace-pre-wrap">{task.description}</p>
            </div>
          </div>

          {/* AI Guidance Area */}
          <div className="bg-slate-900 rounded-[2rem] p-8 md:p-10 shadow-xl border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3 group-hover:opacity-30 transition-opacity duration-1000" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  Ask Impact AI
                </h2>
              </div>
              
              {!aiAdvice && !aiLoading && (
                <>
                  <p className="text-slate-400 mb-8 max-w-lg leading-relaxed">
                    Unsure how to tackle this? Get a personalized, step-by-step preparation and execution guide generated instantly by our AI Coach.
                  </p>
                  <button 
                    onClick={handleAskAi}
                    className="group/btn inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-indigo-50 text-indigo-900 font-bold rounded-2xl transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)] hover:-translate-y-0.5"
                  >
                    Generate Success Guide <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </>
              )}

              {aiLoading && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-4" />
                  <p className="text-slate-300 font-medium animate-pulse">Analyzing requirements & generating your guide...</p>
                </div>
              )}

              {aiAdvice && !aiLoading && (
                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 md:p-8 mt-2 shadow-inner">
                  <div className="flex items-center gap-2 mb-6 text-amber-300 font-bold border-b border-slate-700 pb-4">
                    <Lightbulb className="w-6 h-6" />
                    <span className="tracking-wide">AI COACH PLAYBOOK</span>
                  </div>
                  <div className="text-slate-300 leading-relaxed space-y-4 whitespace-pre-wrap font-medium">
                    {aiAdvice}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Advanced Action Panel Sidebar ── */}
        <div className="w-full lg:w-[35%] lg:sticky lg:top-24 space-y-6">
          
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-500" /> Status Overview
            </h3>
            
            <div className="space-y-5 mb-8 flex-1">
              {/* Urgency Meter */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Urgency</span>
                  <span className={`text-sm font-bold ${
                    task.urgency >= 75 ? 'text-red-600' : task.urgency >= 40 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {task.urgency}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      task.urgency >= 75 ? 'bg-red-500' : task.urgency >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${task.urgency}%` }}
                  />
                </div>
              </div>

              {/* Deadline */}
              {task.deadline && (
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deadline</p>
                    <p className="font-medium text-slate-900">{task.deadline}</p>
                  </div>
                </div>
              )}
              
              {/* Event Name Link */}
              {task.eventName && (
                <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-500 shadow-sm shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Part of Event</p>
                    <p className="font-bold text-purple-900 line-clamp-1">{task.eventName}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
              {task.status === 'accepted' ? (
                <div className="w-full py-4 bg-emerald-50 text-emerald-700 font-bold rounded-2xl flex items-center justify-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" /> You're Assigned!
                </div>
              ) : (
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className={`w-full py-4 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isEvent ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                  } disabled:opacity-70 hover:-translate-y-0.5`}
                >
                  {accepting ? <Loader2 className="w-6 h-6 animate-spin" /> : <UserCheck className="w-6 h-6" />}
                  {accepting ? 'Accepting...' : isEvent ? 'Join Event Team' : 'Accept This Task'}
                </button>
              )}
            </div>
          </div>
          
          {/* Help Notice */}
          <div className="text-center px-4">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> Have questions? Contact the organizer via your dashboard.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ViewTask;
