import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Leaf, ArrowRight, Play, CheckCircle2, Menu, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Link to="/" className="flex items-center gap-2 text-emerald-600 hover:opacity-90 transition-opacity">
            <img src='/favicon.svg' className="w-7 h-7 md:w-8 md:h-8" />
            <span className="font-serif text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Impact AI</span>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">How it works</a>
            <a href="#impact" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Impact</a>
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Features</a>
          </div>

          {/* Right Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => navigate('/auth')}
              className="text-slate-600 text-sm font-medium px-4 hover:text-emerald-600 transition-colors"
            >
              Sign in
            </button>
            <button onClick={() => navigate('/dashboard')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Content */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <a href="#how-it-works" className="text-lg font-medium text-slate-900" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#impact" className="text-lg font-medium text-slate-900" onClick={() => setMobileMenuOpen(false)}>Impact</a>
            <a href="#features" className="text-lg font-medium text-slate-900" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
              <button 
                onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-bold"
              >
                Sign In
              </button>
              <button 
                onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20"
              >
                Get Started
              </button>
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
            alt="NGO community work"
            className="w-full h-fit object-cover object-center"
          />
          <div className="absolute inset-0 bg-slate-900/75 mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          {/* Eyebrow */}
          <div className="gsap-hero-elem inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wide text-emerald-50 uppercase">AI-powered administrative relief</span>
          </div>

          {/* Main Headline */}
          <h1 className="gsap-hero-elem font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 max-w-4xl">
            Automate the busywork.<br />
            <span className="text-emerald-400 italic">Amplify the impact.</span>
          </h1>

          {/* Subtitle */}
          <p className="gsap-hero-elem text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed font-light">
            Our platform uses AI to organize donor emails, match volunteers, and draft grants, so your team can focus on what actually matters—helping people.
          </p>

          {/* Buttons */}
          <div className="gsap-hero-elem flex flex-col sm:flex-row items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium text-lg transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 group">
              Explore AI Tools
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/30 hover:bg-white/10 text-white rounded-full font-medium text-lg transition-all flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-white/80" />
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* 3. "The Problem" Split Section */}
      <section className="py-24 lg:py-32 px-6 bg-white" id="problem">
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
                  "Millions of hours are lost to administrative silos — not because the passion isn't there, but because the data is overwhelming."
                </p>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -z-10 top-1/2 -left-12 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          </div>

          {/* Right Side (Text) */}
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <span className="gsap-fade-up text-sm font-bold tracking-widest text-emerald-600 uppercase mb-4">The Problem</span>
            <h2 className="gsap-fade-up font-serif text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
              Data is scattered.<br />
              <span className="text-emerald-500 italic">Help is delayed.</span>
            </h2>
            <p className="gsap-fade-up text-lg text-slate-600 leading-relaxed mb-8">
              NGOs collect massive amounts of data, but without automation, it sits in inboxes and spreadsheets.
            </p>

            <ul className="space-y-5">
              {[
                "Donor emails take days to sort and reply to.",
                "Volunteer matching is done manually on spreadsheets.",
                "Grant proposals require weeks of repetitive drafting.",
                "Teams burn out from admin, not the mission."
              ].map((item, index) => (
                <li key={index} className="gsap-fade-up flex items-start gap-4 text-slate-700 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-base font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* 4. The Big CTA Block */}
      <section className="gsap-fade-up py-24 px-6 bg-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-4xl lg:text-6xl font-bold text-white mb-6">
            Ready to reclaim your time?
          </h2>
          <p className="text-xl text-emerald-50 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Join our platform—whether you need to organize your inbox, schedule events, or match volunteers automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-emerald-800 rounded-full font-bold text-lg transition-transform hover:-translate-y-1 shadow-xl shadow-emerald-900/20">
              Launch Workspace
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-medium text-lg transition-colors border border-emerald-500/50">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-slate-900 pt-16 pb-8 px-6 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white">
            <img src='/favicon.svg' className="w-8 h-8 text-emerald-500" />
            {/* <Leaf className="w-6 h-6 text-emerald-500" /> */}
            <span className="font-serif text-xl font-bold">Impact AI</span>
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
