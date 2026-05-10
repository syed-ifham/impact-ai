import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import VolunteerNav from '../../components/volunteer/VolunteerNav';
import TaskCard from '../../components/volunteer/TaskCard';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';

const FindTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const eventIdFilter = searchParams.get('event');

  useEffect(() => {
    // Real-time listener for ALL Open Tasks
    const qOpen = query(collection(db, 'tasks'), where('status', '==', 'open'));

    const unsub = onSnapshot(qOpen, (snap) => {
      const rawTasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort client-side by highest urgency
      const sortedTasks = rawTasks.sort((a, b) => (b.urgency || 0) - (a.urgency || 0));
      setTasks(sortedTasks);
      setLoading(false);
    }, (error) => {
      console.error('FindTasks fetch failed:', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Filter tasks based on search query (matches title, category, or location) and eventId
  const filteredTasks = tasks.filter(task => {
    if (eventIdFilter && task.eventId !== eventIdFilter) return false;
    
    if (!searchQuery.trim()) return true;
    const queryLower = searchQuery.toLowerCase();
    return (
      (task.title && task.title.toLowerCase().includes(queryLower)) ||
      (task.category && task.category.toLowerCase().includes(queryLower)) ||
      (task.location && task.location.toLowerCase().includes(queryLower)) ||
      (task.ngoName && task.ngoName.toLowerCase().includes(queryLower))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      <VolunteerNav />

      {/* ── Search Header ── */}
      <div className="bg-slate-900 pt-16 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-50 to-transparent" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 drop-shadow-md">
            Find Your Next Mission
          </h1>
          <p className="text-emerald-100 text-lg mb-8 font-medium">
            Search thousands of high-impact volunteer opportunities in your area.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto flex items-center shadow-2xl">
            <div className="absolute left-4 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category (e.g. Medical), or location..."
              className="w-full pl-14 pr-16 py-4 rounded-2xl border-0 outline-none text-lg text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-500/30 transition-all bg-white"
            />
            <button className="absolute right-3 p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Results Section ── */}
      <main className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="font-bold text-slate-800 text-lg">
            {searchQuery ? `Search Results (${filteredTasks.length})` : 'All Available Tasks'}
          </h2>
          <select className="bg-white border border-slate-200 text-slate-600 text-sm font-medium py-2 px-4 rounded-xl outline-none focus:border-emerald-500">
            <option>Highest Urgency</option>
            <option>Newest First</option>
            <option>Closest to Me</option>
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium animate-pulse">Loading opportunities...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-2">No tasks found</h3>
            <p className="text-slate-500">Try adjusting your search query or filters.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-6 px-6 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FindTasks;
