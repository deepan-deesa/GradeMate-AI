import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserSquare2, AlertTriangle, CheckCircle2, TrendingUp, Target, Network, Sparkles, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const StudentProfileView: React.FC = () => {
  const { dbState, selectedStudentId, setSelectedStudentId, generateTargetedPractice, setActiveView, addToast } = useApp();

  const students = dbState?.students || [];
  const student = students.find((s: any) => s.id === selectedStudentId) || students[0];

  if (!student) {
    return <div className="p-12 text-slate-400">Select a student from the dashboard.</div>;
  }

  const handleGeneratePracticeForStudent = async () => {
    try {
      await generateTargetedPractice(student.id, student.needs_improvement[0] || 'Sign Handling', student.common_error);
      setActiveView('personalized_practice');
      addToast(`Generated practice for ${student.name}!`, 'success');
    } catch (e) {
      addToast('Error generating practice', 'error');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Student Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-4">
          <img src={student.avatar} alt={student.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/50 shadow-md" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">{student.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                {student.grade_level}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Overall Mastery: <strong className="text-emerald-400">{student.overall_mastery}%</strong> • Velocity: {student.learning_velocity}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
          >
            {students.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.overall_mastery}% Mastery)
              </option>
            ))}
          </select>

          <button
            onClick={handleGeneratePracticeForStudent}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center space-x-2"
          >
            <Target className="w-4 h-4" />
            <span>Generate Targeted Practice</span>
          </button>
        </div>
      </div>

      {/* Early Support Alert Card */}
      {student.early_support_alert && (
        <div className="p-5 rounded-3xl bg-rose-950/30 border border-rose-500/40 text-rose-200 flex items-start space-x-3 shadow-xl">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-sm text-white">Early Support Alert</h3>
            <p className="text-xs text-rose-300 mt-0.5 leading-relaxed">{student.alert_reason}</p>
            <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block mt-2">
              Recommended: Provide targeted sign-handling practice before next quiz.
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Strengths/Needs & Error DNA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Error DNA Visualization */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Error DNA Breakdown</span>
            <span className="text-xs text-rose-400 font-semibold">{student.common_error} ({student.error_frequency} occurrences)</span>
          </h3>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={student.error_dna} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="category" type="category" width={110} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} />
                <Bar dataKey="percentage" fill="#ef4444" radius={[0, 8, 8, 0]} name="Occurrence %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Learning Profile Summary</h3>

            <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-[10px] block">Strengths</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 font-medium">
                  {student.strengths.map((str: string, i: number) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <span className="font-extrabold text-rose-400 uppercase tracking-wider text-[10px] block">Needs Improvement</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 font-medium">
                  {student.needs_improvement.map((ni: string, i: number) => (
                    <li key={i}>{ni}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Learning Velocity</span>
            <p className="text-slate-200 font-semibold">{student.learning_velocity}</p>
          </div>
        </div>
      </div>

      {/* Concept-Based Learning Gap Graph */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Concept-Based Learning Gap Graph</h3>
          </div>
          <span className="text-xs text-slate-400">AI Diagnostic Prerequisite Hierarchy</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
          <div className="text-blue-400 font-bold text-sm">ALGEBRA</div>
          <div className="pl-4 space-y-3 border-l-2 border-slate-800">
            {student.topic_mastery.map((tm: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">├──</span>
                  <span className="font-sans font-semibold text-slate-200">{tm.topic}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`font-sans text-xs font-bold ${
                    tm.mastery_percentage >= 80 ? 'text-emerald-400' : tm.mastery_percentage >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {tm.mastery_percentage}% mastery
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-sans font-bold ${
                    tm.mastery_percentage >= 80 ? 'bg-emerald-500/20 text-emerald-300' : tm.mastery_percentage >= 60 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {tm.mastery_percentage >= 80 ? 'Mastered' : tm.mastery_percentage >= 60 ? 'Developing' : 'Needs Support'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-slate-500 italic font-sans">
            Note: Prerequisite relationship paths are AI-generated diagnostic insights to guide remediation.
          </div>
        </div>
      </div>
    </div>
  );
};
