import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ChevronRight, CheckCircle2, MapPin, Clock, AlertTriangle,
  Tag, FileText, Loader2, Plus, RotateCcw, Sparkles, Wand2
} from 'lucide-react';

const CATEGORIES = ['Education', 'Medical', 'Food', 'Environment', 'Disaster Relief', 'Housing', 'Other'];

const URGENCY_LABEL = (v) => {
  if (v >= 80) return { text: 'Critical',  color: 'text-red-600',    bg: 'bg-red-50 border-red-200'    };
  if (v >= 50) return { text: 'High',      color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
  if (v >= 25) return { text: 'Medium',    color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200'   };
  return          { text: 'Low',        color: 'text-green-600',  bg: 'bg-green-50 border-green-200'    };
};

const INITIAL = { title: '', description: '', category: '', urgency: 50, location: '', deadline: '' };

const PostTask = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState('idle'); // idle | submitting | success
  const [isAiLoading, setIsAiLoading] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const isValid = form.title.trim() && form.description.trim() && form.category && form.location.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'tasks'), {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        urgency:     Number(form.urgency),
        location:    form.location.trim(),
        deadline:    form.deadline || null,
        status:      'open',
        ngoId:       currentUser.uid,
        ngoName:     userData?.adminFullName || 'NGO',
        ngoCity:     userData?.city || '',
        acceptedBy:  null,
        createdAt:   new Date().toISOString(),
      });
      setStatus('success');
      showToast('Task posted successfully!', 'success');
    } catch (err) {
      console.error('Task post failed:', err);
      showToast('Failed to post task. Please try again.', 'error');
      setStatus('idle');
    }
  };

  const handleAiSuggest = async () => {
    if (!form.title.trim() && !form.description.trim()) {
      showToast('Please enter at least a basic title or description for the AI to enhance.', 'error');
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      showToast('LLM API missing, please contact the developer.', 'error');
      return;
    }

    setIsAiLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        You are an expert copywriter for an NGO volunteering platform.
        Given the following rough task details, generate a catchy, professional title and a highly engaging description that will attract volunteers.
        Rough Title: ${form.title}
        Rough Description: ${form.description}
        Category: ${form.category}

        Respond ONLY with a valid JSON object matching this schema:
        {
          "title": "Generated Catchy Title",
          "description": "Generated engaging description..."
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(jsonStr);

      if (data.title && data.description) {
        setForm(prev => ({ ...prev, title: data.title, description: data.description }));
        showToast('AI successfully enhanced your task!', 'success');
      } else {
        throw new Error('Invalid JSON format');
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      showToast('AI Assistant is currently unavailable. Please try again later.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const urgencyInfo = URGENCY_LABEL(form.urgency);

  /* ── Success screen ── */
  if (status === 'success') return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto w-full flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
      </div>
      <h2 className="font-serif text-3xl font-bold text-slate-900 mb-2">Task Posted!</h2>
      <p className="text-slate-500 mb-8 max-w-sm">
        Your task is now live and visible to matching volunteers.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => { setForm(INITIAL); setStatus('idle'); }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Post Another Task
        </button>
        <button
          onClick={() => navigate('/dashboard/volunteer-matcher')}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl font-semibold transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4" /> Use AI to Find Volunteers
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  /* ── Main form ── */
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full font-sans">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-emerald-600 font-medium">Post Task</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Post a Volunteer Task</h1>
        <p className="text-slate-500 text-lg">Describe the need — volunteers will see and accept matching tasks.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT — Main fields */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* AI Promotional Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-emerald-900 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-indigo-700">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
              <div className="relative z-10 flex-1">
                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  Impact AI Assistant
                </h3>
                <p className="text-indigo-200 text-sm">
                  Struggling to find the right words? Type a rough idea, and let our AI write a compelling title and description to attract more volunteers instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={isAiLoading || (!form.title && !form.description)}
                className={`relative z-10 shrink-0 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl ${
                  isAiLoading || (!form.title && !form.description)
                    ? 'bg-indigo-950/50 text-indigo-400 cursor-not-allowed border border-indigo-800/50'
                    : 'bg-white text-indigo-900 hover:bg-indigo-50 hover:scale-105 hover:shadow-indigo-500/20'
                }`}
              >
                {isAiLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enhancing...</>
                ) : (
                  <><Wand2 className="w-4 h-4 text-indigo-600" /> Auto-Enhance</>
                )}
              </button>
            </div>

            {/* Title */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" /> Task Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g., Volunteer Teachers Needed at Learning Centre"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" /> Task Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={5}
                placeholder="Describe the situation, what help is needed, what skills are required, and any other relevant details..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none text-slate-800 placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400 mt-2">{form.description.length}/500 characters recommended</p>
            </div>

            {/* Category + Location row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-500" /> Category <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                    placeholder="Type a custom category..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white transition-colors"
                  />
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => set('category', c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.category === c ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" /> Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="e.g., Bhopal, MP"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Urgency slider */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-emerald-500" /> Urgency Level
              </label>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">Low</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${urgencyInfo.bg} ${urgencyInfo.color}`}>
                  {urgencyInfo.text} — {form.urgency}
                </span>
                <span className="text-xs text-slate-400">Critical</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={form.urgency}
                onChange={e => set('urgency', e.target.value)}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Deadline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" /> Deadline <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!isValid || status === 'submitting'}
                className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md ${
                  !isValid || status === 'submitting'
                    ? 'bg-emerald-300 cursor-not-allowed text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:-translate-y-0.5 shadow-emerald-500/20'
                }`}
              >
                {status === 'submitting'
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Posting Task...</>
                  : <><Plus className="w-5 h-5" /> Post Task</>}
              </button>
              <button
                type="button"
                onClick={() => { setForm(INITIAL); setStatus('idle'); }}
                className="px-6 py-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          {/* RIGHT — Preview card */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest text-slate-400">Live Preview</h3>

              {/* Preview task card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  form.urgency >= 80 ? 'bg-red-500' : form.urgency >= 50 ? 'bg-orange-500' : form.urgency >= 25 ? 'bg-amber-500' : 'bg-green-500'
                }`} />

                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${urgencyInfo.bg} ${urgencyInfo.color}`}>
                    {form.category || 'Category'}
                  </span>
                  <div className="w-11 h-11 rounded-full bg-red-50 flex flex-col items-center justify-center text-red-500 shrink-0">
                    <span className="text-base font-bold leading-none">{form.urgency}</span>
                    <span className="text-[8px] uppercase tracking-wider font-semibold">urgency</span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 mb-1 text-sm leading-snug">
                  {form.title || 'Task title will appear here'}
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">
                  {form.description || 'Description will appear here...'}
                </p>
                {form.location && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3 text-pink-400" /> {form.location}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 h-8 bg-emerald-500 rounded-lg text-white text-xs font-bold flex items-center justify-center">Accept Task</div>
                  <div className="px-3 h-8 border border-slate-200 rounded-lg text-slate-400 text-xs font-bold flex items-center justify-center">Skip</div>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-3 text-center">This is how volunteers will see your task.</p>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default PostTask;
