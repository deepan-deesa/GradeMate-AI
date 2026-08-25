import React from 'react';
import { useApp } from '../../context/AppContext';
import { Award, CheckCircle2, XCircle, FileText, Sparkles, ChevronRight, Eye } from 'lucide-react';

export const StudentResultsView: React.FC = () => {
  const { dbState, setSelectedSubmission, setActiveView, userSession, selectedStudentId } = useApp();

  const currentStudent = dbState?.students?.find(
    (s: any) =>
      (userSession?.studentId && s.id === userSession.studentId) ||
      (userSession?.email && s.email?.toLowerCase() === userSession.email.toLowerCase()) ||
      (s.id === selectedStudentId)
  );

  const studentName = userSession?.name || currentStudent?.name;
  const studentId = userSession?.studentId || currentStudent?.id;

  const allSubmissions = dbState?.submissions || [];
  const submissions = allSubmissions.filter(
    (s: any) =>
      (studentId && s.student_id === studentId) ||
      (userSession?.email && s.student_email?.toLowerCase() === userSession.email.toLowerCase()) ||
      (studentName && s.student_name?.toLowerCase() === studentName.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E0DED7] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF0E6] text-[#C88A58] border border-[#E8CEB5]">
              Student Portal
            </span>
            <span className="text-xs text-[#6E7269]">My Results & Feedback</span>
          </div>
          <h1 className="text-2xl font-black text-[#222521] mt-1">Assessment Results & Graded Answer Sheets</h1>
          <p className="text-xs text-[#545850]">View your step-by-step marks, handwritten answer breakdown, and AI diagnostic feedback</p>
        </div>
      </div>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E0DED7] text-center space-y-3">
            <FileText className="w-12 h-12 text-[#6E7269] mx-auto" />
            <h3 className="text-lg font-bold text-[#222521]">No evaluated answer sheets available yet</h3>
            <p className="text-xs text-[#545850] max-w-md mx-auto">
              Once your teacher evaluates an answer sheet for your account, your graded results, step-by-step marks, and AI socratic feedback will appear here.
            </p>
          </div>
        ) : (
          submissions.map((sub: any) => (
            <div key={sub.id} className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0DED7] pb-4">
                <div>
                  <span className="text-xs font-bold text-[#C88A58]">{sub.topic}</span>
                  <h2 className="text-lg font-bold text-[#222521]">{sub.assignment_title}</h2>
                  <p className="text-xs text-[#6E7269]">Submitted: {sub.created_at || 'Aug 12, 2026'}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="px-4 py-2 bg-[#EAF0E8] border border-[#C2D4C1] rounded-xl text-center">
                    <p className="text-[10px] text-[#6E7269] uppercase font-bold">Your Score</p>
                    <p className="text-lg font-black text-[#2D4A3E]">{sub.score} / {sub.max_score}</p>
                  </div>
                </div>
              </div>

              {/* Question & Feedback */}
              <div className="space-y-3">
                <div className="p-3.5 bg-[#FDFCF8] rounded-xl border border-[#E0DED7]">
                  <p className="text-xs text-[#6E7269] font-bold uppercase">Question</p>
                  <p className="text-sm font-bold text-[#222521] mt-0.5">{sub.question}</p>
                </div>

                <div className="p-4 bg-[#F4F2EC] rounded-xl border border-[#E0DED7] space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#2D4A3E]">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Feedback & Learning Gap Diagnosis</span>
                  </div>
                  <p className="text-xs text-[#222521] leading-relaxed">{sub.feedback}</p>
                  {sub.socratic_hint && (
                    <div className="p-2.5 bg-[#FAF0E6] border border-[#E8CEB5] rounded-lg text-xs text-[#8C521F] font-medium mt-2">
                      💡 <strong>Socratic Hint:</strong> {sub.socratic_hint}
                    </div>
                  )}
                </div>

                {/* Step-by-Step breakdown */}
                <div>
                  <h3 className="text-xs font-bold text-[#6E7269] uppercase tracking-wider mb-2">Step-by-Step Calculation Breakdown</h3>
                  <div className="space-y-2">
                    {sub.student_steps?.map((st: any) => (
                      <div key={st.step_number} className="p-3 bg-white rounded-xl border border-[#E0DED7] flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          {st.correct ? (
                            <CheckCircle2 className="w-4 h-4 text-[#2D4A3E] shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-[#991B1B] shrink-0" />
                          )}
                          <div>
                            <p className="font-bold text-[#222521]">Step {st.step_number}: {st.expression}</p>
                            <p className="text-[11px] text-[#6E7269]">{st.explanation}</p>
                          </div>
                        </div>
                        <span className={`font-bold ${st.correct ? 'text-[#2D4A3E]' : 'text-[#991B1B]'}`}>
                          {st.marks_awarded} / {st.max_marks} marks
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
