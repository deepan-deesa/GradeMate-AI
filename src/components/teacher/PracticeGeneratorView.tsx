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
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-[#FDFCF8] min-h-screen text-[#222521] font-sans">
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#2D4A3E]/10 text-[#2D4A3E] rounded-2xl border border-[#C2D4C1]">
            <BookPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#222521]">Automatic Remedial Assignment Generator</h1>
            <p className="text-[#545850] text-xs mt-0.5 font-medium">
              Auto-generate customized practice problem sets targeting specific class-wide misconceptions.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#222521] mb-1">Target Topic / Misconception</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-[#FDFCF8] border border-[#E0DED7] rounded-2xl px-4 py-3 text-sm text-[#222521] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
            placeholder="e.g. Fraction Denominator Simplification"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white font-bold rounded-2xl text-xs shadow-xs flex items-center justify-center space-x-2 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
          <span>Generate 5 Target Questions & Assign to Class</span>
        </button>
      </div>

      {generatedAssignment && (
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#C2D4C1] shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
            <h3 className="font-bold text-[#222521] text-base">{generatedAssignment.title}</h3>
            <span className="text-xs text-[#1E3A2B] font-bold bg-[#EAF0E8] px-2.5 py-1 rounded-full border border-[#C2D4C1]">
              Assigned to {generatedAssignment.assigned_students_count || 8} Students
            </span>
          </div>

          <div className="space-y-3">
            {generatedAssignment.questions.map((q: any, i: number) => (
              <div key={i} className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7] space-y-1">
                <div className="flex items-center justify-between text-xs text-[#6E7269] font-bold">
                  <span>Question {i + 1}</span>
                  <span className="text-[#2D4A3E] font-black">{q.difficulty || 'Medium'}</span>
                </div>
                <div className="font-mono text-sm text-[#222521] font-bold">{q.question_text}</div>
                <div className="text-xs text-[#8C521F] italic font-semibold">Correct Answer: {q.correct_answer}</div>
                <p className="text-[11px] text-[#545850]">{q.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
