import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  User,
  ArrowLeft,
  ChevronRight,
  Mail,
  Lock,
  MapPin,

} from 'lucide-react';
import { gsap } from 'gsap';
import { useNavigate, Link } from 'react-router-dom';
import { landingPage } from "../constants/index.js";
import { auth, db } from '../firebase/firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../auth/AuthContext.jsx';

const AVATAR_LIST = [1, 2, 3, 4];

const AuthPage = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && userData) {
      if (userData.role === 'ngo') navigate('/dashboard');
      else if (userData.role === 'volunteer') navigate('/volunteer');
    }
  }, [currentUser, userData, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [adminFullName, setAdminFullName] = useState('');

  const [city, setCity] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [userType, setUserType] = useState(null); // null, 'ngo', 'volunteer'

  const [customSkill, setCustomSkill] = useState('');

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleAddCustomSkill = (e) => {
    e?.preventDefault();
    const skill = customSkill.trim();
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills(prev => [...prev, skill]);
      setCustomSkill('');
    }
  };

  const [authMode, setAuthMode] = useState('login'); // 'login', 'register'
  const [loading, setLoading] = useState(false);
  const handleBack = () => {
    setUserType(null);
    setAuthMode('login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMode === 'register' && userType === 'volunteer' && selectedSkills.length === 0) {
        throw new Error('Please select at least one skill.');
      }

      if (authMode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Cross-Role verification: ensure they logged in from the correct portal
        const uid = userCredential.user.uid;
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const role = docSnap.data().role;
          if (role !== userType) {
            await signOut(auth); // Immediately sign them out
            throw new Error(`Invalid login. You are registered as a ${role.toUpperCase()}. Please switch portals.`);
          }
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Save extra data to Firestore
        if (userType === 'volunteer') {
          await setDoc(doc(db, 'users', uid), {
            role: 'volunteer',
            fullName,
            location,
            skills: selectedSkills,
            email,
            createdAt: new Date().toISOString()
          });
        } else if (userType === 'ngo') {
          await setDoc(doc(db, 'users', uid), {
            role: 'ngo',
            adminFullName,
            city,
            email,
            createdAt: new Date().toISOString()
          });
        }
      }

      if (userType === 'ngo') navigate('/dashboard');
      else navigate('/volunteer');


    } catch (err) {
      const code = err.code || '';
      const friendlyErrors = {
        'auth/email-already-in-use':    'This email is already registered. Try logging in instead.',
        'auth/invalid-email':           'Please enter a valid email address.',
        'auth/weak-password':           'Password must be at least 6 characters.',
        'auth/wrong-password':          'Incorrect password. Please try again.',
        'auth/user-not-found':          'No account found with this email.',
        'auth/too-many-requests':       'Too many attempts. Please wait a moment and try again.',
        'auth/network-request-failed':  'Network error. Check your connection and try again.',
      };
      setError(friendlyErrors[code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerRef = useRef(null);
  const formRef = useRef(null);
  const selectionRef = useRef(null);
  //  Transitions
  useEffect(() => {
    if (userType) {
      // Instantly hide selection, fade in form
      gsap.set(selectionRef.current, { display: 'none' });
      gsap.fromTo(formRef.current,
        { x: 20, opacity: 0, display: 'flex' },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    } else {
      // Instantly hide form, fade in selection
      gsap.set(formRef.current, { display: 'none' });
      gsap.fromTo(selectionRef.current,
        { x: -20, opacity: 0, display: 'flex' },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [userType]);

  return (
    <div className="min-h-screen flex items-center justify-center font-['Space_Grotesk'] bg-slate-50" ref={containerRef}>
      {/* Main Auth Card */}
      <div className="w-full max-w-6xl bg-white rounded-3xl md:rounded-[3rem] shadow-2xl shadow-emerald-900/5 overflow-hidden border border-emerald-100/50 min-h-0 md:h-[800px] grid grid-cols-1 lg:grid-cols-12 transform scale-95 lg:scale-[0.90]">

        {/* Left Side */}
        <div style={{
          backgroundImage: "url('/images/small-robot.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}


          className="lg:col-span-5 bg-black p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Abstract Line Art Background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <circle cx="300" cy="100" r="150" fill="none" stroke="#10b981" strokeWidth="1" />
              <path d="M0 200 Q 100 150 200 200 T 400 200" fill="none" stroke="#10b981" strokeWidth="2" />
              <rect x="50" y="50" width="100" height="100" rx="20" fill="none" stroke="#10b981" strokeWidth="1" transform="rotate(15 100 100)" />
              <circle cx="50" cy="350" r="80" fill="none" stroke="#10b981" strokeWidth="1" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8 md:mb-12">
              <Link to={landingPage.nav.logo.link} className="flex items-center gap-2 text-emerald-600 hover:opacity-90 transition-opacity">
                <img src={landingPage.nav.logo.url} className="w-7 h-7 md:w-8 md:h-8" />
                <span className="font-serif text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{landingPage.nav.logo.name}</span>
              </Link>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 md:mb-6 text-slate-900">
              Empowering <br />
              <span className="text-emerald-600">Local Impact</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-md leading-relaxed">
              Connect organizations with passionate volunteers to build a more resilient community together.
            </p>
          </div>

          <div className="relative z-10 bg-white/40 backdrop-blur-md p-6 rounded-2xl md:rounded-3xl border border-white/60 mt-8 md:mt-0">
            <div className="flex -space-x-3 mb-4">
              {AVATAR_LIST.map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="user" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                +2k
              </div>
            </div>
            <p className="text-sm font-medium text-slate-700">Build the future with our local tech community.</p>
          </div>
        </div>

        {/* Right Side*/}
        <div className="lg:col-span-7 bg-white p-6 md:p-12 lg:p-16 flex flex-col h-full max-h-full overflow-hidden">

          {/* Back Button */}
          {userType ? (
            <button
              onClick={handleBack}
              className="group flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-6 md:mb-8 w-fit"
            >
              <div className="p-2 rounded-full border border-slate-100 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium">Go back</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-6 md:mb-8 w-fit"
            >
              <div className="p-2 rounded-full border border-slate-100 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium">Home</span>
            </button>
          )}

          {/* Flow Area */}
          <div className="flex-1 flex flex-col min-h-0">

            {/* INITIAL ENTRY: Selection Screen */}
            <div ref={selectionRef} className="flex flex-col h-full">
              <div className="mb-8 md:mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4">Get Started</h2>
                <p className="text-slate-500 text-base md:text-lg">Choose how you want to use Impact AI to begin your journey.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1">
                {/* NGO Card */}
                <button
                  onClick={() => setUserType('ngo')}
                  className="group relative flex flex-col p-6 md:p-8 bg-white border-2 border-slate-100 rounded-3xl md:rounded-[2.5rem] text-left transition-all hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10"
                >
                  <div className="mb-6 md:mb-8 p-4 md:p-5 bg-emerald-50 rounded-2xl w-fit text-emerald-600 group-hover:scale-110 transition-transform">
                    <Building2 className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3">NGO Organization</h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-6 md:mb-8 flex-1">Manage operations, coordinate volunteers, and scale your social impact.</p>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <span>Admin Access</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Volunteer Card */}
                <button
                  onClick={() => setUserType('volunteer')}
                  className="group relative flex flex-col p-6 md:p-8 bg-white border-2 border-slate-100 rounded-3xl md:rounded-[2.5rem] text-left transition-all hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10"
                >
                  <div className="mb-6 md:mb-8 p-4 md:p-5 bg-emerald-50 rounded-2xl w-fit text-emerald-600 group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3">Individual Volunteer</h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-6 md:mb-8 flex-1">Discover opportunities, track your hours, and make a real difference.</p>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <span>Volunteer Access</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              <div className="mt-8 md:mt-12 text-center text-slate-500 text-sm md:text-base">
                Already have an account? <button
                  onClick={() => {
                    setUserType('volunteer');
                    setAuthMode('login');
                  }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </div>

            {/* FORM AREA: NGO or Volunteer */}
            <div ref={formRef} className="hidden flex-col h-full min-h-0">
              <div className="mb-8 md:mb-10">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                    {userType === 'ngo' ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                </div>
                <p className="text-slate-500 text-sm md:text-base">
                  {authMode === 'login'
                    ? `Sign in to your ${userType === 'ngo' ? 'NGO' : 'Volunteer'} workspace.`
                    : `Complete the details below to register as a ${userType === 'ngo' ? 'NGO Admin' : 'Volunteer'}.`
                  }
                </p>
              </div>

              {/* Form Toggle */}
              <div className="flex p-1 bg-slate-100 rounded-2xl mb-6 md:mb-8 w-fit">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`px-6 md:px-8 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`px-6 md:px-8 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${authMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0">
                {/* Common Fields: Login */}
                <div className="space-y-4">
                  <InputField icon={<Mail />} label="Email Address" type="email" placeholder="email@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  <InputField icon={<Lock />} label="Password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                {authMode === 'register' && (
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    {userType === 'ngo' ? (
                      /* NGO REGISTRATION FIELDS */
                      <>
                        <InputField label="Admin Full Name" placeholder="Sarah Jenkins" required value={adminFullName} onChange={(e) => setAdminFullName(e.target.value)} />
                        <InputField icon={<MapPin />} label="City (Optional)" placeholder="San Francisco, CA" value={city} onChange={(e) => setCity(e.target.value)} />
                      </>
                    ) : (
                      /* VOLUNTEER REGISTRATION FIELDS */
                      <>
                        <InputField label="Full Name" placeholder="Alex Rivera" required value={fullName} onChange={(e) => setFullName(e.target.value)} />

                        {/* Skills Builder */}
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Skills & Expertise <span className="text-red-500">*</span>
                          </label>
                          <p className="text-xs text-slate-500 mb-4">Type a skill and press Add (e.g. "React", "First Aid")</p>
                          
                          <div className="flex gap-2 mb-4">
                            <input
                              type="text"
                              value={customSkill}
                              onChange={(e) => setCustomSkill(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCustomSkill(e);
                                }
                              }}
                              placeholder="Add your skills..."
                              className="flex-1 px-5 py-3.5 md:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none text-slate-900 placeholder:text-slate-300 font-medium text-sm md:text-base"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomSkill}
                              className="px-6 py-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold rounded-2xl transition-colors text-sm"
                            >
                              Add
                            </button>
                          </div>

                          {/* Common Suggestions */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {['Medical', 'Teaching', 'Driving', 'IT Support', 'AI', 'Fundraising', 'Logistics', 'Food Handling', 'Event Planning', 'Disaster Relief', 'Animal Care'].map(skill => (
                              !selectedSkills.includes(skill) && (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={() => toggleSkill(skill)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200"
                                >
                                  + {skill}
                                </button>
                              )
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {selectedSkills.map(skill => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => toggleSkill(skill)}
                                className="px-4 py-2 bg-emerald-600 border-emerald-600 text-white rounded-full text-sm font-medium shadow-md flex items-center gap-2 hover:bg-red-500 hover:border-red-500 transition-colors group"
                                title="Click to remove"
                              >
                                {skill} <span className="text-emerald-200 group-hover:text-white">×</span>
                              </button>
                            ))}
                            {selectedSkills.length === 0 && (
                              <span className="text-sm text-slate-400 italic">No skills added yet...</span>
                            )}
                          </div>
                        </div>

                        <InputField icon={<MapPin />} label="Location (City/State) (Optional)" placeholder="Kolkata ,WB" value={location} onChange={(e) => setLocation(e.target.value)} />
                      </>
                    )}
                  </div>
                )}

                {error && <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 md:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-base md:text-lg shadow-lg shadow-emerald-900/10 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-6 md:mt-8"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Forget Pass */}
              {authMode === 'login' && (
                <div className="mt-6 md:mt-8 text-center" title='coming soon'>
                  <button className="text-sm font-bold text-slate-400 hover:text-emerald-700 transition-colors">
                    Forgot your password?
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Footer Branding */}
          {/* <div className="mt-8 md:mt-auto pt-6 md:pt-8 border-t border-slate-100 flex items-center justify-between text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-widest">
            <span>© 2026 AltruFlow Inc.</span>
            <span>Security Verified • 256-bit SSL</span>
          </div> */}

        </div>
      </div>

      {/* SCrollbar*/}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}} />
    </div>
  );
};

// Helper Components
const InputField = ({ icon, label, type = "text", placeholder, required = false, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {icon && (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
          {React.cloneElement(icon, { size: 18 })}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className={`w-full ${icon ? 'pl-14' : 'px-5'} py-3.5 md:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all outline-none text-slate-900 placeholder:text-slate-300 font-medium text-sm md:text-base`}
      />
    </div>
  </div>
);

const TextareaField = ({ label, placeholder, rows = 3, required = false, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      placeholder={placeholder}
      rows={rows}
      required={required}
      value={value}
      onChange={onChange}
      className="w-full px-5 py-3.5 md:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all outline-none text-slate-900 placeholder:text-slate-300 font-medium resize-none text-sm md:text-base"
    />
  </div>
);

export default AuthPage;
