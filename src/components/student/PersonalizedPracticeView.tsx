import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Target, Sparkles, CheckCircle2, XCircle, ArrowRight, HelpCircle, TrendingUp, Loader2, Award } from 'lucide-react';

export const PersonalizedPracticeView: React.FC = () => {
  const { activePracticeSet, submitPracticeAnswers, addToast, setActiveView } = useApp();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeHintIndex, setActiveHintIndex] = useState<number | null>(null);

  if (!activePracticeSet) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-950 min-h-screen flex flex-col items-center justify-center space-y-4">
        <Target className="w-12 h-12 text-slate-600" />
        <h3 className="text-lg font-bold text-white">No Active Practice Set</h3>
        <p className="text-xs max-w-sm">Ask your teacher or click "Generate Targeted Practice" to start.</p>
      </div>
    );
  }

  const ps = activePracticeSet;

  const handleOptionSelect = (qId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmitAnswers = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitPracticeAnswers(ps.id, answers);
      setSubmittedResult(res);
      addToast('Submitted practice set!', 'success');
    } catch (e) {
      addToast('Failed to submit practice', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* "Why am I practicing this?" Transparent Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 to-purple-950/60 p-6 rounded-3xl border border-amber-500/40 shadow-xl space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <h1 className="text-xl font-extrabold text-white">Targeted Remedial Practice: {ps.topic}</h1>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <strong className="text-amber-300">Why am I practicing this?</strong> {ps.target_reason}
        </div>
      </div>

      {/* Improvement Measurement Chart Header (If Submitted) */}
      {submittedResult && (
        <div className="p-6 bg-slate-900 rounded-3xl border border-emerald-500/40 shadow-2xl space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Reassessment & Mastery Improvement Measured!</h3>
            </div>
            <span className="text-xs font-extrabold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              +{submittedResult.improvementDelta}% Mastery Delta
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">Initial Assessment Mastery</span>
              <span className="text-2xl font-extrabold text-rose-400">{submittedResult.beforeAccuracy}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
              <span className="text-xs text-emerald-300 font-medium block">Post-Intervention Mastery</span>
              <span className="text-2xl font-extrabold text-emerald-400">{submittedResult.afterAccuracy}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Question List */}
      <div className="space-y-6">
        {ps.questions.map((q, idx) => {
          const studentAns = answers[q.id];
          const isSubmitted = !!submittedResult || ps.completed;
          const isCorrect = String(studentAns) === String(q.correct_option) || !!q.is_correct;

          return (
            <div
              key={q.id}
              className={`p-6 rounded-3xl bg-slate-900 border transition-all space-y-4 ${
                isSubmitted
                  ? isCorrect
                    ? 'border-emerald-500/50 bg-slate-900/90'
                    : 'border-rose-500/50 bg-slate-900/90'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Question {idx + 1} of {ps.questions.length}</span>
                {isSubmitted && (
                  <span className={`text-xs font-bold flex items-center space-x-1 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                  </span>
                )}
              </div>

              <div className="font-mono text-base font-extrabold text-white">{q.question_text}</div>

              {/* Options or Input */}
              {(() => {
                const getOptions = () => {
                  if (q.options && q.options.length > 0) return q.options;
                  const ans = q.expected_final_answer;
                  if (ans === '6') return ['6', '5', '8', '-6'];
                  if (ans === 'x + 5') return ['x + 5', '-x + 5', 'x - 5', '2x + 5'];
                  if (ans === '-5') return ['-5', '5', '-10', '10'];
                  if (ans === '-x + 6') return ['-x + 6', 'x + 6', '-x - 6', 'x - 6'];
                  return [ans, `-${ans}`, `${Number(ans) + 2 || '2'}`, '0'];
                };
                const options = getOptions();

                return (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {options.map((opt, optIdx) => {
                        const isSelected = studentAns === opt;
                        return (
                          <button
                            key={optIdx}
                            disabled={isSubmitted}
                            onClick={() => handleOptionSelect(q.id, opt)}
                            className={`p-3.5 rounded-2xl text-xs font-medium border text-left transition-all font-mono ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-400 shadow-md font-bold'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-400">Or type answer:</span>
                      <input
                        type="text"
                        disabled={isSubmitted}
                        value={studentAns || ''}
                        onChange={(e) => handleOptionSelect(q.id, e.target.value)}
                        placeholder="Type final answer..."
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Socratic Hint Button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setActiveHintIndex(activeHintIndex === idx ? null : idx)}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Need a Hint?</span>
                </button>

                {isSubmitted && q.explanation && (
                  <p className="text-[11px] text-slate-400 italic max-w-md">{q.explanation}</p>
                )}
              </div>

              {activeHintIndex === idx && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 animate-in fade-in-50">
                  <strong className="text-amber-300">Socratic Guidance:</strong> {q.hint}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!submittedResult && !ps.completed && (
        <button
          onClick={handleSubmitAnswers}
          disabled={isSubmitting || Object.keys(answers).length < ps.questions.length}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-xl flex items-center justify-center space-x-2 transition-all"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Submit Practice & Measure My Improvement</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
