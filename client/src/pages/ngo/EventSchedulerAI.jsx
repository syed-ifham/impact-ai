import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDays, Loader2, ArrowLeft, Calendar, FileCheck2, 
  Clock, Bot, PenTool, CheckCircle2, ListTodo, Users, Sparkles, Send, MapPin, AlignLeft
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';

const EventSchedulerAI = () => {
  const { currentUser, userData } = useAuth();
  const { showToast } = useToast();
  
  const [status, setStatus] = useState('input'); // input, processing, review, posting, done
  const [formData, setFormData] = useState({ 
    name: '', 
    location: '', 
    description: '' 
  });
  
  const [aiData, setAiData] = useState(null);

  const handleGenerate = async () => {
    if (!formData.name || !formData.description) {
      showToast("Please provide event name and description.", "error");
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      showToast("LLM API missing, please contact the developer.", "error");
      return;
    }

    setStatus('processing');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are an expert NGO Event Coordinator AI.
        Plan a detailed event based on the following information:
        - Event Name: ${formData.name}
        - Location: ${formData.location || 'Virtual/TBD'}
        - Goal/Description: ${formData.description}

        Generate two things:
        1. A structured timeline of activities.
        2. A list of specific volunteer roles needed to make the event a success.

        Ensure categories are one of: "Education", "Medical", "Food", "Environment", "Disaster Relief", "Housing", "Other".
        
        Return EXACTLY a raw JSON object (NO markdown, NO code blocks):
        {
          "timeline": [
            { "time": "09:00 AM", "activity": "Volunteer briefing and setup" }
          ],
          "roles": [
            { 
              "title": "Registration Coordinator",
              "category": "Other", 
              "count": 2, 
              "description": "Manage the check-in desk and hand out volunteer badges.",
              "urgency": 85
            }
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);

      setAiData(parsed);
      setStatus('review');
      showToast("Event plan generated successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("AI Assistant is currently unavailable. Please try again later.", "error");
      setStatus('input');
    }
  };

  const handleBulkPost = async () => {
    if (!aiData?.roles) return;
    setStatus('posting');
    
    try {
      // Create Event document
      const eventRef = await addDoc(collection(db, 'events'), {
        name: formData.name,
        location: formData.location || 'Remote',
        description: formData.description,
        ngoId: currentUser.uid,
        ngoName: userData?.fullName || 'NGO',
        timeline: aiData.timeline,
        roles: aiData.roles,
        createdAt: new Date().toISOString()
      });

      const promises = [];
      // Loop through roles and create multiple tasks if count > 1
      for (const role of aiData.roles) {
        for (let i = 0; i < role.count; i++) {
          promises.push(addDoc(collection(db, 'tasks'), {
            title: role.title,
            description: role.description,
            category: role.category,
            urgency: role.urgency || 50,
            location: formData.location || 'Remote',
            ngoId: currentUser.uid,
            ngoName: userData?.fullName || 'NGO',
            status: 'open',
            createdAt: new Date().toISOString(),
            isEventTask: true,
            eventId: eventRef.id,
            eventName: formData.name
          }));
        }
      }
      
      await Promise.all(promises);
      showToast(`Successfully posted all volunteer roles!`, "success");
      setStatus('done');
    } catch (err) {
      console.error("Bulk Post Error:", err);
      showToast("We couldn't post the tasks right now. Please try again.", "error");
      setStatus('review');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 flex flex-col">
      <header className="w-full bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-400 hover:text-teal-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-teal-50">
            <ArrowLeft size={18} />
          </Link>
          <div className="bg-teal-100 p-2.5 rounded-lg text-teal-700">
            <CalendarDays size={24} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Event Scheduler AI</h1>
            <p className="text-sm text-slate-500">Auto-generate timelines & volunteer roles.</p>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-8 animate-in fade-in duration-500">
        
        {/* Step 1: Input */}
        {(status === 'input' || status === 'processing') && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            
            {status === 'processing' && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-1">Planning Event...</h3>
                <p className="text-slate-500">Generating timeline and required roles</p>
              </div>
            )}

            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
              <div className="bg-teal-50 p-3 rounded-xl text-teal-600"><PenTool size={24} /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Step 1: Event Details</h2>
                <p className="text-slate-500 text-sm">Tell AI what you're trying to organize.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4 text-teal-500"/> Event Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Sunday Beach Cleanup" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-teal-500"/> Location</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. Juhu Beach, Mumbai" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><AlignLeft className="w-4 h-4 text-teal-500"/> Event Goal & Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g. We need to clear plastic waste from the south pier. Expecting 20 volunteers for 4 hours." 
                  className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={!formData.name || !formData.description}
                className="w-full py-4 mt-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={20} /> Generate Event Plan
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review & Action */}
        {(status === 'review' || status === 'posting') && aiData && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-500">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{formData.name}</h2>
                <p className="text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> {formData.location}</p>
              </div>
              <button 
                onClick={handleBulkPost}
                disabled={status === 'posting'}
                className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
              >
                {status === 'posting' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {status === 'posting' ? 'Posting...' : 'Bulk-Post Roles to Feed'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Timeline */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-slate-800">
                  <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Clock className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold">Event Timeline</h3>
                </div>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {aiData.timeline.map((item, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-amber-100 text-amber-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <ListTodo className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="font-bold text-amber-600 mb-1">{item.time}</div>
                        <div className="text-slate-700 text-sm font-medium">{item.activity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Roles */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-slate-800">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Users className="w-5 h-5" /></div>
                    <h3 className="text-lg font-bold">Required Roles</h3>
                  </div>
                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">
                    {aiData.roles.reduce((acc, r) => acc + r.count, 0)} Total Volunteers
                  </span>
                </div>

                <div className="space-y-3">
                  {aiData.roles.map((role, idx) => (
                    <div key={idx} className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 flex gap-4 items-start">
                      <div className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0">
                        x{role.count}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">{role.title}</h4>
                        <p className="text-sm text-slate-500 mb-2 leading-snug">{role.description}</p>
                        <div className="flex gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">{role.category}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 px-2 py-0.5 rounded">Urgency: {role.urgency}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {status === 'done' && (
          <div className="bg-teal-50 rounded-3xl p-12 flex flex-col items-center text-center border border-teal-100 animate-in zoom-in-95 duration-500 shadow-sm mt-10">
            <div className="w-24 h-24 rounded-full bg-white shadow-xl shadow-teal-200/50 text-teal-600 flex items-center justify-center mb-8">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Event Planned & Posted!</h2>
            <p className="text-slate-600 text-lg mb-8 max-w-md">Your timeline is ready and all volunteer roles have been instantly bulk-posted to the live feed.</p>
            <div className="flex gap-4">
              <Link to="/dashboard" className="px-8 py-3.5 bg-white text-teal-600 rounded-xl font-bold shadow-sm border border-teal-100 hover:shadow-md transition-all">Go to Dashboard</Link>
              <button onClick={() => { setStatus('input'); setFormData({name:'', location:'', description:''}); }} className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-600/20 transition-all">Plan Another Event</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default EventSchedulerAI;
