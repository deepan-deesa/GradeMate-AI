import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, AlertTriangle, CheckCircle2, Sparkles, BookPlus, ChevronRight } from 'lucide-react';

export const StudentGroupingView: React.FC = () => {
  const { dbState, generateTargetedPractice, setActiveView, setSelectedStudentId, addToast } = useApp();

  const groups = dbState?.groups || [];

  const handleAssignGroupPractice = async (groupId: string, concept: string, errorType: string) => {
    try {
      const group = groups.find((g: any) => g.id === groupId);
      if (group && group.students.length > 0) {
        const studentId = group.students[0].id;
        await generateTargetedPractice(studentId, concept, errorType);
        setActiveView('personalized_practice');
        addToast(`Assigned targeted remediation to ${group.name}!`, 'success');
      }
    } catch (e) {
      addToast('Failed to assign group practice', 'error');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Student Grouping</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Automatically cluster students based on shared learning gap DNA and prerequisite mastery levels.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className={`p-6 rounded-3xl border bg-slate-900 shadow-xl flex flex-col justify-between space-y-6 ${
              group.level === 'NEEDS SUPPORT'
                ? 'border-rose-500/40 hover:border-rose-500'
                : group.level === 'DEVELOPING'
                ? 'border-amber-500/40 hover:border-amber-500'
                : 'border-emerald-500/40 hover:border-emerald-500'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                  group.level === 'NEEDS SUPPORT' ? 'bg-rose-500/20 text-rose-300' : group.level === 'DEVELOPING' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {group.level}
                </span>
                <span className="text-xs text-slate-400 font-bold">{group.students.length} Students</span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white mb-1">{group.name}</h3>
                <p className="text-xs font-semibold text-slate-300">{group.common_issue}</p>
              </div>

              {/* Student list */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Group Roster</span>
                <div className="space-y-1.5">
                  {group.students.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => {
                        setSelectedStudentId(student.id);
                        setActiveView('student_profile');
                      }}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 cursor-pointer transition-all flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                            {student.name[0]}
                          </div>
                        )}
                        <span className="font-semibold text-slate-200">{student.name}</span>
                      </div>
                      <span className="font-extrabold text-blue-400">{student.mastery}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Activity */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Recommended Activity</span>
                <p className="text-slate-300 leading-snug">{group.recommended_activity}</p>
              </div>
            </div>

            <button
              onClick={() => handleAssignGroupPractice(group.id, group.topic_weakness, 'Sign Error')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs shadow-md flex items-center justify-center space-x-2 transition-all"
            >
              <BookPlus className="w-4 h-4" />
              <span>Assign Group Remedial Practice</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
