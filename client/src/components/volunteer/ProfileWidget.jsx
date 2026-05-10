import { Link } from 'react-router-dom';
import { MapPin, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useAuth } from '../../auth/AuthContext';

const ProfileWidget = () => {
  const { userData } = useAuth();
  const username = userData?.fullName || 'Volunteer';

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) { console.error(e); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Cover */}
      <div className="h-24 bg-gradient-to-r from-emerald-400 to-teal-300" />
      <div className="px-5 pb-5 flex flex-col items-center text-center relative mt-[-2.5rem]">
        {/* Avatar */}
        <div className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-3xl border-4 border-white shadow-md select-none mb-3 z-10">
          {username.charAt(0).toUpperCase()}
        </div>

        <div className="w-full">
          <h3 className="font-serif font-bold text-xl text-slate-900 truncate">{username}</h3>
          {userData?.location && (
            <p className="text-slate-400 text-sm flex items-center justify-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" /> {userData.location}
            </p>
          )}
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mt-3 mb-4 bg-emerald-50 py-1 px-3 rounded-full inline-block">Volunteer</p>

          {/* Skills chips */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-5">
            {userData?.skills?.slice(0, 3).map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-medium border border-slate-100">
                {skill}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/volunteer/profile"
              className="block text-center w-full py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl transition-colors text-sm"
            >
              View Full Profile →
            </Link>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-white border border-red-100 text-red-500 hover:bg-red-50 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileWidget;
