import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

const STATUS_STYLE = {
  Urgent: 'bg-rose-100 text-rose-700 border-rose-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Done:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  Open:   'bg-blue-100 text-blue-700 border-blue-200',
};
const DOT_STYLE = {
  Urgent: 'bg-rose-500',
  Medium: 'bg-amber-400',
  Done:   'bg-emerald-500',
  Open:   'bg-blue-500',
};

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (diff < 1)  return 'just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

/**
 * Fetches the 5 most recent tasks posted by this NGO and renders them as an activity feed.
 */
const RecentActivity = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        const q = query(
          collection(db, 'tasks'),
          where('ngoId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        const rawItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort and limit client-side to avoid Firestore composite index requirement
        const sortedItems = rawItems
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setItems(sortedItems);
      } catch (e) {
        console.error('RecentActivity fetch failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const statusLabel = (task) => {
    if (task.urgency >= 75) return 'Urgent';
    if (task.status === 'completed') return 'Done';
    if (task.status === 'accepted')  return 'Medium';
    return 'Open';
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-lg text-slate-900">Recent Tasks</h2>
        <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
          View all <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <div className="p-2 flex-1 bg-slate-50/30">
        {loading ? (
          <div className="space-y-2 p-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <p className="font-semibold">No tasks posted yet</p>
            <p className="text-sm mt-1">Post your first task to see activity here.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => {
              const label = statusLabel(item);
              return (
                <li key={item.id} className="group p-4 hover:bg-white rounded-xl transition-colors flex items-start gap-4 border border-transparent hover:border-slate-100 hover:shadow-sm">
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 shadow-sm ${DOT_STYLE[label] || 'bg-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium truncate group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {item.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                      )}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(item.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_STYLE[label] || STATUS_STYLE.Open}`}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
