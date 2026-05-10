import  { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Play, CheckCircle2, Menu, X, ArrowUpRight, Building2, Users } from 'lucide-react';
import { landingPage, tools } from '../constants';
import { useAuth } from '../auth/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleSmoothScroll = (e, link) => {
    if (link.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(link);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.gsap-fade-up').forEach((elem) => {
        gsap.fromTo(
          elem,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: elem,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Hero section specific staggered animation
      gsap.fromTo(
        '.gsap-hero-elem',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.1
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-emerald-50/30 text-slate-800 font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden" ref={containerRef}>
      {/* 1. Global Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to={landingPage.nav.logo.link} className="flex items-center gap-2 text-emerald-600 hover:opacity-90 transition-opacity">
            <img src={landingPage.nav.logo.url} className="w-7 h-7 md:w-8 md:h-8" alt="Logo" />
            <span className="font-serif text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{landingPage.nav.logo.name}</span>
          </Link>

          {/* Center Links  */}
          <div className="hidden md:flex items-center gap-8">
            {Object.values(landingPage.nav.links).map((link, index) => (
              <a 
                key={index} 
                href={link.link} 
                onClick={(e) => handleSmoothScroll(e, link.link)}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Actions  */}
          <div className="hidden md:flex items-center gap-6">
            {currentUser ? (
              <>
                <button
                  onClick={handleLogout}
                  className="text-slate-600 text-sm font-medium px-4 hover:text-red-600 transition-colors"
                >
                  Log out
                </button>
                <button onClick={() => navigate('/dashboard')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-slate-600 text-sm font-medium px-4 hover:text-emerald-600 transition-colors"
                >
                  Sign in
                </button>
                <button onClick={() => navigate('/auth')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Content */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
            {Object.values(landingPage.nav.links).map((link, index) => (
              <a 
                key={index} 
                href={link.link} 
                className="text-lg font-medium text-slate-900" 
                onClick={(e) => { setMobileMenuOpen(false); handleSmoothScroll(e, link.link); }}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
              {currentUser ? (
                <>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold"
                  >
                    Log Out
                  </button>
                  <button
                    onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20"
                  >
                    Go to Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                    className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-bold"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/small-robot.avif"
            alt={landingPage.hero.imageAlt}
            className="w-full h-fit object-cover object-center"
          />
          <div className="absolute inset-0 bg-slate-900/75 mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          {/* Eyebrow */}
          <div className="gsap-hero-elem inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wide text-emerald-50 uppercase">{landingPage.hero.eyebrow}</span>
          </div>

          {/* Main Headline */}
          <h1 className="gsap-hero-elem font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 max-w-4xl">
            {landingPage.hero.headline.main}<br />
            <span className="text-emerald-400 italic">{landingPage.hero.headline.highlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="gsap-hero-elem text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed font-light">
            {landingPage.hero.subtitle}
          </p>

          {/* Buttons */}
          <div className="gsap-hero-elem flex flex-col sm:flex-row items-center gap-4 mt-4 w-full justify-center">
            <button 
              onClick={() => navigate('/auth')} 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.7)] flex items-center justify-center gap-3 group hover:-translate-y-1"
            >
              <Building2 className="w-5 h-5 fill-white/20" />
              {landingPage.hero.primaryCTA}
              <ArrowRight className="w-5 h-5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </button>
            <button 
              onClick={() => navigate('/auth')} 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/15 border border-white/20 backdrop-blur-md text-white rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-3 group hover:-translate-y-1 shadow-lg hover:shadow-xl hover:border-white/40"
            >
              <Users className="w-5 h-5" />
              {landingPage.hero.secondaryCTA}
              <ArrowRight className="w-5 h-5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. The Problem Section */}
      <section className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Side (Visual) */}
          <div className="gsap-fade-up relative order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-4/5 lg:aspect-square">
              <img
                src='/images/team.avif'
                alt="Office paperwork and busy community scene"
                className="w-full h-full object-cover"
              />
              {/* Glassmorphism Caption */}
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10">
                <p className="text-white text-sm md:text-base leading-relaxed font-medium">
                  "{landingPage.problem.quote}"
                </p>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -z-10 top-1/2 -left-12 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          </div>

          {/* Right Side (Text) */}
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <span className="gsap-fade-up text-sm font-bold tracking-widest text-emerald-600 uppercase mb-4">{landingPage.problem.eyebrow}</span>
            <h2 className="gsap-fade-up font-serif text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
              {landingPage.problem.headline.main}<br />
              <span className="text-emerald-500 italic">{landingPage.problem.headline.highlight}</span>
            </h2>
            <p className="gsap-fade-up text-lg text-slate-600 leading-relaxed mb-8">
              {landingPage.problem.subtitle}
            </p>

            <ul className="space-y-5">
              {landingPage.problem.points.map((item, index) => (
                <li key={index} className="gsap-fade-up flex items-start gap-4 text-slate-700 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-base font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-24 lg:py-32 px-6 bg-slate-50" id="how-it-works">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <span className="gsap-fade-up text-sm font-bold tracking-widest text-emerald-600 uppercase mb-4 block">{landingPage.howItWorks.eyebrow}</span>
            <h2 className="gsap-fade-up font-serif text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              {landingPage.howItWorks.headline.main} <span className="text-emerald-500 italic">{landingPage.howItWorks.headline.highlight}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {landingPage.howItWorks.steps.map((step, index) => (
              <div key={index} className="gsap-fade-up relative flex flex-col gap-4 group">
                <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-100 text-emerald-600 font-bold text-2xl flex items-center justify-center shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-2">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
                {/* Arrow connector for md and larger */}
                {index < landingPage.howItWorks.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-2rem)] w-[calc(100%-1rem)] h-[1px] bg-emerald-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Features / Tools */}
      <section className="py-24 lg:py-32 px-6 bg-white" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <span className="gsap-fade-up text-sm font-bold tracking-widest text-emerald-600 uppercase mb-4 block">{landingPage.features.eyebrow}</span>
            <h2 className="gsap-fade-up font-serif text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              {landingPage.features.headline.main} <span className="text-emerald-500 italic">{landingPage.features.headline.highlight}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <div key={index} className="gsap-fade-up bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:bg-emerald-50/50 hover:border-emerald-100 transition-all duration-300 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{tool.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">{tool.description}</p>
                  <div className="inline-flex items-center gap-2 text-emerald-600 font-medium text-sm group-hover:gap-3 transition-all">
                    Learn more <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Impact / Results */}
      <section className="py-24 lg:py-32 px-6 bg-slate-900 text-white relative overflow-hidden" id="impact">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-900 to-slate-900"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <span className="gsap-fade-up text-sm font-bold tracking-widest text-emerald-400 uppercase mb-4 block">{landingPage.impact.eyebrow}</span>
              <h2 className="gsap-fade-up font-serif text-4xl lg:text-5xl font-bold text-white leading-tight mb-8">
                {landingPage.impact.headline.main} <span className="text-emerald-400 italic">{landingPage.impact.headline.highlight}</span>
              </h2>
              <button onClick={() => navigate('/auth')} className="gsap-fade-up px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium text-lg transition-all shadow-lg shadow-emerald-500/25 inline-flex items-center gap-2 group">
                See Our Case Studies <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {landingPage.impact.stats.map((stat, index) => (
                <div key={index} className="gsap-fade-up bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
                  <p className="text-4xl lg:text-5xl font-bold text-emerald-400 mb-2">{stat.value}</p>
                  <p className="text-slate-300 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. The Big CTA Block */}
      <section className="gsap-fade-up py-24 px-6 bg-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-4xl lg:text-6xl font-bold text-white mb-6">
            {landingPage.cta.headline}
          </h2>
          <p className="text-xl text-emerald-50 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            {landingPage.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-emerald-800 rounded-full font-bold text-lg transition-transform hover:-translate-y-1 shadow-xl shadow-emerald-900/20">
              {landingPage.cta.primaryCTA}
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-medium text-lg transition-colors border border-emerald-500/50">
              {landingPage.cta.secondaryCTA}
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-slate-900 pt-16 pb-8 px-6 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white">
            <img src={landingPage.nav.logo.url} className="w-8 h-8 text-emerald-500" alt="Logo" />
            <span className="font-serif text-xl font-bold">{landingPage.nav.logo.name}</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Impact AI. Empowering the people who help people.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
