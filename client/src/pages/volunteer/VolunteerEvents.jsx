import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import VolunteerNav from '../../components/volunteer/VolunteerNav';
import { CalendarDays, MapPin, Loader2, Search, SlidersHorizontal, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const VolunteerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const qEvents = query(collection(db, 'events'));
    const unsub = onSnapshot(qEvents, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEvents(fetched);
      setLoading(false);
    }, (error) => {
      console.error('Events fetch failed:', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredEvents = events.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (e.name && e.name.toLowerCase().includes(q)) ||
      (e.location && e.location.toLowerCase().includes(q)) ||
      (e.ngoName && e.ngoName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      <VolunteerNav />

      {/* ── Search Header ── */}
      <div className="bg-purple-900 pt-16 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-purple-900/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-50 to-transparent" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 drop-shadow-md">
            Discover Upcoming Events
          </h1>
          <p className="text-purple-100 text-lg mb-8 font-medium">
            Join large-scale community events and make a massive impact together.
          </p>

          <div className="relative max-w-2xl mx-auto flex items-center shadow-2xl">
            <div className="absolute left-4 text-purple-400">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events by name, location, or organizer..."
              className="w-full pl-14 pr-16 py-4 rounded-2xl border-0 outline-none text-lg text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-purple-500/30 transition-all bg-white"
            />
            <button className="absolute right-3 p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl transition-colors">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="font-bold text-slate-800 text-lg">
            {searchQuery ? `Search Results (${filteredEvents.length})` : 'All Upcoming Events'}
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-purple-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium animate-pulse">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-2">No events found</h3>
            <p className="text-slate-500">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div key={event.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all p-6 flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500" />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-purple-100 text-purple-700 p-3 rounded-xl">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                    {event.ngoName}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
                  {event.name}
                </h3>
                
                <p className="text-sm text-slate-500 mb-6 line-clamp-3 flex-1">
                  {event.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{event.roles ? event.roles.reduce((acc, r) => acc + r.count, 0) : 0} Total Roles</span>
                  </div>
                </div>

                <Link
                  to={`/volunteer/find-tasks?event=${event.id}`}
                  className="w-full text-center py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl transition-colors border border-purple-200 mt-auto"
                >
                  View Roles
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VolunteerEvents;
