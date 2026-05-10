import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';
import { Sparkles, Clock } from 'lucide-react';
import TaskCard from './TaskCard';

const TABS = ['Available Tasks', 'My Tasks', 'Invites', 'Completed'];

const TaskFeed = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // 1. Real-time listener for Available Tasks
    const qOpen = query(
      collection(db, 'tasks'),
      where('status', '==', 'open')
    );
    const unsubOpen = onSnapshot(qOpen, (snap) => {
      const rawTasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort client-side to avoid Firestore composite index requirement
      const sortedTasks = rawTasks.sort((a, b) => (b.urgency || 0) - (a.urgency || 0));
      setTasks(sortedTasks);
      setLoading(false);
    }, (error) => {
      console.error('TaskFeed fetch open tasks failed:', error);
      setLoading(false);
    });

    // 2. Real-time listener for My Tasks
    let unsubMy = () => {};
    if (currentUser?.uid) {
      const qMy = query(
        collection(db, 'tasks'),
        where('acceptedBy', '==', currentUser.uid)
      );
      unsubMy = onSnapshot(qMy, (snap) => {
        setMyTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }

    // 3. Real-time listener for Invites
    let unsubInvites = () => {};
    if (currentUser?.uid) {
      const qInvites = query(
        collection(db, 'invites'),
        where('volunteerId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );
      unsubInvites = onSnapshot(qInvites, (snap) => {
        setInvites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }

    // Cleanup listeners on unmount
    return () => {
      unsubOpen();
      unsubMy();
      unsubInvites();
    };
  }, [currentUser]);

  // onSnapshot removes accepted tasks automatically, but we can pass an empty function
  const handleAccepted = () => {};

  const handleAcceptInvite = async (invite) => {
    try {
      await updateDoc(doc(db, 'invites', invite.id), { status: 'accepted' });
      await updateDoc(doc(db, 'tasks', invite.taskId), {
        status: 'accepted',
        acceptedBy: currentUser.uid
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    try {
      await updateDoc(doc(db, 'invites', inviteId), { status: 'declined' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteTask = async (taskId, urgency) => {
    try {
      // 1. Mark task as completed
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      // 2. Reward the volunteer with stats!
      await updateDoc(doc(db, 'users', currentUser.uid), {
        tasksCompleted: increment(1),
        impactScore: increment(urgency ?? 10),
      });
    } catch (e) {
      console.error('Failed to complete task', e);
    }
  };

  const activeMyTasks = myTasks.filter(t => t.status === 'accepted');
  const completedMyTasks = myTasks.filter(t => t.status === 'completed');

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === i ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab}
            {tab === 'Invites' && invites.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all ${
                activeTab === i ? 'bg-white text-emerald-600' : 'bg-rose-500 text-white animate-pulse'
              }`}>
                {invites.length}
              </span>
            )}
            {tab === 'My Tasks' && activeMyTasks.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === i ? 'bg-white text-emerald-600' : 'bg-amber-100 text-amber-700'
              }`}>
                <Clock className="w-3 h-3" />
                {activeMyTasks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-52 border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : activeTab === 0 ? (
        tasks.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100">
            <p className="font-semibold text-lg">No open tasks right now</p>
            <p className="text-sm mt-1">Check back later — new needs are posted daily.</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onAccepted={handleAccepted} />
          ))
        )
      ) : activeTab === 1 ? (
        activeMyTasks.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100">
            <p className="font-semibold text-lg">You haven't accepted any tasks yet</p>
            <p className="text-sm mt-1">Go to Available Tasks to find opportunities to help.</p>
          </div>
        ) : (
          activeMyTasks.map(task => (
            <div key={task.id} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-900">{task.title}</h3>
                <div className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                  Task Accepted
                </div>
              </div>
              {task.ngoName && <p className="text-xs font-bold text-emerald-600 mb-2">{task.ngoName}</p>}
              <p className="text-slate-600 text-sm mb-4">{task.description}</p>
              <button 
                onClick={() => handleCompleteTask(task.id, task.urgency)}
                className="w-full py-3 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold transition-colors"
              >
                Mark as Completed
              </button>
            </div>
          ))
        )
      ) : activeTab === 2 ? (
        invites.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300 opacity-50" />
            <p className="font-semibold text-lg">No pending invites</p>
            <p className="text-sm mt-1">When an NGO matches you with a task using AI, it will appear here.</p>
          </div>
        ) : (
          invites.map(invite => (
            <div key={invite.id} className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="w-24 h-24 text-indigo-600" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3" /> AI Matched Invite
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-xl mb-1">{invite.taskTitle}</h3>
                <p className="text-sm font-bold text-indigo-600 mb-6">From: {invite.ngoName}</p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleAcceptInvite(invite)}
                    className="flex-1 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold transition-all shadow-sm shadow-indigo-500/20 hover:-translate-y-0.5"
                  >
                    Accept Task
                  </button>
                  <button 
                    onClick={() => handleDeclineInvite(invite.id)}
                    className="px-6 py-3 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))
        )
      ) : (
        completedMyTasks.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="font-semibold">Completed tasks will appear here.</p>
          </div>
        ) : (
          completedMyTasks.map(task => (
            <div key={task.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 opacity-80">
              <h3 className="font-bold text-slate-900 mb-1">{task.title}</h3>
              <p className="text-slate-500 text-sm mb-3">Completed on {new Date(task.completedAt).toLocaleDateString()}</p>
              <div className="inline-block px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">
                Done
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
};

export default TaskFeed;
