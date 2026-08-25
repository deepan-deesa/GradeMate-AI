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
    color: tm.mastery_percentage >= 80 ? 'bg-emerald-500' : tm.mastery_percentage >= 60 ? 'bg-blue-500' : tm.mastery_percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500',
  }));

  // Strictly filter assigned assessments for current authenticated student
  const assignedAssessments = (dbState?.assignments || []).filter((as: any) => {
    if (!as.assignedStudentId || as.assignedStudentId === 'ALL') return true;
    return (
      (userSession?.studentId && as.assignedStudentId === userSession.studentId) ||
      (currentStudent?.id && as.assignedStudentId === currentStudent.id) ||
      (userSession?.email && as.assignedStudentId?.toLowerCase() === userSession.email.toLowerCase())
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
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 p-6 rounded-3xl border border-blue-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
              Student Portal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#FFFFFF] mt-1">Welcome back, {studentName}!</h1>
          <p className="text-slate-300 text-xs mt-0.5">
            {studentClass} • Overall Mastery: <strong className="text-emerald-400">{overallAccuracy !== null ? `${overallAccuracy}%` : 'No evaluations yet'}</strong>
          </p>
        </div>

        <button
          onClick={() => setActiveView('personalized_practice')}
          className="px-5 py-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-[#FFFFFF] font-bold rounded-2xl text-xs shadow-lg flex items-center justify-center space-x-2 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#FFFFFF]" />
          <span>Start Targeted Practice</span>
        </button>
      </div>

      {/* Practice Alert Banner */}
      {activePracticeSet && (
        <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-sm text-[#FFFFFF]">Targeted Practice Assigned</h3>
              <p className="text-xs text-amber-300 mt-0.5">
                Topic: <strong className="text-[#FFFFFF]">{activePracticeSet.topic || activePracticeSet.target_concept}</strong> ({activePracticeSet.questions?.length || 0} questions)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{activePracticeSet.target_reason || activePracticeSet.reason_for_practice}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('personalized_practice')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shrink-0"
          >
            <span>Solve Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* My Assigned Assessments Section */}
      {assignedAssessments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#FFFFFF] flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>My Assigned Assessments ({assignedAssessments.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedAssessments.map((as: any) => (
              <div key={as.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {as.topic || 'Assessment'}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Due: {as.due_date}</span>
                </div>
                <h3 className="font-extrabold text-[#FFFFFF] text-sm leading-snug">{as.title}</h3>
                <p className="text-xs text-slate-400">Max Marks: {as.max_marks} marks</p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <span className="text-xs text-slate-400">Assigned by Teacher</span>
                  <button
                    onClick={() => handleStartAssessment(as)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-[#FFFFFF] font-bold rounded-xl text-xs flex items-center space-x-1 transition-all"
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
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Latest Test Feedback</h3>
            {latestSub && (
              <span className="text-xs font-extrabold text-blue-400">
                Score: {latestSub.score} / {latestSub.max_score} Marks
              </span>
            )}
          </div>

          {latestSub ? (
            <>
              <div>
                <div className="text-xs text-slate-400">Question:</div>
                <div className="text-sm font-bold text-white mb-2">{latestSub.question}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Teacher & AI Feedback</span>
                <p className="leading-relaxed">"{latestSub.feedback}"</p>
              </div>

              <button
                onClick={() => setActiveView('personalized_practice')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center space-x-1.5"
              >
                <span>Practice This Concept</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p className="font-bold text-slate-300">No test evaluations available yet.</p>
              <p className="text-[11px] text-slate-500">Your evaluated answer sheets and diagnostic feedback will appear here once graded by your teacher.</p>
            </div>
          )}
        </div>

        {/* Mastery Progress Meters */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">My Subject Mastery</h3>

          {topicMasteryList.length > 0 ? (
            <div className="space-y-3 text-xs">
              {topicMasteryList.map((m: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-200">{m.topic}</span>
                    <span className="text-slate-300">{m.mastery}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color}`} style={{ width: `${m.mastery}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <Target className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p className="font-bold text-slate-300">No topic mastery data recorded yet.</p>
              <p className="text-[11px] text-slate-500">Complete practice sets or have your teacher evaluate an answer sheet to populate topic progress.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
