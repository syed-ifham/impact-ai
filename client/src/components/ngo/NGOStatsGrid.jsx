import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';
import { Mail, Users, CheckCircle2, AlertCircle, Activity } from 'lucide-react';

/**
 * Fetches live stats for the logged-in NGO from Firestore in real-time:
 *  - Tasks posted by this NGO
 *  - Tasks completed
 *  - Urgent tasks (urgency >= 75)
 *  - Total volunteer count (platform-wide)
 */
const NGOStatsGrid = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ totalPosted: 0, tasksCompleted: 0, urgentNeeds: 0, activeVolunteers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    const tasksRef = collection(db, 'tasks');
    const usersRef = collection(db, 'users');

    // 1. Listen to all tasks for this NGO and compute stats client-side
    // This avoids Firestore Composite Index requirement errors!
    const qTasks = query(tasksRef, where('ngoId', '==', currentUser.uid));
    const unsubTasks = onSnapshot(qTasks, (snap) => {
      let posted = 0;
      let completed = 0;
      let urgent = 0;
      
      snap.forEach((doc) => {
        posted++;
        const data = doc.data();
        if (data.status === 'completed') completed++;
        if (data.status === 'open' && (data.urgency || 0) >= 75) urgent++;
      });

      setStats(prev => ({
        ...prev,
        totalPosted: posted,
        tasksCompleted: completed,
        urgentNeeds: urgent
      }));
      setLoading(false);
    }, (e) => {
      console.error('NGOStatsGrid tasks fetch failed:', e);
      setLoading(false);
    });

    // 2. Listen to total active volunteers across the platform
    const qVolunteers = query(usersRef, where('role', '==', 'volunteer'));
    const unsubVols = onSnapshot(qVolunteers, (snap) => {
      setStats(prev => ({ ...prev, activeVolunteers: snap.size }));
    }, (e) => {
      console.error('NGOStatsGrid vols fetch failed:', e);
    });

    return () => {
      unsubTasks();
      unsubVols();
    };
  }, [currentUser]);

  const cards = [
    { title: 'Tasks Posted',      key: 'totalPosted',      icon: Mail,         color: 'bg-blue-50 text-blue-500'    },
    { title: 'Active Volunteers', key: 'activeVolunteers',  icon: Users,        color: 'bg-emerald-50 text-emerald-500' },
    { title: 'Tasks Completed',   key: 'tasksCompleted',   icon: CheckCircle2, color: 'bg-purple-50 text-purple-500' },
    { title: 'Urgent Needs',      key: 'urgentNeeds',      icon: AlertCircle,  color: 'bg-rose-50 text-rose-500'    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {cards.map(({ title, key, icon: Icon, color }) => (
        <div key={key} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          {loading ? (
            <div className="h-8 w-12 bg-slate-100 rounded animate-pulse mb-1" />
          ) : (
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats?.[key] ?? 0}</h3>
          )}
          <p className="text-slate-600 font-medium text-sm">{title}</p>
          <p className="text-slate-400 text-xs mt-3 flex items-center gap-1">
            <Activity className="w-3 h-3 text-slate-300" /> Live count
          </p>
        </div>
      ))}
    </div>
  );
};

export default NGOStatsGrid;
