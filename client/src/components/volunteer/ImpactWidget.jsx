import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';

const ImpactWidget = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ impactScore: 0, tasksCompleted: 0, hoursGiven: 0 });

  useEffect(() => {
    if (!currentUser) return;
    getDoc(doc(db, 'users', currentUser.uid)).then(snap => {
      if (snap.exists()) setStats(snap.data());
    });
  }, [currentUser]);

  return (
    <div className="rounded-2xl p-6 shadow-sm text-white relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-slate-900/75 mix-blend-multiply pointer-events-none" />
      
      <div className="relative z-10">
        <h4 className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4">
          Your Impact
        </h4>
        <div className="text-5xl font-serif font-bold mb-2 drop-shadow-md">{stats.impactScore ?? 0}</div>
        <div className="text-slate-300 text-sm mb-6 font-medium">Impact points earned</div>
        
        <div className="text-sm font-medium text-white bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-xl flex justify-around shadow-inner">
          <div className="text-center">
            <div className="text-emerald-400 font-bold text-lg leading-none mb-1">{stats.tasksCompleted ?? 0}</div>
            <div className="text-xs text-slate-300">Tasks</div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="text-center">
            <div className="text-emerald-400 font-bold text-lg leading-none mb-1">{stats.hoursGiven ?? 0}h</div>
            <div className="text-xs text-slate-300">Given</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactWidget;
