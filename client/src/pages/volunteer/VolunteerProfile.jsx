import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';
import VolunteerNav from '../../components/volunteer/VolunteerNav';
import { MapPin, CheckCircle2, Clock, Star, Flame, Calendar } from 'lucide-react';

const VolunteerProfile = () => {
  const { currentUser, userData } = useAuth();
  const [stats, setStats] = useState({ tasksCompleted: 0, hoursGiven: 0, impactScore: 0, streak: 0 });
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const username = userData?.fullName || 'Volunteer';
  const initials = username.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        // Fetch user stats
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (userSnap.exists()) {
          const d = userSnap.data();
          setStats({
            tasksCompleted: d.tasksCompleted ?? 0,
            hoursGiven:     d.hoursGiven ?? 0,
            impactScore:    d.impactScore ?? 0,
            streak:         d.streak ?? 0,
          });
        }
        // Fetch tasks this volunteer accepted
        const q = query(collection(db, 'tasks'), where('acceptedBy', '==', currentUser.uid));
        const snap = await getDocs(q);
        setAcceptedTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('VolunteerProfile load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const CATEGORY_COLORS = {
    Education:   'bg-amber-100 text-amber-700',
    Medical:     'bg-red-100 text-red-700',
    Food:        'bg-orange-100 text-orange-700',
    Environment: 'bg-green-100 text-green-700',
    default:     'bg-slate-100 text-slate-600',
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <VolunteerNav />

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Profile Card (Instagram-style) ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          {/* Cover gradient */}
          <div className="h-40 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_left,_white_0%,_transparent_60%)]" />
          </div>

          {/* Profile info */}
          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="absolute -top-14 left-6 w-28 h-28 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-4xl border-4 border-white shadow-xl select-none">
              {initials}
            </div>

            <div className="pt-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-slate-900">{username}</h1>
                <p className="text-slate-400 text-sm">@{username.toLowerCase().replace(/\s+/g, '_')}</p>
                {userData?.location && (
                  <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4 text-pink-400" /> {userData.location}
                  </p>
                )}
              </div>
              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100 self-start sm:self-auto">
                Volunteer
              </span>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 mt-6 border-t border-slate-100 pt-5">
              {[
                { icon: <CheckCircle2 className="w-4 h-4" />, value: stats.tasksCompleted, label: 'Tasks' },
                { icon: <Clock className="w-4 h-4" />,        value: `${stats.hoursGiven}h`, label: 'Hours' },
                { icon: <Star className="w-4 h-4" />,         value: stats.impactScore,  label: 'Score' },
                { icon: <Flame className="w-4 h-4" />,        value: `${stats.streak}d`, label: 'Streak' },
              ].map(({ icon, value, label }) => (
                <div key={label} className="flex flex-col items-center gap-0.5 text-slate-700">
                  <div className="flex items-center gap-1 text-emerald-600">{icon}</div>
                  <span className="text-xl font-bold text-slate-900">{value}</span>
                  <span className="text-xs text-slate-400 font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* Skills */}
            {userData?.skills?.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {userData.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Activity Feed ── */}
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Activity</h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-24 border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : acceptedTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="font-semibold">No tasks accepted yet</p>
              <p className="text-sm mt-1">Head to the dashboard and accept your first task!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {acceptedTasks.map(task => (
                <div key={task.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{task.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[task.category] || CATEGORY_COLORS.default}`}>
                        {task.category}
                      </span>
                      {task.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{task.location}</span>
                      )}
                      {task.acceptedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.acceptedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 shrink-0 capitalize">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default VolunteerProfile;
