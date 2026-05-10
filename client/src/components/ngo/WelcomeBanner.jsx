import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';
import { AlertCircle, HeartHandshake } from 'lucide-react';

/**
 * Welcome banner for the NGO dashboard.
 * Shows the NGO admin's name and live counts of urgent tasks and available volunteers.
 */
const WelcomeBanner = () => {
  const { currentUser, userData } = useAuth();
  const [counts, setCounts] = useState({ urgent: 0, volunteers: 0 });

  const name = userData?.adminFullName || 'Admin';

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        const [taskSnap, volSnap] = await Promise.all([
          getDocs(query(collection(db, 'tasks'), where('ngoId', '==', currentUser.uid))),
          getDocs(query(collection(db, 'users'), where('role', '==', 'volunteer'))),
        ]);
        
        // Filter in memory to avoid requiring a composite index in Firestore
        let urgentCount = 0;
        taskSnap.forEach(doc => {
          const data = doc.data();
          if (data.status === 'open' && data.urgency >= 75) urgentCount++;
        });

        setCounts({ urgent: urgentCount, volunteers: volSnap.size });
      } catch (e) {
        console.error('WelcomeBanner fetch failed:', e);
      }
    };
    load();
  }, [currentUser]);

  return (
    <div className="relative bg-slate-900 rounded-2xl p-8 lg:p-10 overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)] border border-emerald-500/30">
      <div className="absolute inset-0 z-0">
        <img src="/images/small-robot.avif" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
      </div>
      <div className="relative z-10 flex flex-col items-start">
        <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-3">AI-Powered Coordination</span>
        <h1 className="font-serif text-3xl lg:text-4xl text-white font-bold mb-6 drop-shadow-md">
          Welcome back, {name} 👋
        </h1>
        <div className="flex flex-wrap gap-3">
          <div className="bg-rose-500/20 border border-rose-500/30 text-rose-200 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 backdrop-blur-md shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            {counts.urgent} urgent {counts.urgent === 1 ? 'task' : 'tasks'} pending
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 backdrop-blur-md shadow-sm">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            {counts.volunteers} {counts.volunteers === 1 ? 'volunteer' : 'volunteers'} available
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
