import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Brain, Sparkles, AlertTriangle, CheckCircle2, ArrowRight, Loader2, HelpCircle } from 'lucide-react';

export const TeachingSimulatorView: React.FC = () => {
  const { askSimulator, addToast, generateRemedialAssignment, setActiveView } = useApp();

  const [query, setQuery] = useState<string>('Can I move to quadratic equations tomorrow?');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  const sampleQueries = [
    'Can I move to quadratic equations tomorrow?',
    'Will student Rahul pass linear equations test without remedial practice?',
    'What happens if I spend 15 mins reviewing negative sign rules tomorrow?',
    'Which 3 students need immediate one-on-one intervention in fractions?',
  ];

  const handleAsk = async (qText?: string) => {
    const finalQuery = qText || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    try {
      const res = await askSimulator(finalQuery);
      setResult(res);
      addToast('Simulator completed decision analysis!', 'success');
    } catch (e) {
      addToast('Simulator query failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRemedialFromSimulator = async () => {
    if (result) {
      await generateRemedialAssignment('Quadratic Prerequisites');
      setActiveView('practice_generator');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">What-If Teaching Simulator</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                Predictive AI
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Simulate curriculum transitions and predict student readiness based on current prerequisite mastery.
            </p>
          </div>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Ask the Teaching Simulator</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Can I move to quadratic equations tomorrow?"
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs shadow-lg flex items-center justify-center space-x-2 transition-all shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            <span>Run Simulation</span>
          </button>
        </div>

        {/* Sample Query Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-[11px] font-bold text-slate-400 self-center">Try Sample:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(sq);
                handleAsk(sq);
              }}
              className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 text-[11px] text-slate-300 transition-colors"
            >
              "{sq}"
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Result */}
      {result && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-purple-500/40 shadow-2xl space-y-6 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                result.readiness_status === 'READY' ? 'bg-emerald-500/20 text-emerald-300' : result.readiness_status === 'NEEDS REVISION' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                Simulation Decision: {result.readiness_status}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Predicted Readiness: {result.predicted_readiness_percentage}%</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">{result.recommendation}</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {result.detailed_analysis}
            </p>
          </div>

          {/* Prerequisite Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Prerequisite Mastery Evidence</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.prerequisites.map((p: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">{p.concept}</span>
                    <span className="text-[10px] text-slate-400 block">{p.status}</span>
                  </div>
                  <span className={`text-xs font-extrabold ${p.mastery >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {p.mastery}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              onClick={handleCreateRemedialFromSimulator}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs shadow-md flex items-center space-x-2"
            >
              <span>Create Recommended Remedial Assignment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
