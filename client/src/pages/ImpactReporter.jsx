import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { LineChart, Loader2, ArrowLeft, BarChart2, FileCheck2, Megaphone, Bot, PenTool, HeartHandshake, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const ImpactReporter = () => {
  const [step, setStep] = useState(0); 
  const [formData, setFormData] = useState({ program: 'Tutoring', dateRange: '' });
  const [tableData, setTableData] = useState([]);
  const containerRef = useRef(null);
  const card2Ref = useRef(null);

  const isInputValid = formData.dateRange.trim().length > 0;

  useEffect(() => {
    if (isInputValid && step === 0) setStep(1);
    else if (!isInputValid && step === 1) setStep(0);
  }, [isInputValid, step]);

  useEffect(() => {
    gsap.fromTo('.stagger-animate', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
    );
  }, []);

  useEffect(() => {
    if (step === 1) {
      gsap.fromTo(card2Ref.current, 
        { opacity: 0.5, scale: 0.98, filter: 'grayscale(1)' },
        { opacity: 1, scale: 1, filter: 'grayscale(0)', duration: 0.5, ease: 'back.out(1.5)', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.1)' }
      );
    } else if (step === 0) {
      gsap.to(card2Ref.current, { opacity: 0.5, scale: 0.98, filter: 'grayscale(1)', duration: 0.3, boxShadow: 'none' });
    }
  }, [step]);

  const simulateAITask = async (payload) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { 
            id: 1, 
            period: payload.dateRange || 'Q2 2026', 
            program: payload.program || 'Tutoring', 
            metrics: '150 students, 45 tutors', 
            status: 'Draft Ready', 
            narrative: `The ${payload.program} initiative successfully expanded reach, engaging 150 students with 45 dedicated tutors during the ${payload.dateRange} period.`
          }
        ]);
      }, 2000);
    });
  };

  const handleAction = async () => {
    setStep(2);
    const data = await simulateAITask(formData);
    setTableData(data);
    setStep(3);
  };

  const onRowHover = (e) => {
    gsap.to(e.currentTarget, { backgroundColor: '#f8fafc', scale: 1.01, duration: 0.2 });
  };
  
  const onRowLeave = (e) => {
    gsap.to(e.currentTarget, { backgroundColor: 'transparent', scale: 1, duration: 0.2 });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col" ref={containerRef}>
      <header className="w-full bg-white border-b border-slate-200 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between sticky top-0 z-10 stagger-animate">
        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/" className="text-slate-400 hover:text-teal-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-teal-50">
            <ArrowLeft size={18} />
          </Link>
          <div className="bg-teal-100 p-2 md:p-2.5 rounded-lg text-teal-700">
            <LineChart size={20} md:size={24} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 truncate">Impact Report Generator</h1>
            <p className="text-xs md:text-sm text-slate-500 truncate">Synthesize data into professional narratives for stakeholders.</p>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-animate">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-full text-amber-600"><BarChart2 size={24} /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Reports Gen.</p>
              <p className="text-2xl font-bold text-slate-900">{step >= 3 ? '1' : '0'}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><FileCheck2 size={24} /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Data Synthesized</p>
              <p className="text-2xl font-bold text-slate-900">{step === 3 ? '1,200+' : '0'}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Megaphone size={24} /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Stakeholders Reached</p>
              <p className="text-2xl font-bold text-slate-900">{step === 3 ? '850' : '0'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-animate">
          <div className={`bg-white rounded-2xl p-8 border ${step >= 1 ? 'border-emerald-200 shadow-emerald-100' : 'border-slate-200 shadow-sm'} shadow-md flex flex-col relative overflow-hidden transition-colors duration-500`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Step 1: Provide Info</h2>
                <p className="text-slate-600 text-sm">Select the parameters for your report.</p>
              </div>
              <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
                <PenTool size={28} />
              </div>
            </div>
            <div className="mt-auto space-y-4">
              <select value={formData.program} onChange={(e) => setFormData({...formData, program: e.target.value})} disabled={step >= 2} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option>Food Bank</option><option>Tutoring</option><option>Shelter</option>
              </select>
              <input type="text" placeholder="Date Range (e.g., Q2 2026)" value={formData.dateRange} onChange={(e) => setFormData({...formData, dateRange: e.target.value})} disabled={step >= 2} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>

          <div ref={card2Ref} className={`bg-white rounded-2xl p-8 border border-slate-200 shadow-md flex flex-col relative transition-all duration-500 ${step === 0 ? 'opacity-50 scale-[0.98] grayscale pointer-events-none' : ''}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Step 2: Generate Result</h2>
                <p className="text-slate-600 text-sm">Let AI write the stakeholder narrative.</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-500">
                <Bot size={28} />
              </div>
            </div>
            <div className="mt-auto">
              <button 
                onClick={handleAction}
                disabled={step !== 1}
                className={`w-full py-4 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all duration-300 ${
                  step === 2 ? 'bg-indigo-500 text-white opacity-90' : 
                  step === 3 ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
                  'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                }`}
              >
                {step <= 1 && 'Summarize Impact'}
                {step === 2 && <><Loader2 size={18} className="animate-spin" /> Synthesizing Data...</>}
                {step === 3 && <><FileCheck2 size={18} /> Report Ready</>}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden stagger-animate">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Generated Reports</h3>
            <span className="text-xs font-semibold bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-500">Human Oversight</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 bg-slate-50/30">
                  <th className="px-6 py-4 font-semibold">Report Period</th>
                  <th className="px-6 py-4 font-semibold">Program</th>
                  <th className="px-6 py-4 font-semibold">Metrics Summary</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Narrative Sneak Peek</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Awaiting AI generation...</td></tr>
                ) : tableData.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 group cursor-pointer" onMouseEnter={onRowHover} onMouseLeave={onRowLeave}>
                    <td className="px-6 py-4 font-medium text-slate-900">{row.period}</td>
                    <td className="px-6 py-4 text-slate-700 font-bold">{row.program}</td>
                    <td className="px-6 py-4 text-slate-700">{row.metrics}</td>
                    <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">{row.status}</span></td>
                    <td className="px-6 py-4 text-slate-500 text-sm text-right relative group">
                      <div className="flex items-center justify-end gap-2 text-indigo-500 hover:text-indigo-700 cursor-help">
                        <Eye size={16} /> <span className="underline decoration-dotted">Hover to peek</span>
                      </div>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 w-64 p-4 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity leading-relaxed font-serif">
                        "{row.narrative}"
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <footer className="w-full bg-slate-900 text-slate-400 py-8 px-6 text-center mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300 mb-4 md:mb-0">
            <HeartHandshake size={20} />
            <span className="font-semibold">Impact AI Hub</span>
          </div>
          <p className="text-sm text-slate-500">Transforming data into compelling stories.</p>
        </div>
      </footer>
    </div>
  );
};

export default ImpactReporter;
