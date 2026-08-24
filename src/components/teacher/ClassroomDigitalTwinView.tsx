import React from 'react';
import { useApp } from '../../context/AppContext';
import { Network, Users, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

export const ClassroomDigitalTwinView: React.FC = () => {
  const { dbState, setSelectedStudentId, setActiveView } = useApp();

  const students = dbState?.students || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Classroom Digital Twin & State Matrix</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Live mathematical state representation mapping student mastery, active misconceptions, and intervention status.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student: any) => (
          <div
            key={student.id}
            onClick={() => {
              setSelectedStudentId(student.id);
              setActiveView('student_profile');
            }}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500 cursor-pointer transition-all space-y-3 shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-blue-300">{student.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {student.id}</span>
                </div>
              </div>
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                student.overall_mastery >= 80 ? 'bg-emerald-500/20 text-emerald-300' : student.overall_mastery >= 65 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {student.overall_mastery}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Learning Gap</span>
              <p className="text-slate-200 font-semibold">{student.common_error}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Velocity: <strong className="text-slate-200">{student.learning_velocity}</strong></span>
              <span className="text-blue-400 font-bold group-hover:translate-x-1 transition-transform">Inspect Profile →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
