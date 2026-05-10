import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import {
  ChevronRight, ListTodo, CheckCircle2, XCircle, MapPin, 
  Clock, AlertTriangle, Trash2, Edit, Loader2
} from 'lucide-react';

const TABS = ['All Tasks', 'Accepted Tasks', 'Declined Tasks', 'Completed Tasks'];

const ManageTasks = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Tasks');

  useEffect(() => {
    fetchTasks();
  }, [currentUser]);

  const fetchTasks = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const q = query(collection(db, 'tasks'), where('ngoId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by createdAt descending
      fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTasks(fetched);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      showToast('Failed to load tasks. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      showToast(`Task marked as ${newStatus} successfully!`, 'success');
    } catch (err) {
      console.error('Update failed:', err);
      showToast('Failed to update task status.', 'error');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(tasks.filter(t => t.id !== taskId));
      showToast('Task deleted successfully.', 'success');
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Failed to delete task.', 'error');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'All Tasks') return true;
    if (activeTab === 'Accepted Tasks') return t.acceptedBy !== null || t.status === 'accepted';
    if (activeTab === 'Declined Tasks') return t.status === 'declined';
    if (activeTab === 'Completed Tasks') return t.status === 'completed';
    return true;
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-500 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-emerald-600 font-medium">Manage Tasks</span>
      </div>

      {/* Header */}
      <div className="mb-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-slate-900 mb-3 flex items-center gap-3">
            <ListTodo className="w-8 h-8 text-emerald-500" />
            Manage Tasks
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            View and manage all the volunteer tasks you have posted. Track progress, mark completions, or delete tasks.
          </p>
        </div>
      </div>

      {/* Sub Header / Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex-1 sm:flex-none text-center ${
              activeTab === tab
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
          <p className="text-slate-500 font-medium">Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No tasks found</h3>
          <p className="text-slate-500 mb-6">You don't have any tasks in the "{activeTab}" category.</p>
          <Link
            to="/dashboard/post-task"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            Create New Task
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <div key={task.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col relative overflow-hidden group">
              {/* Urgency indicator strip */}
              <div className={`absolute top-0 left-0 w-full h-1 ${
                task.urgency >= 80 ? 'bg-red-500' : task.urgency >= 50 ? 'bg-orange-500' : task.urgency >= 25 ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {task.category || 'General'}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  task.status === 'declined' ? 'bg-red-100 text-red-700' :
                  task.acceptedBy ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {task.status === 'completed' ? 'Completed' : task.status === 'declined' ? 'Declined' : task.acceptedBy ? 'Accepted' : 'Open'}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">{task.title}</h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-1">{task.description}</p>

              <div className="space-y-2 mb-6">
                {task.location && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{task.location}</span>
                  </div>
                )}
                {task.deadline && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Deadline: {task.deadline}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                {task.status !== 'completed' && (
                  <button
                    onClick={() => handleUpdateStatus(task.id, 'completed')}
                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete
                  </button>
                )}
                {task.status !== 'declined' && task.status !== 'completed' && (
                   <button
                   onClick={() => handleUpdateStatus(task.id, 'declined')}
                   className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                 >
                   <XCircle className="w-4 h-4" /> Decline
                 </button>
                )}
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors shrink-0"
                  title="Delete Task"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageTasks;
