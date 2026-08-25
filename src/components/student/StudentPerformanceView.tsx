import React from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, Award, CheckCircle2, AlertTriangle, Sparkles, Target } from 'lucide-react';

export const StudentPerformanceView: React.FC = () => {
  const { dbState, userSession, selectedStudentId, setActiveView } = useApp();

  const currentStudent = dbState?.students?.find(
    (s: any) =>
      (userSession?.studentId && s.id === userSession.studentId) ||
      (userSession?.email && s.email?.toLowerCase() === userSession.email.toLowerCase()) ||
      (s.id === selectedStudentId)
  );

  const strongTopics = (currentStudent?.strongTopics || []).map((t: string) => ({
    name: t,
    mastery: 85,
  }));

  const weakTopics = (currentStudent?.needs_improvement || currentStudent?.weakTopics || []).map((t: string) => ({
    name: t,
    weakness: 'Learning Gap',
    mastery: 55,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E0DED7] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF0E6] text-[#C88A58] border border-[#E8CEB5]">
              Student Portal
            </span>
            <span className="text-xs text-[#6E7269]">Performance & Learning Gap DNA</span>
          </div>
          <h1 className="text-2xl font-black text-[#222521] mt-1">Academic Performance & Progress</h1>
          <p className="text-xs text-[#545850]">Track your topic mastery, strong concepts, and areas needing targeted practice</p>
        </div>

        <button
          onClick={() => setActiveView('student_practice')}
          className="px-4 py-2.5 bg-[#C88A58] hover:bg-[#B37949] text-[#FDFCF8] rounded-xl font-bold text-xs shadow-sm flex items-center space-x-2 transition-all shrink-0"
        >
          <Target className="w-4 h-4" />
          <span>Start Targeted Practice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <div className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E0DED7] pb-3">
            <CheckCircle2 className="w-5 h-5 text-[#2D4A3E]" />
            <h2 className="font-bold text-base text-[#222521]">Strong Topics & Strengths</h2>
          </div>
          <div className="space-y-3">
            {strongTopics.map((st, idx) => (
              <div key={idx} className="p-3.5 bg-[#FDFCF8] rounded-xl border border-[#E0DED7] space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#222521]">{st.name}</span>
                  <span className="text-[#2D4A3E]">{st.mastery}% Mastery</span>
                </div>
                <div className="w-full bg-[#E0DED7] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#2D4A3E] h-full rounded-full" style={{ width: `${st.mastery}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E0DED7] pb-3">
            <AlertTriangle className="w-5 h-5 text-[#C88A58]" />
            <h2 className="font-bold text-base text-[#222521]">Areas Needing Attention</h2>
          </div>
          <div className="space-y-3">
            {weakTopics.map((wt, idx) => (
              <div key={idx} className="p-3.5 bg-[#FAF0E6] rounded-xl border border-[#E8CEB5] space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#8C521F]">{wt.name}</span>
                  <span className="text-[#991B1B]">{wt.mastery}% Mastery</span>
                </div>
                <p className="text-[11px] text-[#8C521F]">Primary Gap: {wt.weakness}</p>
                <div className="w-full bg-[#E8CEB5] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#C88A58] h-full rounded-full" style={{ width: `${wt.mastery}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
