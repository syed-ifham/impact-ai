import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';
import { Check, Clock, Star, Flame } from 'lucide-react';

const StatCard = ({ icon, bgColor, value, label }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div>
      <div className="text-xl font-bold text-slate-800">{value ?? '—'}</div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
    </div>
  </div>
);

const StatsRow = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const d = snap.data();
          setStats({
            tasksCompleted: d.tasksCompleted ?? 0,
            hoursGiven:     d.hoursGiven ?? 0,
            impactScore:    d.impactScore ?? 0,
            streak:         d.streak ?? 0,
          });
        }
      } catch (e) {
        console.error('StatsRow fetch failed:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentUser]);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl h-20 border border-slate-100" />
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard icon={<Check className="w-6 h-6 text-emerald-500" />}  bgColor="bg-emerald-50" value={stats?.tasksCompleted}                      label="Tasks Done"    />
      <StatCard icon={<Clock className="w-6 h-6 text-amber-500" />}    bgColor="bg-amber-50"   value={`${stats?.hoursGiven ?? 0}h`}                  label="Hours Given"   />
      <StatCard icon={<Star  className="w-6 h-6 text-purple-500" />}   bgColor="bg-purple-50"  value={stats?.impactScore}                             label="Impact Score"  />
      <StatCard icon={<Flame className="w-6 h-6 text-red-500" />}      bgColor="bg-red-50"     value={`${stats?.streak ?? 0}d`}                       label="Day Streak"    />
    </div>
  );
};

export default StatsRow;
