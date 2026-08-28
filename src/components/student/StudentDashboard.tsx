import React from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Target, TrendingUp, BookOpen, ChevronRight } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { dbState, setActiveView, activePracticeSet, setActivePracticeSet, userSession, selectedStudentId } = useApp();

  const currentStudent = dbState?.students?.find(
    (s: any) =>
      (userSession?.studentId && s.id === userSession.studentId) ||
      (userSession?.email && s.email?.toLowerCase() === userSession.email.toLowerCase()) ||
      (s.id === selectedStudentId)
  ) || dbState?.students?.[0];

  const studentName = userSession?.name || currentStudent?.name || 'Student';
  const studentClass = currentStudent?.class || currentStudent?.grade_level || 'Mathematics';
  const overallAccuracy = currentStudent?.overall_mastery ?? currentStudent?.overallAccuracy ?? null;

  const allSubmissions = dbState?.submissions || [];
  const studentSubmissions = allSubmissions.filter(
    (s: any) =>
      (userSession?.studentId && s.student_id === userSession.studentId) ||
      (currentStudent?.id && s.student_id === currentStudent.id) ||
      (userSession?.email && s.student_email?.toLowerCase() === userSession.email.toLowerCase())
  );
  const latestSub = studentSubmissions[0];

  const topicMasteryList = (currentStudent?.topic_mastery || []).map((tm: any) => ({
    topic: tm.topic,
    mastery: tm.mastery_percentage,
    color: tm.mastery_percentage >= 80 ? 'bg-[#2D4A3E]' : tm.mastery_percentage >= 60 ? 'bg-[#C88A58]' : 'bg-[#C85A54]',
  }));

  // Strictly filter assigned assessments for current authenticated student
  const assignedAssessments = (dbState?.assignments || []).filter((as: any) => {
    const studentTeacherId = currentStudent?.teacherId || (currentStudent as any)?.teacher_id || (userSession as any)?.teacherId;
    const asgnTeacherId = as.teacherId || as.teacher_id;
    if (studentTeacherId && asgnTeacherId && asgnTeacherId !== studentTeacherId) {
      return false;
    }

    const targetStd = as.assignedStudentId || as.assigned_student_id;
    if (!targetStd || targetStd === 'ALL') return true;

    return (
      (userSession?.studentId && targetStd === userSession.studentId) ||
      (currentStudent?.id && targetStd === currentStudent.id) ||
      (userSession?.email && targetStd.toLowerCase() === userSession.email.toLowerCase())
    );
  });

  const handleStartAssessment = (as: any) => {
    const questions = (as.questions && as.questions.length > 0)
      ? as.questions.map((q: any, idx: number) => ({
          id: q.id || `q_${as.id}_${idx + 1}`,
          question_number: idx + 1,
          question_text: q.question_text || q.text || `Solve step-by-step for ${as.topic}: ${as.title}`,
          topic: as.topic || 'Mathematics',
          correct_option: q.correct_option || 'x = 5',
          expected_final_answer: q.expected_final_answer || 'x = 5',
          options: q.options || ['x = 5', 'x = 10', 'x = 15', 'x = 2'],
        }))
      : [
          {
            id: `q_${as.id}_1`,
            question_number: 1,
            question_text: `Solve for x in: 2x + 5 = 15`,
            topic: as.topic || 'Linear Equations',
            correct_option: 'x = 5',
            expected_final_answer: 'x = 5',
            options: ['x = 5', 'x = 10', 'x = 15', 'x = 2'],
          },
        ];

    const assessmentPracticeSet = {
      id: `prac_${as.id}`,
      student_id: currentStudent?.id || userSession?.studentId || 'std_1',
      student_name: studentName,
      topic: as.topic || as.title,
      target_concept: as.title,
      target_error_type: 'Assigned Test' as any,
      target_reason: `Assigned Assessment: ${as.title} (${as.max_marks} Marks)`,
      reason_for_practice: `Assigned by Teacher: ${as.title}`,
      created_at: new Date().toISOString(),
      status: 'Pending',
      before_accuracy: 0,
      questions,
    };

    setActivePracticeSet(assessmentPracticeSet as any);
    setActiveView('personalized_practice');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-[#FDFCF8] min-h-screen text-[#222521] font-sans">
      {/* Welcome Banner */}
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1] text-xs font-bold">
              Student Portal
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#222521] mt-1">Welcome back, {studentName}!</h1>
          <p className="text-[#545850] text-xs mt-0.5 font-medium">
            {studentClass} • Overall Mastery: <strong className="text-[#2D4A3E] font-black">{overallAccuracy !== null ? `${overallAccuracy}%` : 'No evaluations yet'}</strong>
          </p>
        </div>
      </div>

      {/* My Assigned Assessments Section */}
      {assignedAssessments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#222521] flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#2D4A3E]" />
            <span>My Assigned Assessments ({assignedAssessments.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedAssessments.map((as: any) => (
              <div key={as.id} className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#E0DED7] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]">
                    {as.topic || 'Assessment'}
                  </span>
                  <span className="text-xs text-[#6E7269] font-medium">Due: {as.due_date}</span>
                </div>
                <h3 className="font-black text-[#222521] text-sm leading-snug">{as.title}</h3>
                <p className="text-xs text-[#545850]">Max Marks: {as.max_marks} marks</p>
                <div className="pt-2 flex items-center justify-between border-t border-[#E0DED7]">
                  <span className="text-xs text-[#6E7269]">Assigned by Teacher</span>
                  <button
                    onClick={() => handleStartAssessment(as)}
                    className="px-4 py-2 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white font-bold rounded-xl text-xs flex items-center space-x-1 transition-all shadow-xs"
                  >
                    <span>Start Test</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Latest Quiz Feedback & Mastery Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Quiz Evaluation Feedback */}
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
            <h3 className="font-bold text-[#222521] text-base">Latest Test Feedback</h3>
            {latestSub && (
              <span className="text-xs font-black text-[#2D4A3E]">
                Score: {latestSub.score} / {latestSub.max_score} Marks
              </span>
            )}
          </div>

          {latestSub ? (
            <>
              <div>
                <div className="text-xs text-[#6E7269]">Question:</div>
                <div className="text-sm font-bold text-[#222521] mb-2">{latestSub.question}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7] text-xs text-[#222521] space-y-2">
                <span className="text-[10px] font-bold text-[#2D4A3E] uppercase tracking-wider block">Teacher & AI Feedback</span>
                <p className="leading-relaxed">"{latestSub.feedback}"</p>
              </div>

              <button
                onClick={() => setActiveView('personalized_practice')}
                className="w-full py-2.5 bg-[#FAF0E6] hover:bg-[#E8CEB5] text-[#8C521F] text-xs font-bold rounded-xl border border-[#E8CEB5] flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>Practice This Concept</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="p-8 text-center text-[#6E7269] text-xs space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-[#A3B19B] mb-1" />
              <p className="font-bold text-[#222521]">No test evaluations available yet.</p>
              <p className="text-[11px] text-[#545850]">Your evaluated answer sheets and diagnostic feedback will appear here once graded by your teacher.</p>
            </div>
          )}
        </div>

        {/* Mastery Progress Meters */}
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-4">
          <h3 className="font-bold text-[#222521] text-base border-b border-[#E0DED7] pb-3">My Subject Mastery</h3>

          {topicMasteryList.length > 0 ? (
            <div className="space-y-3 text-xs">
              {topicMasteryList.map((m: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7] space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#222521]">{m.topic}</span>
                    <span className="text-[#2D4A3E] font-black">{m.mastery}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#E0DED7] rounded-full overflow-hidden">
                    <div className={`h-full ${m.color}`} style={{ width: `${m.mastery}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[#6E7269] text-xs space-y-2">
              <Target className="w-8 h-8 mx-auto text-[#A3B19B] mb-1" />
              <p className="font-bold text-[#222521]">No topic mastery data recorded yet.</p>
              <p className="text-[11px] text-[#545850]">Complete practice sets or have your teacher evaluate an answer sheet to populate topic progress.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
