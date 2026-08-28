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
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-[#FDFCF8] min-h-screen text-[#222521] font-sans">
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#2D4A3E]/10 text-[#2D4A3E] rounded-2xl border border-[#C2D4C1]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#222521]">AI Student Grouping</h1>
            <p className="text-[#545850] text-xs mt-0.5 font-medium">
              Automatically cluster students based on shared learning gap DNA and prerequisite mastery levels.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className={`p-6 rounded-3xl border bg-[#FFFFFF] shadow-sm flex flex-col justify-between space-y-6 ${
              group.level === 'NEEDS SUPPORT'
                ? 'border-[#ECC4C1]'
                : group.level === 'DEVELOPING'
                ? 'border-[#E8CEB5]'
                : 'border-[#C2D4C1]'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                  group.level === 'NEEDS SUPPORT' ? 'bg-[#FDF0EE] text-[#8C2B22] border border-[#ECC4C1]' : group.level === 'DEVELOPING' ? 'bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]' : 'bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]'
                }`}>
                  {group.level}
                </span>
                <span className="text-xs text-[#6E7269] font-bold">{group.students.length} Students</span>
              </div>

              <div>
                <h3 className="text-lg font-black text-[#222521] mb-1">{group.name}</h3>
                <p className="text-xs font-semibold text-[#545850]">{group.common_issue}</p>
              </div>

              {/* Student list */}
              <div className="space-y-2 pt-2 border-t border-[#E0DED7]">
                <span className="text-[10px] uppercase font-bold text-[#6E7269] tracking-wider">Group Roster</span>
                <div className="space-y-1.5">
                  {group.students.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => {
                        setSelectedStudentId(student.id);
                        setActiveView('student_profile');
                      }}
                      className="p-2.5 rounded-xl bg-[#FDFCF8] border border-[#E0DED7] hover:border-[#2D4A3E] cursor-pointer transition-all flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#E0DED7] text-[#222521] text-[10px] font-bold flex items-center justify-center">
                            {student.name[0]}
                          </div>
                        )}
                        <span className="font-bold text-[#222521]">{student.name}</span>
                      </div>
                      <span className="font-black text-[#2D4A3E]">{student.mastery}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Activity */}
              <div className="p-3.5 rounded-2xl bg-[#FAF0E6] border border-[#E8CEB5] text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C521F]">Recommended Activity</span>
                <p className="text-[#8C521F] font-medium leading-snug">{group.recommended_activity}</p>
              </div>
            </div>

            <button
              onClick={() => handleAssignGroupPractice(group.id, group.topic_weakness, 'Sign Error')}
              className="w-full py-3 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white font-bold rounded-2xl text-xs shadow-xs flex items-center justify-center space-x-2 transition-all"
            >
              <BookPlus className="w-4 h-4 text-amber-300" />
              <span>Assign Group Remedial Practice</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
