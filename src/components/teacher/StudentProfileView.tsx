import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserSquare2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Target,
  Network,
  Sparkles,
  BookOpen,
  Eye,
  FileText,
  ChevronRight,
  Award,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { StudentDashboard } from '../student/StudentDashboard';

export const StudentProfileView: React.FC = () => {
  const { dbState, selectedStudentId, setSelectedStudentId, generateTargetedPractice, setActiveView, setSelectedSubmission, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'submissions' | 'practice' | 'dashboard_preview'>('analytics');

  const students = dbState?.students || [];
  if (students.length === 0) {
    return (
      <div className="p-12 text-center text-[#6E7269] font-medium bg-[#FFFFFF] rounded-3xl border border-[#E0DED7] m-6 shadow-sm">
        No students assigned to your class yet.
      </div>
    );
  }

  const student = students.find((s: any) => s.id === selectedStudentId) || students[0];

  if (!student) {
    return (
      <div className="p-12 text-center bg-[#FDF0EE] border border-[#ECC4C1] rounded-3xl m-6">
        <h2 className="text-xl font-bold text-[#8C2B22]">Unauthorized / Access Denied</h2>
        <p className="text-xs text-[#8C2B22] mt-2">You do not have authorization to view this student profile.</p>
      </div>
    );
  }

  const studentSubmissions = (dbState?.submissions || []).filter(
    (sub: any) => sub.student_id === student.id || sub.student_name?.toLowerCase() === student.name.toLowerCase()
  );

  const studentPracticeSets = (dbState?.practiceSets || []).filter(
    (ps: any) => ps.student_id === student.id || ps.student_name?.toLowerCase() === student.name.toLowerCase()
  );

  // Compute Student Performance Score matching Student Login calculation
  const totalSubmissionsCount = studentSubmissions.length;
  const totalScoreEarned = studentSubmissions.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
  const totalMaxMarks = studentSubmissions.reduce((sum: number, s: any) => sum + (s.max_score || 10), 0);
  const studentPerformanceScore = totalMaxMarks > 0
    ? Math.round((totalScoreEarned / totalMaxMarks) * 100)
    : (student.overall_mastery ?? student.overallAccuracy ?? 78);

  const performanceGraphData = studentSubmissions.length > 0
    ? studentSubmissions.map((sub: any, i: number) => ({
        task: `Task #${i + 1}`,
        score: Math.round(((sub.score || 0) / (sub.max_score || 10)) * 100),
        topic: sub.topic || 'Math Task',
      }))
    : (student.topic_mastery || []).map((tm: any) => ({
        task: tm.topic,
        score: tm.mastery_percentage,
        topic: tm.topic,
      }));

  const handleResendInvite = async () => {
    try {
      const res = await fetch('/api/invitations/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: student.email,
          studentId: student.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.inviteUrl) {
        navigator.clipboard.writeText(data.inviteUrl);
        addToast(`Invitation link copied to clipboard & sent to ${student.email || student.name}!`, 'success');
      } else {
        addToast('Failed to generate invitation link', 'error');
      }
    } catch (e) {
      addToast('Error generating invitation link', 'error');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-[#FDFCF8] min-h-screen text-[#222521] font-sans">
      {/* Student Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm">
        <div className="flex items-center space-x-4">
          <img src={student.avatar} alt={student.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-[#2D4A3E]/30 shadow-xs" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-[#222521]">{student.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1] text-xs font-bold">
                {student.grade_level || 'Grade 10'}
              </span>
              {(student.isRegistered === false || student.userStatus === 'Unregistered User ID' || student.learning_velocity === 'Unregistered User ID') && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5] text-xs font-extrabold flex items-center space-x-1">
                  <span>⚠️ Unregistered ID</span>
                </span>
              )}
            </div>
            <p className="text-[#545850] text-xs mt-0.5">
              Overall Performance Score: <strong className="text-[#2D4A3E] font-black">{studentPerformanceScore}%</strong> • Status: {student.userStatus || student.learning_velocity}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {(student.isRegistered === false || student.userStatus === 'Unregistered User ID' || student.learning_velocity === 'Unregistered User ID') && (
            <button
              onClick={handleResendInvite}
              className="px-3.5 py-2 bg-[#FAF0E6] hover:bg-[#E8CEB5] text-[#8C521F] border border-[#E8CEB5] rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#C88A58]" />
              <span>Copy Invite Link</span>
            </button>
          )}

          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-[#FDFCF8] border border-[#E0DED7] rounded-xl px-3.5 py-2 text-xs font-bold text-[#222521] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
          >
            {students.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name} ({studentPerformanceScore}% Performance Score)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E0DED7] pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'analytics' ? 'bg-[#2D4A3E] text-[#FDFCF8] shadow-sm' : 'bg-[#FFFFFF] text-[#6E7269] hover:bg-[#FAF0E6]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Performance & Error DNA</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'submissions' ? 'bg-[#2D4A3E] text-[#FDFCF8] shadow-sm' : 'bg-[#FFFFFF] text-[#6E7269] hover:bg-[#FAF0E6]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Submissions History ({studentSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'practice' ? 'bg-[#2D4A3E] text-[#FDFCF8] shadow-sm' : 'bg-[#FFFFFF] text-[#6E7269] hover:bg-[#FAF0E6]'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Assigned Practice ({studentPracticeSets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard_preview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'dashboard_preview' ? 'bg-[#3A5A40] text-[#FDFCF8] shadow-sm' : 'bg-[#FFFFFF] text-[#6E7269] hover:bg-[#FAF0E6]'
          }`}
        >
          <Eye className="w-4 h-4 text-amber-300" />
          <span>Live Student View Preview</span>
        </button>
      </div>

      {/* TAB CONTENT 1: Performance Score Graph & Error DNA */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Student Performance Score & Evaluation Trend Graph */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-[#2D4A3E]" />
                <div>
                  <h3 className="text-base font-bold text-[#222521]">Student Performance & Evaluation Score Trend</h3>
                  <p className="text-xs text-[#545850]">Score tracked across evaluated tasks (Synchronized with Student Login)</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#2D4A3E]">{studentPerformanceScore}%</span>
                <span className="block text-[10px] text-[#6E7269] font-bold uppercase tracking-wider">Overall Performance Score</span>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceGraphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DED7" />
                  <XAxis dataKey="task" stroke="#6E7269" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#6E7269" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E0DED7', color: '#222521', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                  <Line type="monotone" dataKey="score" stroke="#2D4A3E" strokeWidth={3} dot={{ r: 6, fill: '#2D4A3E' }} name="Performance Score %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Early Support Alert Card */}
          {student.early_support_alert && (
            <div className="p-5 rounded-3xl bg-[#FDF0EE] border border-[#ECC4C1] text-[#8C2B22] flex items-start space-x-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-[#C85A54] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-sm text-[#222521]">Early Support Alert</h3>
                <p className="text-xs text-[#8C2B22] mt-0.5 leading-relaxed">{student.alert_reason}</p>
                <span className="text-[10px] font-semibold text-[#C85A54] uppercase tracking-wider block mt-2">
                  Recommended: Provide targeted sign-handling practice before next quiz.
                </span>
              </div>
            </div>
          )}

          {/* Main Grid: Strengths/Needs & Error DNA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Error DNA Breakdown */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#222521] border-b border-[#E0DED7] pb-3 flex items-center justify-between">
                <span>Error DNA Breakdown</span>
                <span className="text-xs text-[#C85A54] font-semibold">{student.common_error} ({student.error_frequency} occurrences)</span>
              </h3>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={student.error_dna} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0DED7" />
                    <XAxis type="number" domain={[0, 100]} stroke="#6E7269" fontSize={11} />
                    <YAxis dataKey="category" type="category" width={110} stroke="#6E7269" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E0DED7', color: '#222521', borderRadius: '8px' }} />
                    <Bar dataKey="percentage" fill="#C85A54" radius={[0, 8, 8, 0]} name="Occurrence %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#222521] border-b border-[#E0DED7] pb-3">Learning Profile Summary</h3>

                <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#EAF0E8] border border-[#C2D4C1] space-y-2">
                    <span className="font-extrabold text-[#1E3A2B] uppercase tracking-wider text-[10px] block">Strengths</span>
                    <ul className="list-disc list-inside space-y-1 text-[#222521] font-medium">
                      {student.strengths.map((str: string, i: number) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF0E6] border border-[#E8CEB5] space-y-2">
                    <span className="font-extrabold text-[#8C521F] uppercase tracking-wider text-[10px] block">Needs Improvement</span>
                    <ul className="list-disc list-inside space-y-1 text-[#222521] font-medium">
                      {student.needs_improvement.map((ni: string, i: number) => (
                        <li key={i}>{ni}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F2EC] border border-[#E0DED7] text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D4A3E]">Learning Velocity</span>
                <p className="text-[#222521] font-bold">{student.learning_velocity}</p>
              </div>
            </div>
          </div>

          {/* Concept-Based Learning Gap Graph */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
              <div className="flex items-center space-x-2">
                <Network className="w-5 h-5 text-[#2D4A3E]" />
                <h3 className="text-base font-bold text-[#222521]">Concept-Based Learning Gap Graph</h3>
              </div>
              <span className="text-xs text-[#6E7269]">AI Diagnostic Prerequisite Hierarchy</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#F4F2EC] border border-[#E0DED7] space-y-4 font-mono text-xs">
              <div className="text-[#2D4A3E] font-bold text-sm">ALGEBRA</div>
              <div className="pl-4 space-y-3 border-l-2 border-[#E0DED7]">
                {student.topic_mastery.map((tm: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E0DED7]">
                    <div className="flex items-center space-x-2">
                      <span className="text-[#6E7269]">├──</span>
                      <span className="font-sans font-semibold text-[#222521]">{tm.topic}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`font-sans text-xs font-bold ${
                        tm.mastery_percentage >= 80 ? 'text-[#2D4A3E]' : tm.mastery_percentage >= 60 ? 'text-[#C88A58]' : 'text-[#C85A54]'
                      }`}>
                        {tm.mastery_percentage}% mastery
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-sans font-bold ${
                        tm.mastery_percentage >= 80 ? 'bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]' : tm.mastery_percentage >= 60 ? 'bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]' : 'bg-[#FDF0EE] text-[#8C2B22] border border-[#ECC4C1]'
                      }`}>
                        {tm.mastery_percentage >= 80 ? 'Mastered' : tm.mastery_percentage >= 60 ? 'Developing' : 'Needs Support'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-[#6E7269] italic font-sans">
                Note: Prerequisite relationship paths are AI-generated diagnostic insights to guide remediation.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Submissions History */}
      {activeTab === 'submissions' && (
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-4">
          <h3 className="font-bold text-[#222521] text-base border-b border-[#E0DED7] pb-3">
            Handwritten Submissions & Evaluation History ({studentSubmissions.length})
          </h3>

          {studentSubmissions.length === 0 ? (
            <p className="text-xs text-[#6E7269]">No submissions recorded for this student yet.</p>
          ) : (
            <div className="space-y-3">
              {studentSubmissions.map((sub: any) => (
                <div key={sub.id} className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#222521] text-sm">{sub.question}</span>
                      <p className="text-[11px] text-[#6E7269] mt-0.5">Submitted on: {new Date(sub.created_at || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-[#2D4A3E]">{sub.score} / {sub.max_score} Marks</span>
                      {sub.teacher_overridden && (
                        <span className="block text-[10px] text-[#C88A58] font-bold">Teacher Overridden</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#545850] italic bg-[#FFFFFF] p-3 rounded-xl border border-[#E0DED7]">
                    "{sub.feedback}"
                  </p>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setActiveView('evaluation');
                      }}
                      className="px-3 py-1.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-xs font-bold text-white rounded-lg flex items-center space-x-1 shadow-xs"
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
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-4">
          <h3 className="font-bold text-[#222521] text-base border-b border-[#E0DED7] pb-3">
            Assigned Targeted Practice & Reassessment ({studentPracticeSets.length})
          </h3>

          {studentPracticeSets.length === 0 ? (
            <p className="text-xs text-[#6E7269]">No practice sets assigned to this student yet.</p>
          ) : (
            <div className="space-y-3">
              {studentPracticeSets.map((ps: any) => (
                <div key={ps.id} className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7] flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[#222521] text-sm">{ps.target_concept}</h4>
                    <p className="text-[#545850] text-[11px] mt-0.5">{ps.reason_for_practice}</p>
                    <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded font-bold ${
                      ps.status === 'Completed' ? 'bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]' : 'bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]'
                    }`}>
                      {ps.status}
                    </span>
                  </div>

                  <div className="text-right space-y-1">
                    {ps.status === 'Completed' ? (
                      <div>
                        <span className="text-[#2D4A3E] font-black text-sm block">+{ps.improvement_delta}% Delta</span>
                        <span className="text-[#6E7269] text-[10px]">Post Accuracy: {ps.after_accuracy}%</span>
                      </div>
                    ) : (
                      <span className="text-[#6E7269] font-semibold">Pending Student Response</span>
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
          <div className="p-4 bg-[#FAF0E6] border border-[#E8CEB5] rounded-2xl text-xs text-[#8C521F] flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-[#C88A58]" />
              <span>Viewing Live Student Dashboard Preview for <strong>{student.name}</strong></span>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-[#2D4A3E] text-white font-bold text-[10px]">Teacher Inspection Mode</span>
          </div>

          <div className="border border-[#E0DED7] rounded-3xl overflow-hidden shadow-sm">
            <StudentDashboard />
          </div>
        </div>
      )}
    </div>
  );
};
