import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserSquare2, AlertTriangle, CheckCircle2, TrendingUp, Target, Network, Sparkles, BookOpen, Eye, FileText, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StudentDashboard } from '../student/StudentDashboard';

export const StudentProfileView: React.FC = () => {
  const { dbState, selectedStudentId, setSelectedStudentId, generateTargetedPractice, setActiveView, setSelectedSubmission, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'submissions' | 'practice' | 'dashboard_preview'>('analytics');

  const students = dbState?.students || [];
  if (students.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium bg-slate-900 rounded-3xl border border-slate-800 m-6">
        No students assigned to your class yet.
      </div>
    );
  }

  const student = students.find((s: any) => s.id === selectedStudentId) || (selectedStudentId ? null : students[0]);

  if (!student) {
    return (
      <div className="p-12 text-center bg-red-950/40 border border-red-800 rounded-3xl m-6">
        <h2 className="text-xl font-bold text-red-300">Unauthorized / Access Denied</h2>
        <p className="text-xs text-red-400 mt-2">You do not have authorization to view this student profile.</p>
      </div>
    );
  }

  const studentSubmissions = (dbState?.submissions || []).filter(
    (sub: any) => sub.student_id === student.id || sub.student_name?.toLowerCase() === student.name.toLowerCase()
  );

  const studentPracticeSets = (dbState?.practiceSets || []).filter(
    (ps: any) => ps.student_id === student.id || ps.student_name?.toLowerCase() === student.name.toLowerCase()
  );

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
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
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

      {/* Navigation Tabs (Connected Analysis & Student View Preview) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'analytics' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Error DNA & Mastery</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'submissions' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Submissions History ({studentSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'practice' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Assigned Practice ({studentPracticeSets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard_preview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'dashboard_preview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <Eye className="w-4 h-4 text-amber-300" />
          <span>Live Student Dashboard Preview</span>
        </button>
      </div>

      {/* TAB CONTENT 1: Error DNA & Mastery Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
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
      )}

      {/* TAB CONTENT 2: Submissions History */}
      {activeTab === 'submissions' && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
            Handwritten Submissions & Evaluation History ({studentSubmissions.length})
          </h3>

          {studentSubmissions.length === 0 ? (
            <p className="text-xs text-slate-400">No submissions recorded for this student yet.</p>
          ) : (
            <div className="space-y-3">
              {studentSubmissions.map((sub: any) => (
                <div key={sub.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">{sub.question}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Submitted on: {new Date(sub.created_at || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-emerald-400">{sub.score} / {sub.max_score} Marks</span>
                      {sub.teacher_overridden && (
                        <span className="block text-[10px] text-amber-400 font-bold">Teacher Overridden</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic bg-slate-900 p-3 rounded-xl border border-slate-800">
                    "{sub.feedback}"
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setActiveView('evaluation');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-blue-300 rounded-lg flex items-center space-x-1"
                    >
                      <span>Review Full Evaluation</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: Assigned Practice Sets */}
      {activeTab === 'practice' && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
            Assigned Targeted Practice & Reassessment ({studentPracticeSets.length})
          </h3>

          {studentPracticeSets.length === 0 ? (
            <p className="text-xs text-slate-400">No practice sets assigned to this student yet.</p>
          ) : (
            <div className="space-y-3">
              {studentPracticeSets.map((ps: any) => (
                <div key={ps.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white text-sm">{ps.target_concept}</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">{ps.reason_for_practice}</p>
                    <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded font-bold ${
                      ps.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {ps.status}
                    </span>
                  </div>

                  <div className="text-right space-y-1">
                    {ps.status === 'Completed' ? (
                      <div>
                        <span className="text-emerald-400 font-extrabold text-sm block">+{ps.improvement_delta}% Delta</span>
                        <span className="text-slate-400 text-[10px]">Post Accuracy: {ps.after_accuracy}%</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-semibold">Pending Student Response</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: Live Student Dashboard Preview */}
      {activeTab === 'dashboard_preview' && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-950/60 border border-indigo-500/40 rounded-2xl text-xs text-indigo-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-amber-300" />
              <span>Viewing Live Student Dashboard Preview for <strong>{student.name}</strong></span>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/30 text-white font-bold text-[10px]">Teacher Inspection Mode</span>
          </div>

          <div className="border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <StudentDashboard />
          </div>
        </div>
      )}
    </div>
  );
};
