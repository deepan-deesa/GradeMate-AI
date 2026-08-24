import React from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Target, TrendingUp, BookOpen, ChevronRight } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { dbState, setActiveView, activePracticeSet, userSession, selectedStudentId } = useApp();

  const currentStudent = dbState?.students?.find(
    (s: any) =>
      (userSession?.studentId && s.id === userSession.studentId) ||
      (userSession?.email && s.email?.toLowerCase() === userSession.email.toLowerCase()) ||
      (s.id === selectedStudentId)
  ) || dbState?.students?.[0];

  const studentName = userSession?.name || currentStudent?.name || 'Student';
  const studentClass = currentStudent?.class || 'Grade 10 Mathematics';
  const overallAccuracy = currentStudent?.overallAccuracy || 78;

  const allSubmissions = dbState?.submissions || [];
  const studentSubmissions = allSubmissions.filter(
    (s: any) =>
      (userSession?.studentId && s.student_id === userSession.studentId) ||
      (currentStudent?.id && s.student_id === currentStudent.id) ||
      (s.student_name?.toLowerCase() === studentName.toLowerCase())
  );
  const latestSub = studentSubmissions[0] || allSubmissions[0];

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
          <h1 className="text-2xl font-bold text-white mt-1">Welcome back, {studentName}!</h1>
          <p className="text-slate-300 text-xs mt-0.5">
            {studentClass} • Overall Mastery: <strong className="text-emerald-400">{overallAccuracy}%</strong>
          </p>
        </div>

        <button
          onClick={() => setActiveView('personalized_practice')}
          className="px-5 py-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs shadow-lg flex items-center justify-center space-x-2 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Start Targeted Practice</span>
        </button>
      </div>

      {/* Practice Alert Banner */}
      {activePracticeSet && (
        <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-sm text-white">Targeted Practice Assigned</h3>
              <p className="text-xs text-amber-300 mt-0.5">
                Topic: <strong className="text-white">{activePracticeSet.topic}</strong> ({activePracticeSet.questions.length} questions)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">{activePracticeSet.target_reason}</p>
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

      {/* Main Grid: Latest Quiz Feedback & Mastery Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Quiz Evaluation Feedback */}
        {latestSub && (
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Latest Test Feedback</h3>
              <span className="text-xs font-extrabold text-blue-400">
                Score: {latestSub.score} / {latestSub.max_score} Marks
              </span>
            </div>

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
          </div>
        )}

        {/* Mastery Progress Meters */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">My Mathematics Mastery</h3>

          <div className="space-y-3 text-xs">
            {[
              { topic: 'Linear Equations', mastery: 86, color: 'bg-emerald-500' },
              { topic: 'Algebraic Simplification', mastery: 72, color: 'bg-blue-500' },
              { topic: 'Sign & Integer Operations', mastery: 58, color: 'bg-amber-500' },
              { topic: 'Fraction Equations', mastery: 52, color: 'bg-rose-500' },
            ].map((m, idx) => (
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
        </div>
      </div>
    </div>
  );
};
