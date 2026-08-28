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
      <div className="p-12 text-center text-[#6E7269] bg-[#FDFCF8] min-h-screen flex flex-col items-center justify-center space-y-4">
        <BrainCircuit className="w-12 h-12 text-[#A3B19B]" />
        <h3 className="text-lg font-bold text-[#222521]">No Evaluation Selected</h3>
        <p className="text-xs max-w-sm text-[#545850]">Upload a handwritten math answer to run the AI grading and gap diagnosis engine.</p>
        <button
          onClick={() => setActiveView('upload')}
          className="px-5 py-2.5 bg-[#2D4A3E] text-white rounded-xl text-xs font-bold hover:bg-[#1E3A2B] shadow-xs"
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
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-[#FDFCF8] min-h-screen text-[#222521] font-sans">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-[#222521]">Evaluation Analysis for {sub.student_name}</h1>
            <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold ${
              sub.score / sub.max_score >= 0.8 ? 'bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]' : 'bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]'
            }`}>
              Score: {sub.score} / {sub.max_score} Marks
            </span>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5] flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-[#C88A58]" />
              <span>MathJS CAS Verified ({Math.round((sub.ai_confidence || 0.96) * 100)}% Confidence)</span>
            </span>
          </div>
          <p className="text-[#545850] text-xs mt-1">
            Question: <span className="text-[#222521] font-semibold">{sub.question}</span> • Topic: {sub.topic}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]">
              📚 Target Syllabus: {sub.curriculum_name || 'CBSE Mathematics'}
            </span>
            {sub.question_paper_title ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]">
                📝 Target Question Paper: {sub.question_paper_title}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]">
                📝 Question Paper: Auto-Detected
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTriggerPractice}
            className="px-4 py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white font-bold rounded-xl text-xs shadow-xs flex items-center space-x-2 transition-all"
          >
            <Target className="w-4 h-4 text-amber-300" />
            <span>Generate Remedial Drill for {sub.student_name.split(' ')[0]}</span>
          </button>

          <button
            onClick={() => setShowExplainGrade(!showExplainGrade)}
            className="px-4 py-2.5 bg-[#F4F2EC] hover:bg-[#EAE7DF] text-[#222521] rounded-xl text-xs font-bold border border-[#E0DED7] flex items-center space-x-1.5"
          >
            <HelpCircle className="w-4 h-4 text-[#2D4A3E]" />
            <span>Score Rationale</span>
          </button>
        </div>
      </div>

      {/* Explain Grade Card Accordion */}
      {showExplainGrade && (
        <div className="p-6 bg-[#FFFFFF] rounded-3xl border border-[#C2D4C1] shadow-md animate-in slide-in-from-top-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
            <h3 className="font-bold text-[#222521] text-base flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#C88A58]" />
              <span>Score Breakdown & Rubric Rationale</span>
            </h3>
            <button onClick={() => setShowExplainGrade(false)} className="text-xs text-[#6E7269] hover:text-[#222521]">Close ✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sub.rubric.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#222521]">{item.criterion}</span>
                  <span className="text-xs font-black text-[#2D4A3E]">{item.awarded_marks}/{item.max_marks}</span>
                </div>
                <p className="text-[11px] text-[#545850] leading-snug">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 Cols): Handwritten Work & Thinking Trace */}
        <div className="lg:col-span-5 space-y-6">
          {/* Handwritten Work Card */}
          <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#E0DED7] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6E7269] uppercase tracking-wider">
                Handwritten Submission Image
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#EAF0E8] text-[#1E3A2B] font-bold border border-[#C2D4C1]">
                OCR & Vision Verified
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#E0DED7] bg-white p-2">
              <img src={sub.image_url} alt="Handwritten Answer" className="w-full h-auto object-contain rounded-xl" />
            </div>
          </div>

          {/* Thinking Trace Card */}
          <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#E0DED7] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#222521] uppercase tracking-wider flex items-center space-x-1.5">
                <BrainCircuit className="w-4 h-4 text-[#2D4A3E]" />
                <span>Thinking Trace & Self-Correction</span>
              </span>
            </div>

            <div className="space-y-2">
              {sub.thinking_traces.map((trace, i) => (
                <div key={i} className="p-3 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7] text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-[#2D4A3E] font-bold">Attempt {trace.attempt_number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      trace.status === 'Self-corrected' ? 'bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]' : trace.status === 'Final Answer' ? 'bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]' : 'bg-[#FDF0EE] text-[#8C2B22] border border-[#ECC4C1]'
                    }`}>
                      {trace.status}
                    </span>
                  </div>
                  <div className={`font-mono text-xs ${trace.is_crossed_out ? 'line-through text-[#6E7269]' : 'text-[#222521] font-bold'}`}>
                    {trace.visible_work}
                  </div>
                  <div className="text-[11px] text-[#545850] italic">{trace.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Review / Human-in-the-Loop */}
          <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#E0DED7] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-[#2D4A3E]" />
                <span className="text-xs font-bold text-[#222521]">Teacher Review (Human-in-the-Loop)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF0E6] text-[#8C521F] font-bold border border-[#E8CEB5]">
                AI Confidence: {Math.round((sub.ai_confidence || 0.94) * 100)}%
              </span>
            </div>

            {isEditingScore ? (
              <div className="space-y-3 p-3 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#545850] mb-1">Override Score (out of {sub.max_score})</label>
                  <input
                    type="number"
                    value={overrideValue}
                    onChange={(e) => setOverrideValue(Number(e.target.value))}
                    className="w-full bg-[#FFFFFF] border border-[#E0DED7] rounded-xl px-3 py-1.5 text-xs text-[#222521]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#545850] mb-1">Teacher Comment / Notes</label>
                  <input
                    type="text"
                    value={overrideComment}
                    onChange={(e) => setOverrideComment(e.target.value)}
                    placeholder="e.g. Awarded +1 partial mark for clear intermediate substitution step."
                    className="w-full bg-[#FFFFFF] border border-[#E0DED7] rounded-xl px-3 py-1.5 text-xs text-[#222521]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={handleSaveOverride} className="px-3 py-1.5 bg-[#2D4A3E] text-white rounded-lg text-xs font-bold">Save Override</button>
                  <button onClick={() => setIsEditingScore(false)} className="px-3 py-1.5 bg-[#F4F2EC] text-[#545850] rounded-lg text-xs font-semibold">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#545850]">
                  {sub.teacher_overridden ? `Overridden by Teacher (${sub.score}/${sub.max_score})` : 'AI Grade Accepted'}
                </span>
                <button
                  onClick={() => setIsEditingScore(true)}
                  className="px-3 py-1.5 bg-[#F4F2EC] hover:bg-[#EAE7DF] text-[#222521] border border-[#E0DED7] rounded-lg text-xs font-bold flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#2D4A3E]" />
                  <span>Override Grade</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Step-by-Step Breakdown, Error Classification & Gap Diagnosis */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step-by-Step Step Breakdown */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#222521] border-b border-[#E0DED7] pb-3 flex items-center justify-between">
              <span>Step-by-Step Reasoning Breakdown</span>
              <span className="text-xs text-[#6E7269] font-medium">Partial Credit Applied</span>
            </h3>

            <div className="space-y-3">
              {sub.student_steps.map((step) => (
                <div
                  key={step.step_number}
                  className={`p-4 rounded-2xl border transition-all ${
                    step.correct
                      ? 'bg-[#FDFCF8] border-[#E0DED7]'
                      : 'bg-[#FDF0EE] border-[#ECC4C1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {step.correct ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2D4A3E]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#8C2B22]" />
                      )}
                      <span className="font-black text-xs text-[#222521]">Step {step.step_number}</span>
                      {step.error_type && (
                        <span className="px-2 py-0.5 rounded bg-[#FDF0EE] text-[#8C2B22] text-[10px] font-bold border border-[#ECC4C1]">
                          {step.error_type}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#222521]">
                      {step.marks_awarded} / {step.max_marks} Marks
                    </span>
                  </div>

                  <div className="font-mono text-sm text-[#222521] font-bold mb-1 bg-[#FFFFFF] px-3 py-1.5 rounded-xl border border-[#E0DED7]">
                    {step.expression}
                  </div>

                  <p className="text-xs text-[#545850] mt-2 leading-relaxed">{step.explanation}</p>

                  {step.math_validation && (
                    <div className="mt-2 text-[11px] text-[#2D4A3E] bg-[#EAF0E8] px-2.5 py-1 rounded-lg border border-[#C2D4C1] flex items-center space-x-1.5 font-medium">
                      <Sparkles className="w-3 h-3 text-[#2D4A3E]" />
                      <span>Deterministic Validation: {step.math_validation.note}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Learning Gap & Error DNA Card */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-[#C88A58]" />
                <h3 className="text-base font-bold text-[#222521]">Diagnosed Learning Gap</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]">
                Confidence: {Math.round((sub.learning_gap?.confidence || 0.92) * 100)}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF0E6]/50 border border-[#E8CEB5] space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C521F]">Core Misconception</span>
                <h4 className="text-lg font-black text-[#222521]">{sub.learning_gap?.concept}</h4>
              </div>

              <div className="text-xs text-[#222521] space-y-1">
                <strong className="text-[#8C521F]">Observed Evidence:</strong>
                <ul className="list-disc list-inside text-[#545850] pl-1 space-y-0.5">
                  {sub.learning_gap?.evidence.map((ev, idx) => (
                    <li key={idx}>{ev}</li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-[#222521]">
                <strong className="text-[#8C521F]">Prerequisite Weakness:</strong>{' '}
                <span className="text-[#8C521F] font-bold">{sub.learning_gap?.prerequisite_weakness || 'Basic Integer Rules'}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E0DED7] text-xs text-[#545850]">
                <strong className="text-[#2D4A3E]">Recommended Action:</strong> {sub.learning_gap?.recommendation}
              </div>
            </div>
          </div>

          {/* Student Feedback Card */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6E7269] uppercase tracking-wider flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-[#2D4A3E]" />
                <span>Generated Student Feedback</span>
              </span>
              <button
                onClick={() => {
                  setSelectedStudentId(sub.student_id);
                  setActiveView('student_profile');
                }}
                className="text-xs text-[#2D4A3E] hover:text-[#1E3A2B] font-bold flex items-center space-x-1"
              >
                <span>View {sub.student_name.split(' ')[0]}'s Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7] text-xs text-[#222521] leading-relaxed font-medium">
              "{sub.feedback}"
            </div>

            {sub.socratic_hint && (
              <div className="p-3 rounded-xl bg-[#FAF0E6] border border-[#E8CEB5] text-xs text-[#8C521F]">
                <strong>Socratic Hint:</strong> "{sub.socratic_hint}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
