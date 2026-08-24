import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookPlus, Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export const PracticeGeneratorView: React.FC = () => {
  const { generateRemedialAssignment, dbState, setActiveView, addToast } = useApp();

  const [topic, setTopic] = useState<string>('Negative Sign Handling in Linear Equations');
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedAssignment, setGeneratedAssignment] = useState<any | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const assignment = await generateRemedialAssignment(topic);
      setGeneratedAssignment(assignment);
      addToast(`Generated remedial assignment!`, 'success');
    } catch (e) {
      addToast('Failed to generate assignment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
            <BookPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Automatic Remedial Assignment Generator</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Auto-generate customized practice problem sets targeting specific class-wide misconceptions.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Target Topic / Misconception</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="e.g. Fraction Denominator Simplification"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs shadow-lg flex items-center justify-center space-x-2 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate 5 Target Questions & Assign to Class</span>
        </button>
      </div>

      {generatedAssignment && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-blue-500/40 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">{generatedAssignment.title}</h3>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Assigned to {generatedAssignment.assigned_students_count || 8} Students
            </span>
          </div>

          <div className="space-y-3">
            {generatedAssignment.questions.map((q: any, i: number) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Question {i + 1}</span>
                  <span className="text-blue-400 font-bold">{q.difficulty || 'Medium'}</span>
                </div>
                <div className="font-mono text-sm text-white font-bold">{q.question_text}</div>
                <div className="text-xs text-slate-400 italic">Correct Answer: {q.correct_answer}</div>
                <p className="text-[11px] text-slate-400">{q.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
