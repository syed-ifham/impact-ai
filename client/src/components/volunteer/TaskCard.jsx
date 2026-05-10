import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';

const CATEGORY_STYLES = {
  Education:   { text: 'text-amber-600', bg: 'bg-amber-50',  dot: 'bg-amber-500'  },
  Medical:     { text: 'text-red-600',   bg: 'bg-red-50',    dot: 'bg-red-500'    },
  Food:        { text: 'text-orange-600',bg: 'bg-orange-50', dot: 'bg-orange-500' },
  Environment: { text: 'text-green-600', bg: 'bg-green-50',  dot: 'bg-green-500'  },
  default:     { text: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400'  },
};

const URGENCY_COLOR = (u) => u >= 75 ? 'bg-red-500' : u >= 40 ? 'bg-amber-500' : 'bg-green-500';

const TaskCard = ({ task, onAccepted }) => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState('idle'); // idle | loading | accepted | skipped

  const isEvent = !!task.isEventTask;
  const style = isEvent 
    ? { text: 'text-purple-700', bg: 'bg-purple-200', dot: 'bg-purple-600' }
    : (CATEGORY_STYLES[task.category] || CATEGORY_STYLES.default);

  const handleAccept = async () => {
    setStatus('loading');
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: 'accepted',
        acceptedBy: currentUser.uid,
        acceptedAt: new Date().toISOString(),
      });
      setStatus('accepted');
      onAccepted?.(task.id);
    } catch (e) {
      console.error('Accept task failed:', e);
      setStatus('idle');
    }
  };

  if (status === 'skipped') return null;

  if (status === 'accepted') return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6 flex items-center gap-4">
      <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
      <div>
        <p className="font-bold text-emerald-800">Task Accepted!</p>
        <p className="text-emerald-600 text-sm">You're now assigned to "{task.title}"</p>
      </div>
    </div>
  );

  return (
    <div className={`rounded-2xl shadow-sm border mb-6 relative overflow-hidden ${isEvent ? 'bg-purple-50 border-purple-200 shadow-purple-900/5' : 'bg-white border-slate-100'}`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${isEvent ? 'bg-purple-500' : URGENCY_COLOR(task.urgency)}`} />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-md ${style.text} ${style.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {task.category}
            </span>
            {isEvent && (
              <span className="text-xs font-bold bg-purple-600 text-white px-2 py-1 rounded-md tracking-wide">
                EVENT ROLE
              </span>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 flex flex-col items-center justify-center text-red-500 shrink-0">
            <span className="text-lg font-bold leading-none">{task.urgency}</span>
            <span className="text-[9px] uppercase tracking-wider font-semibold">urgency</span>
          </div>
        </div>

        <h3 className="font-bold text-slate-900 mb-2">{task.title}</h3>
        {task.ngoName && (
          <p className="text-sm font-semibold text-emerald-600 mb-2 flex items-center gap-1">
            {task.ngoName} {task.ngoCity ? `· ${task.ngoCity}` : ''}
          </p>
        )}
        <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-3">{task.description}</p>

        <div className="flex items-center gap-1 text-slate-400 text-sm mb-6">
          <MapPin className="w-4 h-4 text-pink-500" />
          {task.location}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={status === 'loading'}
            className={`flex-1 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              isEvent ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {status === 'loading'
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Accepting...</>
              : (isEvent ? 'Join Event' : 'Accept Task')}
          </button>
          <button
            onClick={() => setStatus('skipped')}
            className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl transition-colors"
          >
            Skip
          </button>
        </div>
        
        {/* View Details Link */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
          <Link 
            to={`/volunteer/task/${task.id}`}
            className={`text-sm font-bold flex items-center gap-1 transition-colors ${
              isEvent ? 'text-purple-600 hover:text-purple-700' : 'text-emerald-600 hover:text-emerald-700'
            }`}
          >
            View Full Details & Ask AI <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
