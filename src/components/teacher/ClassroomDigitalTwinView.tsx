import React from 'react';
import { useApp } from '../../context/AppContext';
import { Network, Users, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

export const ClassroomDigitalTwinView: React.FC = () => {
  const { dbState, setSelectedStudentId, setActiveView } = useApp();

  const students = dbState?.students || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-[#FDFCF8] min-h-screen text-[#222521] font-sans">
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#2D4A3E]/10 text-[#2D4A3E] rounded-2xl border border-[#C2D4C1]">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#222521]">Classroom Digital Twin & State Matrix</h1>
            <p className="text-[#545850] text-xs mt-0.5 font-medium">
              Live mathematical state representation mapping student mastery, active misconceptions, and intervention status.
            </p>
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#FFFFFF] border border-[#E0DED7] text-center text-[#6E7269] font-medium">
          No active students found in your class. Add students from the Teacher Dashboard to generate digital twin models.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student: any) => (
          <div
            key={student.id}
            onClick={() => {
              setSelectedStudentId(student.id);
              setActiveView('student_profile');
            }}
            className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#E0DED7] hover:border-[#2D4A3E] cursor-pointer transition-all space-y-3 shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-[#E0DED7]" />
                <div>
                  <h3 className="font-bold text-[#222521] text-sm group-hover:text-[#2D4A3E]">{student.name}</h3>
                  <span className="text-[10px] text-[#6E7269] font-mono">ID: {student.id}</span>
                </div>
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                student.overall_mastery >= 80 ? 'bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]' : student.overall_mastery >= 65 ? 'bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]' : 'bg-[#FDF0EE] text-[#8C2B22] border border-[#ECC4C1]'
              }`}>
                {student.overall_mastery}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7] text-xs space-y-1">
              <span className="text-[10px] font-bold text-[#6E7269] uppercase tracking-wider block">Active Learning Gap</span>
              <p className="text-[#222521] font-semibold">{student.common_error}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#6E7269] pt-1">
              <span>Velocity: <strong className="text-[#222521]">{student.learning_velocity}</strong></span>
              <span className="text-[#2D4A3E] font-bold group-hover:translate-x-1 transition-transform">Inspect Profile →</span>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
