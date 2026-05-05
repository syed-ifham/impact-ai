import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  User, 
  ArrowLeft, 
  Upload, 
  Check, 
  ChevronRight, 
  Mail, 
  Lock, 
  Phone, 
  Globe, 
  MapPin, 
  ShieldCheck, 
  Heart,
  Calendar,
  Layers
} from 'lucide-react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [userType, setUserType] = useState(null); // null, 'ngo', 'volunteer'
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const selectionRef = useRef(null);

  // GSAP Transitions
  useEffect(() => {
    if (userType) {
      // Transition from selection to form
      gsap.to(selectionRef.current, { 
        x: -50, 
        opacity: 0, 
        display: 'none', 
        duration: 0.4, 
        ease: 'power2.in' 
      });
      gsap.fromTo(formRef.current, 
        { x: 50, opacity: 0, display: 'none' },
        { x: 0, opacity: 1, display: 'flex', duration: 0.5, delay: 0.3, ease: 'power2.out' }
      );
    } else {
      // Transition back to selection
      gsap.to(formRef.current, { 
        x: 50, 
        opacity: 0, 
        display: 'none', 
        duration: 0.4, 
        ease: 'power2.in' 
      });
      gsap.fromTo(selectionRef.current, 
        { x: -50, opacity: 0, display: 'none' },
        { x: 0, opacity: 1, display: 'flex', duration: 0.5, delay: 0.3, ease: 'power2.out' }
      );
    }
  }, [userType]);

  const handleBack = () => {
    setUserType(null);
    setAuthMode('login');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-['Space_Grotesk'] bg-slate-50" ref={containerRef}>
      {/* Main Master Auth Card */}
      <div className="w-full max-w-6xl bg-white rounded-3xl md:rounded-[3rem] shadow-2xl shadow-emerald-900/5 overflow-hidden border border-emerald-100/50 min-h-0 md:min-h-[800px] grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Dynamic Illustration/Brand Panel */}
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
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <Heart className="text-white w-6 h-6" fill="white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">Impact AI</span>
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
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="user" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                +2k
              </div>
            </div>
            <p className="text-sm font-medium text-slate-700">Joined by 2,000+ local organizations and volunteers this month.</p>
          </div>
        </div>

        {/* Right Side: Flow Content */}
        <div className="lg:col-span-7 bg-white p-6 md:p-12 lg:p-16 flex flex-col">
          
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
          <div className="flex-1 flex flex-col">
            
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
            <div ref={formRef} className="hidden flex-col h-full">
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

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 overflow-y-auto pr-2 max-h-[500px] custom-scrollbar flex-1">
                {/* Common Fields: Login */}
                <div className="space-y-4">
                  <InputField icon={<Mail />} label="Email Address" type="email" placeholder="email@example.com" required />
                  <InputField icon={<Lock />} label="Password" type="password" placeholder="••••••••" required />
                </div>

                {authMode === 'register' && (
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    {userType === 'ngo' ? (
                      /* NGO REGISTRATION FIELDS */
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField label="Organization Name" placeholder="Eco-Impact Foundation" required />
                          <InputField label="Admin Full Name" placeholder="Sarah Jenkins" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField icon={<Phone />} label="Admin Phone" placeholder="+1 (555) 000-0000" required />
                          <InputField icon={<ShieldCheck />} label="NGO Registration Number" placeholder="NGO-12345-67" required />
                        </div>
                        <InputField icon={<Globe />} label="Organization Website (Optional)" placeholder="https://www.example.org" />
                        
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-emerald-600" />
                            Area of Operation
                          </label>
                          <select className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-0 transition-all outline-none text-sm md:text-base">
                            <option>Local (Community/City)</option>
                            <option>National (Country-wide)</option>
                            <option>International</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Upload className="w-4 h-4 text-emerald-600" />
                            Verification Document
                          </label>
                          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 md:p-8 text-center hover:border-emerald-300 transition-colors group cursor-pointer bg-slate-50/50">
                            <div className="p-3 bg-white rounded-full w-fit mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                              <Upload className="w-6 h-6 text-emerald-500" />
                            </div>
                            <p className="text-sm font-medium text-slate-600 mb-1">Click or drag proof of non-profit status</p>
                            <p className="text-xs text-slate-400">PDF, JPG, PNG up to 10MB</p>
                          </div>
                        </div>

                        <TextareaField label="Mission Statement" placeholder="Tell us about your organization's goals and impact..." rows={4} />
                      </>
                    ) : (
                      /* VOLUNTEER REGISTRATION FIELDS */
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField label="Full Name" placeholder="Alex Rivera" required />
                          <InputField icon={<Phone />} label="Phone Number" placeholder="+1 (555) 000-0000" required />
                        </div>
                        <InputField icon={<MapPin />} label="Location (City/State)" placeholder="San Francisco, CA" required />

                        {/* Skills Checklist */}
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-4">Skills Assessment</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {['Logistics', 'Education', 'Food Handling', 'Tech Support', 'Marketing', 'Event Planning'].map(skill => (
                              <label key={skill} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl cursor-pointer hover:bg-emerald-50/50 transition-colors">
                                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                <span className="text-sm font-medium text-slate-600">{skill}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Availability Visual Selector */}
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            General Availability
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                              <button key={idx} type="button" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-slate-100 rounded-xl font-bold text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-all">
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Areas of Interest */}
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-4">Areas of Interest</label>
                          <div className="flex flex-wrap gap-2">
                            {['Environment', 'Elder Care', 'Youth', 'Hunger', 'Animal Welfare'].map(interest => (
                              <button key={interest} type="button" className="px-4 py-2 border border-slate-100 rounded-full text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                                {interest}
                              </button>
                            ))}
                          </div>
                        </div>

                        <TextareaField label="Motivation" placeholder="Why do you want to volunteer with us?" rows={4} />
                      </>
                    )}
                  </div>
                )}

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

              {authMode === 'login' && (
                <div className="mt-6 md:mt-8 text-center">
                  <button className="text-sm font-bold text-slate-400 hover:text-emerald-700 transition-colors">
                    Forgot your password?
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-8 md:mt-auto pt-6 md:pt-8 border-t border-slate-100 flex items-center justify-between text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-widest">
            <span>© 2026 AltruFlow Inc.</span>
            <span>Security Verified • 256-bit SSL</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
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
const InputField = ({ icon, label, type = "text", placeholder, required = false }) => (
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
        className={`w-full ${icon ? 'pl-14' : 'px-5'} py-3.5 md:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all outline-none text-slate-900 placeholder:text-slate-300 font-medium text-sm md:text-base`}
      />
    </div>
  </div>
);

const TextareaField = ({ label, placeholder, rows = 3, required = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea 
      placeholder={placeholder}
      rows={rows}
      required={required}
      className="w-full px-5 py-3.5 md:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all outline-none text-slate-900 placeholder:text-slate-300 font-medium resize-none text-sm md:text-base"
    />
  </div>
);

export default AuthPage;
