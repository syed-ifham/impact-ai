import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogOut, User, Leaf } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../auth/AuthContext';

const VolunteerNav = () => {
  const { currentUser, userData } = useAuth();
  const username = userData?.fullName || '';
  const [inviteCount, setInviteCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    const qInvites = query(
      collection(db, 'invites'),
      where('volunteerId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(qInvites, (snap) => {
      setInviteCount(snap.size);
    });
    return () => unsub();
  }, [currentUser]);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) { console.error('Logout failed', e); }
  };

  return (
    <nav className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-30 flex justify-between items-center shadow-sm">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-emerald-600 transition-colors">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="font-serif text-xl font-bold text-slate-900 tracking-tight">
          Impact AI
        </span>
      </Link>

      {/* Center links */}
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
        <Link to="/volunteer" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
        <Link to="/volunteer/find-tasks" className="hover:text-emerald-600 transition-colors">Find Tasks</Link>
        <Link to="/volunteer/events" className="hover:text-purple-600 transition-colors">Events</Link>
        <Link to="/volunteer/profile" className="hover:text-emerald-600 transition-colors">My Impact</Link>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <Link to="/volunteer" className="p-2 text-amber-500 bg-amber-50 rounded-full hover:bg-amber-100 transition-colors relative flex items-center justify-center">
          <Bell className={`w-5 h-5 ${inviteCount > 0 ? 'animate-bounce' : ''}`} />
          {inviteCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center shadow-sm">
              {inviteCount}
            </span>
          )}
        </Link>

        {/* Profile link */}
        <Link
          to="/volunteer/profile"
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-lg text-sm font-medium transition-colors"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Profile</span>
        </Link>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-base select-none">
          {username.charAt(0).toUpperCase() || 'V'}
        </div>
      </div>
    </nav>
  );
};

export default VolunteerNav;
