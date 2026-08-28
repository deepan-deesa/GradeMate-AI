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
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-[#FDFCF8] min-h-screen text-[#222521] font-sans">
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#FAF0E6] text-[#C88A58] rounded-2xl border border-[#E8CEB5]">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-[#222521]">What-If Teaching Simulator</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5] text-xs font-bold">
                Predictive AI
              </span>
            </div>
            <p className="text-[#545850] text-xs mt-0.5 font-medium">
              Simulate curriculum transitions and predict student readiness based on current prerequisite mastery.
            </p>
          </div>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#222521] flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#C88A58]" />
          <span>Ask the Teaching Simulator</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Can I move to quadratic equations tomorrow?"
            className="w-full bg-[#FDFCF8] border border-[#E0DED7] rounded-2xl px-4 py-3 text-sm text-[#222521] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white font-bold rounded-2xl text-xs shadow-xs flex items-center justify-center space-x-2 transition-all shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4 text-amber-300" />}
            <span>Run Simulation</span>
          </button>
        </div>

        {/* Sample Query Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-[11px] font-bold text-[#6E7269] self-center">Try Sample:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(sq);
                handleAsk(sq);
              }}
              className="px-3 py-1 rounded-xl bg-[#FDFCF8] border border-[#E0DED7] hover:border-[#2D4A3E] text-[11px] text-[#545850] font-medium transition-colors"
            >
              "{sq}"
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Result */}
      {result && (
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#C2D4C1] shadow-md space-y-6 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                result.readiness_status === 'READY' ? 'bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]' : result.readiness_status === 'NEEDS REVISION' ? 'bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]' : 'bg-[#FDF0EE] text-[#8C2B22] border border-[#ECC4C1]'
              }`}>
                Simulation Decision: {result.readiness_status}
              </span>
            </div>
            <span className="text-xs text-[#6E7269] font-bold">Predicted Readiness: {result.predicted_readiness_percentage}%</span>
          </div>

          <div>
            <h3 className="text-lg font-black text-[#222521] mb-2">{result.recommendation}</h3>
            <p className="text-xs text-[#545850] leading-relaxed bg-[#FDFCF8] p-4 rounded-2xl border border-[#E0DED7]">
              {result.detailed_analysis}
            </p>
          </div>

          {/* Prerequisite Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#6E7269] uppercase tracking-wider">Prerequisite Mastery Evidence</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.prerequisites.map((p: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#222521]">{p.concept}</span>
                    <span className="text-[10px] text-[#6E7269] block">{p.status}</span>
                  </div>
                  <span className={`text-xs font-black ${p.mastery >= 75 ? 'text-[#2D4A3E]' : 'text-[#C88A58]'}`}>
                    {p.mastery}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#E0DED7]">
            <button
              onClick={handleCreateRemedialFromSimulator}
              className="px-5 py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white font-bold rounded-2xl text-xs shadow-xs flex items-center space-x-2"
            >
              <span>Create Recommended Remedial Assignment</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
