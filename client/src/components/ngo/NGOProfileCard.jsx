import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';
import {
  LayoutDashboard, Mail, Users, Plus,
  Calendar, LogOut, Building2, FileScan, MapPin, ListTodo
} from 'lucide-react';

/**
 * Sidebar profile card for NGO users.
 * Reads adminFullName and city from Firestore via useAuth().
 */
const NGOProfileCard = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const name     = userData?.adminFullName || 'NGO Admin';
  const city     = userData?.city         || '';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Profile card */}
      <div className="p-5 pb-2 shrink-0">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30 shrink-0 select-none">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{name}</p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 truncate">
              <Building2 className="w-3 h-3 shrink-0" />
              {city ? `NGO · ${city}` : 'NGO Account'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
        <p className="px-4 text-xs font-semibold text-slate-500 tracking-wider mb-3 mt-1">MAIN MENU</p>
        {[
          { to: '/dashboard',                  end: true, icon: LayoutDashboard, label: 'Dashboard'        },
          { to: '/dashboard/manage-tasks',           icon: ListTodo,         label: 'Manage Tasks'     },
          { to: '/dashboard/post-task',              icon: Plus,             label: 'Post Task'        },
          { to: '/dashboard/volunteer-matcher',            icon: Users,            label: 'Find Volunteers'  },
          { to: '/dashboard/scan-document',                icon: FileScan,         label: 'Scan Document'    },
          { to: '/dashboard/live-map',                     icon: MapPin,           label: 'Live Map'         },
          { to: '/dashboard/email-organizer',             icon: Mail,             label: 'Inbox Organizer'  },
          { to: '/dashboard/event-scheduler',              icon: Calendar,         label: 'Event Scheduler'  },
        ].map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                isActive
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-slate-800/60 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default NGOProfileCard;
