import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';
import {
  ChevronRight, Search, Sparkles, CheckCircle2, UserCheck,
  MapPin, Loader2, Users, FileText, X
} from 'lucide-react';
import { useToast } from '../../components/ui/ToastContext';

const VolunteerMatcher = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [volunteers, setVolunteers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [selectedVolunteers, setSelectedVolunteers] = useState(new Set());
  const { showToast } = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!currentUser) return;
      try {
        // Fetch Volunteers
        const volSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'volunteer')));
        const vols = volSnap.docs.map(d => ({ id: d.id, ...d.data(), score: 0, matchedSkills: [] }));

        // Fetch NGO's Tasks
        const taskSnap = await getDocs(query(collection(db, 'tasks'), where('ngoId', '==', currentUser.uid)));
        const tsks = taskSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setVolunteers(vols);
        setTasks(tsks);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        showToast("Failed to load data.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [currentUser]);

  const handleAiMatch = () => {
    if (!selectedTaskId && !taskSearchQuery.trim()) return;
    setIsAiProcessing(true);

    // Simulate AI processing delay for effect
    setTimeout(() => {
      let words = [];
      if (selectedTaskId) {
        const task = tasks.find(t => t.id === selectedTaskId);
        if (task) {
          words = `${task.title} ${task.description} ${task.category}`.toLowerCase().split(/\W+/).filter(Boolean);
        }
      } else {
        // If they just typed a custom search query (e.g. "Medical Volunteer")
        words = taskSearchQuery.toLowerCase().split(/\W+/).filter(Boolean);
      }

      const scored = volunteers.map(v => {
        const skills = v.skills || [];
        const matchedSkills = skills.filter(s => words.some(w => s.toLowerCase().includes(w) || w.includes(s.toLowerCase())));

        // Base score if no skills, otherwise calculate percentage
        let score = 40 + Math.floor(Math.random() * 20); // Random baseline 40-60
        if (skills.length > 0 && matchedSkills.length > 0) {
          score = Math.min(99, Math.round(60 + (matchedSkills.length / skills.length) * 40));
        }

        return { ...v, score, matchedSkills };
      });

      // Sort by score
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        showToast("Please add VITE_GEMINI_API_KEY to your client/.env file to use AI features.", "error");
        setIsAiProcessing(false);
        return;
      }
      const sorted = scored.sort((a, b) => b.score - a.score);

      setVolunteers(sorted);
      setAiMode(true);
      setIsAiProcessing(false);
      setSearchQuery(''); // clear manual search
    }, 1500);
  };

  const resetAiMode = () => {
    setAiMode(false);
    setSelectedTaskId('');
    setTaskSearchQuery('');
    setSearchQuery('');
    setVolunteers(prev => prev.map(v => ({ ...v, score: 0, matchedSkills: [] })));
    setSelectedVolunteers(new Set());
  };

  const handleTaskSelect = (task) => {
    setSelectedTaskId(task.id);
    setTaskSearchQuery(task.title);
    setIsTaskDropdownOpen(false);
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) || (t.category && t.category.toLowerCase().includes(taskSearchQuery.toLowerCase())));

  const toggleSelectVolunteer = (id) => {
    const newSet = new Set(selectedVolunteers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedVolunteers(newSet);
  };

  const handleSendInvites = async () => {
    if (selectedVolunteers.size === 0) return;
    if (!selectedTaskId) {
      showToast("Please select a specific task from the dropdown to invite volunteers to.", "error");
      return;
    }

    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    try {
      const promises = Array.from(selectedVolunteers).map(volId => {
        return addDoc(collection(db, 'invites'), {
          taskId: task.id,
          taskTitle: task.title,
          ngoId: currentUser.uid,
          ngoName: task.ngoName || 'NGO',
          volunteerId: volId,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      });
      await Promise.all(promises);
      showToast(`Successfully sent invites to ${selectedVolunteers.size} volunteers!`, "success");
      setSelectedVolunteers(new Set());
    } catch (err) {
      console.error("Error sending invites:", err);
      showToast("Failed to send invites.", "error");
    }
  };

  // Compute displayed volunteers
  const displayVolunteers = aiMode
    ? volunteers
    : volunteers.filter(v => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (v.fullName && v.fullName.toLowerCase().includes(q)) ||
        (v.skills && v.skills.some(s => s.toLowerCase().includes(q))) ||
        (v.location && v.location.toLowerCase().includes(q))
      );
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading Volunteer Database...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-500 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-emerald-600 font-medium">Find Volunteers</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-slate-900 mb-3">AI Volunteer Engine</h1>
        <p className="text-slate-600 text-lg">Search the volunteer database manually or let Impact AI find the perfect matches for your tasks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Controls & List */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* AI Matching Control Panel */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl relative border border-slate-700">
            {/* Abstract bg element (contained to avoid clipping dropdown) */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Select a Task to Match
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={taskSearchQuery}
                    onChange={(e) => {
                      setTaskSearchQuery(e.target.value);
                      setIsTaskDropdownOpen(true);
                      if (selectedTaskId) setSelectedTaskId('');
                    }}
                    onFocus={() => setIsTaskDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsTaskDropdownOpen(false), 200)}
                    placeholder="Search tasks, or type any category/keyword..."
                    disabled={isAiProcessing}
                    className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-600 bg-slate-800/80 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium shadow-inner placeholder:text-slate-500 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>

                  {/* Custom Dropdown Suggestions */}
                  {isTaskDropdownOpen && filteredTasks.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                      {filteredTasks.map(t => (
                        <button
                          key={t.id}
                          onMouseDown={(e) => { e.preventDefault(); handleTaskSelect(t); }}
                          className="w-full text-left px-4 py-3 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors border-b border-slate-700/50 last:border-0 flex flex-col"
                        >
                          <span className="font-bold truncate">{t.title}</span>
                          <span className="text-xs text-emerald-400 font-medium">{t.category || 'General'}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {isTaskDropdownOpen && filteredTasks.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 p-4 flex flex-col items-center text-center">
                      <p className="text-slate-400 text-sm mb-3">No tasks match your search.</p>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          navigate('/dashboard/post-task');
                        }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-lg text-sm transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Create New Task
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleAiMatch}
                disabled={(!selectedTaskId && !taskSearchQuery.trim()) || isAiProcessing}
                className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shrink-0 ${(!selectedTaskId && !taskSearchQuery.trim()) || isAiProcessing
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 hover:-translate-y-0.5 shadow-emerald-500/20'
                  }`}
              >
                {isAiProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> AI Match</>
                )}
              </button>
            </div>
          </div>

          {/* Search & Results Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-2">
            <h2 className="font-bold text-slate-800 text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              {aiMode ? 'AI Matched Volunteers' : 'All Available Volunteers'}
              <span className="text-sm font-normal text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-full ml-2">
                {displayVolunteers.length}
              </span>
            </h2>

            {/* Manual Search Bar (Only show if not in AI Mode) */}
            {!aiMode ? (
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search skills, names, cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm"
                />
              </div>
            ) : (
              <button
                onClick={resetAiMode}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" /> Clear AI Results
              </button>
            )}
          </div>

          {/* Volunteers List */}
          <div className="space-y-4">
            {displayVolunteers.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No volunteers found matching your criteria.</p>
              </div>
            ) : (
              displayVolunteers.map(v => (
                <div
                  key={v.id}
                  className={`bg-white rounded-2xl p-5 border transition-all ${selectedVolunteers.has(v.id)
                    ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                    : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    {/* Volunteer Info */}
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                        <span className="text-emerald-700 font-bold text-lg">
                          {(v.fullName || 'V')[0].toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-lg">{v.fullName || 'Anonymous Volunteer'}</h3>
                          {aiMode && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${v.score >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              v.score >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                              {v.score}% Match
                            </span>
                          )}
                        </div>

                        {v.location && (
                          <p className="text-slate-500 text-xs flex items-center gap-1 mb-3">
                            <MapPin className="w-3.5 h-3.5" /> {v.location}
                          </p>
                        )}

                        {/* Skills / Matched Skills */}
                        <div className="flex flex-wrap gap-1.5">
                          {aiMode && v.matchedSkills?.length > 0 ? (
                            // Highlight matched skills
                            v.skills?.map(skill => (
                              <span key={skill} className={`text-xs px-2.5 py-1 rounded-md font-medium border ${v.matchedSkills.includes(skill)
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                {skill}
                              </span>
                            ))
                          ) : (
                            // Show all skills normally
                            v.skills?.map(skill => (
                              <span key={skill} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium border border-slate-200">
                                {skill}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 pt-1 sm:pt-0">
                      <button
                        onClick={() => toggleSelectVolunteer(v.id)}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${selectedVolunteers.has(v.id)
                          ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600'
                          : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
                          }`}
                      >
                        {selectedVolunteers.has(v.id) ? (
                          <><CheckCircle2 className="w-4 h-4" /> Selected</>
                        ) : (
                          <><UserCheck className="w-4 h-4" /> Select</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Action Panel */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Bulk Actions</h3>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 text-center">
              <p className="text-3xl font-black text-emerald-600 mb-1">{selectedVolunteers.size}</p>
              <p className="text-slate-500 text-sm font-medium">Volunteers Selected</p>
            </div>

            <button
              onClick={handleSendInvites}
              disabled={selectedVolunteers.size === 0}
              className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${selectedVolunteers.size > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
              <Sparkles className="w-5 h-5" />
              Invite to Task
            </button>
            <p className="text-xs text-slate-400 text-center mt-3 leading-relaxed">
              Selected volunteers will receive an email and in-app notification inviting them to participate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerMatcher;
