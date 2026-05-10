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
  Lightbulb, ShieldAlert, Sparkles, UserCheck 
} from 'lucide-react';

const VolunteerTaskDetails = () => {
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
      showToast("Please add VITE_GEMINI_API_KEY to your client/.env file.", "error");
      return;
    }

    setAiLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are an expert volunteer coach and AI Assistant. 
        A volunteer is viewing the following task/event:
        Title: ${task.title}
        Category: ${task.category}
        Location: ${task.location}
        Description: ${task.description}

        Provide a short, highly practical, step-by-step guide on how the volunteer can prepare for and accomplish this task successfully.
        Also, offer a brief encouraging message at the end.
        Keep it formatting clean with emojis. No markdown code blocks, just plain text with newlines.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setAiAdvice(text);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch AI assistance.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <VolunteerNav />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
          <p className="text-slate-500 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const isEvent = !!task.isEventTask;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <VolunteerNav />

      {/* Header */}
      <div className={`${isEvent ? 'bg-purple-900' : 'bg-slate-900'} pt-12 pb-24 px-4 relative overflow-hidden transition-colors`}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-50 to-transparent" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <Link to="/volunteer/find-tasks" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Tasks
          </Link>
          
          <div className="flex gap-2 mb-4">
            <span className={`px-3 py-1 text-xs font-bold rounded-md ${isEvent ? 'bg-purple-500 text-white' : 'bg-emerald-500 text-white'}`}>
              {task.category}
            </span>
            {isEvent && (
              <span className="px-3 py-1 text-xs font-bold rounded-md bg-white text-purple-900">
                EVENT ROLE
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 drop-shadow-md">
            {task.title}
          </h1>
          <p className="text-white/80 text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" /> {task.location}
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Task Description</h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            </div>

            {/* AI Assistant Box */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3" />
              
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-300" /> AI Task Assistant
                </h2>
                <p className="text-indigo-200 mb-6">
                  Not sure where to start? Ask our AI coach for step-by-step guidance on how to best prepare and accomplish this task.
                </p>

                {!aiAdvice && !aiLoading && (
                  <button 
                    onClick={handleAskAi}
                    className="px-6 py-3 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 hover:scale-105"
                  >
                    <Wand2 className="w-5 h-5 text-indigo-600" /> Ask AI for Guidance
                  </button>
                )}

                {aiLoading && (
                  <div className="flex items-center gap-3 text-indigo-200 bg-indigo-950/50 p-4 rounded-xl border border-indigo-800">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    <p className="font-medium animate-pulse">Analyzing task and generating personalized advice...</p>
                  </div>
                )}

                {aiAdvice && !aiLoading && (
                  <div className="bg-indigo-950/50 border border-indigo-800 rounded-2xl p-6 mt-4">
                    <div className="flex items-center gap-2 mb-4 text-amber-300 font-bold">
                      <Lightbulb className="w-5 h-5" />
                      <h3>AI Coach Advice</h3>
                    </div>
                    <div className="whitespace-pre-wrap text-indigo-100 leading-relaxed text-sm">
                      {aiAdvice}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
              <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-widest text-xs text-slate-400">Action Panel</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Urgency Level</p>
                    <p className="text-xs text-slate-500">Rated {task.urgency}/100 by organizer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Organizer</p>
                    <p className="text-xs text-slate-500">{task.ngoName}</p>
                  </div>
                </div>
                {task.deadline && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Deadline</p>
                      <p className="text-xs text-slate-500">{task.deadline}</p>
                    </div>
                  </div>
                )}
              </div>

              {task.status === 'accepted' ? (
                <div className="w-full py-4 bg-emerald-50 text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5" /> You're Going!
                </div>
              ) : (
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isEvent ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                  } disabled:opacity-70`}
                >
                  {accepting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                  {accepting ? 'Accepting...' : isEvent ? 'Join Event' : 'Accept Task'}
                </button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default VolunteerTaskDetails;
