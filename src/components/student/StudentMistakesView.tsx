import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Lightbulb, RefreshCw, Sparkles, ChevronRight } from 'lucide-react';

export const StudentMistakesView: React.FC = () => {
  const { dbState, userSession, selectedStudentId, setActiveView } = useApp();

  const currentStudent = dbState?.students?.find(
    (s: any) =>
      (userSession?.studentId && s.id === userSession.studentId) ||
      (userSession?.email && s.email?.toLowerCase() === userSession.email.toLowerCase()) ||
      (s.id === selectedStudentId)
  );

  const studentName = userSession?.name || currentStudent?.name;
  const studentId = userSession?.studentId || currentStudent?.id;

  const studentSubmissions = (dbState?.submissions || []).filter(
    (s: any) =>
      (studentId && s.student_id === studentId) ||
      (userSession?.email && s.student_email?.toLowerCase() === userSession.email.toLowerCase()) ||
      (studentName && s.student_name?.toLowerCase() === studentName.toLowerCase())
  );

  const mistakeHistory = studentSubmissions
    .filter((sub: any) => !sub.final_answer_correct || sub.student_steps?.some((st: any) => !st.correct))
    .map((sub: any, idx: number) => {
      const errStep = sub.student_steps?.find((st: any) => !st.correct);
      return {
        id: `m_${sub.id}_${idx}`,
        topic: sub.topic || 'Math Problem',
        question: errStep ? `Step ${errStep.step_number}: ${errStep.expression}` : sub.question,
        errorType: errStep?.error_type || 'Calculation Error',
        description: errStep?.explanation || sub.feedback,
        socraticHint: sub.socratic_hint || 'Double check intermediate calculations.',
        recommendation: 'Complete targeted practice questions on this concept.'
      };
    });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E0DED7] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF0E6] text-[#C88A58] border border-[#E8CEB5]">
              Student Portal
            </span>
            <span className="text-xs text-[#6E7269]">Mistakes & Diagnostics</span>
          </div>
          <h1 className="text-2xl font-black text-[#222521] mt-1">Mistakes & Learning Gap Remediation</h1>
          <p className="text-xs text-[#545850]">Review recent calculation slips, sign errors, and practice targeted corrective hints</p>
        </div>

        <button
          onClick={() => setActiveView('student_practice')}
          className="px-4 py-2.5 bg-[#C88A58] hover:bg-[#B37949] text-[#FDFCF8] rounded-xl font-bold text-xs shadow-sm flex items-center space-x-2 transition-all shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Practice Remediation Questions</span>
        </button>
      </div>

      <div className="space-y-4">
        {mistakeHistory.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E0DED7] text-center space-y-3">
            <AlertTriangle className="w-12 h-12 text-[#6E7269] mx-auto" />
            <h3 className="text-lg font-bold text-[#222521]">No learning gaps or mistakes detected yet</h3>
            <p className="text-xs text-[#545850] max-w-md mx-auto">
              Calculation slips or structural sign errors identified from your evaluated answer sheets will appear here with Socratic corrective hints.
            </p>
          </div>
        ) : (
          mistakeHistory.map((m) => (
            <div key={m.id} className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
                <span className="text-xs font-bold text-[#C88A58]">{m.topic}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDF0EE] text-[#991B1B] border border-[#ECC4C1]">
                  {m.errorType}
                </span>
              </div>

              <div>
                <p className="text-xs text-[#6E7269] font-semibold">Your Step & Slip:</p>
                <p className="text-sm font-bold text-[#222521] font-mono bg-[#FDFCF8] p-2.5 rounded-lg border border-[#E0DED7] mt-1">
                  {m.question}
                </p>
                <p className="text-xs text-[#545850] mt-2">{m.description}</p>
              </div>

              <div className="p-3.5 bg-[#FAF0E6] rounded-xl border border-[#E8CEB5] space-y-1 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-[#8C521F]">
                  <Lightbulb className="w-4 h-4 text-[#C88A58]" />
                  <span>Socratic Guiding Hint:</span>
                </div>
                <p className="text-[#8C521F] font-medium pl-5">{m.socraticHint}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
