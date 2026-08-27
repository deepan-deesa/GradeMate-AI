import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  BrainCircuit, 
  Target, 
  Edit3, 
  MessageSquare, 
  ChevronRight, 
  HelpCircle,
  Award,
  RotateCcw,
  UserCheck
} from 'lucide-react';

export const AnalysisResultView: React.FC = () => {
  const { selectedSubmission, overrideGrade, generateTargetedPractice, setActiveView, setSelectedStudentId, addToast } = useApp();

  const [isEditingScore, setIsEditingScore] = useState<boolean>(false);
  const [overrideValue, setOverrideValue] = useState<number>(selectedSubmission?.score || 7);
  const [overrideComment, setOverrideComment] = useState<string>('');
  const [showExplainGrade, setShowExplainGrade] = useState<boolean>(false);

  if (!selectedSubmission) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-950 min-h-screen flex flex-col items-center justify-center space-y-4">
        <BrainCircuit className="w-12 h-12 text-slate-600" />
        <h3 className="text-lg font-bold text-white">No Evaluation Selected</h3>
        <p className="text-xs max-w-sm">Upload a handwritten math answer to run the AI grading and gap diagnosis engine.</p>
        <button
          onClick={() => setActiveView('upload')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Evaluate Handwritten Answer
        </button>
      </div>
    );
  }

  const sub = selectedSubmission;

  const handleSaveOverride = async () => {
    await overrideGrade(sub.id, overrideValue, overrideComment);
    setIsEditingScore(false);
  };

  const handleTriggerPractice = async () => {
    try {
      const concept = sub.learning_gap?.concept || 'Sign Handling in Algebra';
      const errorCat = sub.errors?.[0]?.category || 'Sign Error';
      await generateTargetedPractice(sub.student_id, concept, errorCat);
      setActiveView('personalized_practice');
    } catch (e) {
      addToast('Error generating practice set', 'error');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white">Evaluation Analysis for {sub.student_name}</h1>
            <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold ${
              sub.score / sub.max_score >= 0.8 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              Score: {sub.score} / {sub.max_score} Marks
            </span>
            <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>MathJS CAS Verified ({Math.round((sub.ai_confidence || 0.96) * 100)}% Confidence)</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Question: <span className="text-slate-200 font-semibold">{sub.question}</span> • Topic: {sub.topic}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTriggerPractice}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center space-x-2 transition-all"
          >
            <Target className="w-4 h-4 text-white" />
            <span>Generate Targeted Practice for {sub.student_name.split(' ')[0]}</span>
          </button>

          <button
            onClick={() => setShowExplainGrade(!showExplainGrade)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-1.5"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Why did I get this grade?</span>
          </button>
        </div>
      </div>

      {/* Explain Grade Card Modal/Accordion */}
      {showExplainGrade && (
        <div className="p-6 bg-slate-900/90 rounded-3xl border border-blue-500/40 shadow-2xl animate-in slide-in-from-top-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Score Breakdown & Rubric Rationale</span>
            </h3>
            <button onClick={() => setShowExplainGrade(false)} className="text-xs text-slate-400 hover:text-white">Close ✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sub.rubric.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{item.criterion}</span>
                  <span className="text-xs font-extrabold text-blue-400">{item.awarded_marks}/{item.max_marks}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Left Handwritten Paper & Thinking Trace, Right Step Breakdown & Diagnosis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 Cols): Handwritten Work & Thinking Trace */}
        <div className="lg:col-span-5 space-y-6">
          {/* Handwritten Work Card */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Handwritten Submission Image
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                OCR & Vision Verified
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-white p-2">
              <img src={sub.image_url} alt="Handwritten Answer" className="w-full h-auto object-contain rounded-xl" />
            </div>
          </div>

          {/* Thinking Trace Card */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span>Thinking Trace & Self-Correction</span>
              </span>
            </div>

            <div className="space-y-2">
              {sub.thinking_traces.map((trace, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-purple-300">Attempt {trace.attempt_number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      trace.status === 'Self-corrected' ? 'bg-amber-500/20 text-amber-300' : trace.status === 'Final Answer' ? 'bg-blue-500/20 text-blue-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {trace.status}
                    </span>
                  </div>
                  <div className={`font-mono text-xs ${trace.is_crossed_out ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {trace.visible_work}
                  </div>
                  <div className="text-[11px] text-slate-400 italic">{trace.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Review / Human-in-the-Loop */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Teacher Review (Human-in-the-Loop)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                AI Confidence: {Math.round((sub.ai_confidence || 0.94) * 100)}%
              </span>
            </div>

            {isEditingScore ? (
              <div className="space-y-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Override Score (out of {sub.max_score})</label>
                  <input
                    type="number"
                    value={overrideValue}
                    onChange={(e) => setOverrideValue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Teacher Comment / Notes</label>
                  <input
                    type="text"
                    value={overrideComment}
                    onChange={(e) => setOverrideComment(e.target.value)}
                    placeholder="e.g. Awarded +1 partial mark for clear intermediate substitution step."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={handleSaveOverride} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold">Save Override</button>
                  <button onClick={() => setIsEditingScore(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">
                  {sub.teacher_overridden ? `Overridden by Teacher (${sub.score}/${sub.max_score})` : 'AI Grade Accepted'}
                </span>
                <button
                  onClick={() => setIsEditingScore(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Override Grade</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Step-by-Step Breakdown, Error Classification & Gap Diagnosis */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step-by-Step Step Breakdown */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Step-by-Step Reasoning Breakdown</span>
              <span className="text-xs text-slate-400 font-normal">Partial Credit Applied</span>
            </h3>

            <div className="space-y-3">
              {sub.student_steps.map((step) => (
                <div
                  key={step.step_number}
                  className={`p-4 rounded-2xl border transition-all ${
                    step.correct
                      ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {step.correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span className="font-extrabold text-xs text-white">Step {step.step_number}</span>
                      {step.error_type && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                          {step.error_type}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-300">
                      {step.marks_awarded} / {step.max_marks} Marks
                    </span>
                  </div>

                  <div className="font-mono text-sm text-slate-100 font-semibold mb-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    {step.expression}
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{step.explanation}</p>

                  {step.math_validation && (
                    <div className="mt-2 text-[11px] text-indigo-300 bg-indigo-950/30 px-2.5 py-1 rounded-lg border border-indigo-500/20 flex items-center space-x-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Deterministic Validation: {step.math_validation.note}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Learning Gap & Error DNA Card */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Diagnosed Learning Gap</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Confidence: {Math.round((sub.learning_gap?.confidence || 0.92) * 100)}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Core Misconception</span>
                <h4 className="text-lg font-extrabold text-white">{sub.learning_gap?.concept}</h4>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <strong className="text-slate-200">Observed Evidence:</strong>
                <ul className="list-disc list-inside text-slate-400 pl-1 space-y-0.5">
                  {sub.learning_gap?.evidence.map((ev, idx) => (
                    <li key={idx}>{ev}</li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-slate-300">
                <strong className="text-slate-200">Prerequisite Weakness:</strong>{' '}
                <span className="text-amber-300 font-semibold">{sub.learning_gap?.prerequisite_weakness || 'Basic Integer Rules'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <strong className="text-blue-400">Recommended Action:</strong> {sub.learning_gap?.recommendation}
              </div>
            </div>
          </div>

          {/* Student Feedback Card */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Generated Student Feedback</span>
              </span>
              <button
                onClick={() => {
                  setSelectedStudentId(sub.student_id);
                  setActiveView('student_profile');
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
              >
                <span>View {sub.student_name.split(' ')[0]}'s Profile & DNA</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-medium">
              "{sub.feedback}"
            </div>

            {sub.socratic_hint && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
                <strong>Socratic Hint:</strong> "{sub.socratic_hint}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
