import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, GraduationCap, Award, BookOpen, Mail, ShieldCheck } from 'lucide-react';

export const StudentProfileDetailsView: React.FC = () => {
  const { userSession } = useApp();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#E0DED7] pb-4">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF0E6] text-[#C88A58] border border-[#E8CEB5]">
            Student Portal
          </span>
          <span className="text-xs text-[#6E7269]">My Academic Profile</span>
        </div>
        <h1 className="text-2xl font-black text-[#222521] mt-1">Student Profile & Settings</h1>
        <p className="text-xs text-[#545850]">View your student ID, course enrollments, and academic details</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm space-y-6">
        <div className="flex items-center space-x-4 border-b border-[#E0DED7] pb-6">
          <div className="w-16 h-16 rounded-full bg-[#C88A58] text-white flex items-center justify-center font-black text-2xl shadow-md">
            {userSession?.name.charAt(0) || 'A'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#222521]">{userSession?.name || 'Alex Rivera'}</h2>
            <p className="text-xs text-[#6E7269]">Student ID: {userSession?.studentId || 'STD-2024-8902'}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF0E8] text-[#1E3A2B]">
              Grade 10 Mathematics
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#FDFCF8] rounded-xl border border-[#E0DED7] space-y-1">
            <p className="text-[#6E7269] font-semibold flex items-center space-x-1.5">
              <Mail className="w-4 h-4 text-[#C88A58]" />
              <span>Email Address</span>
            </p>
            <p className="font-bold text-[#222521] text-sm">{userSession?.email || 'alex.rivera@grademate.edu'}</p>
          </div>

          <div className="p-4 bg-[#FDFCF8] rounded-xl border border-[#E0DED7] space-y-1">
            <p className="text-[#6E7269] font-semibold flex items-center space-x-1.5">
              <GraduationCap className="w-4 h-4 text-[#C88A58]" />
              <span>Current Academic Velocity</span>
            </p>
            <p className="font-bold text-[#2D4A3E] text-sm">Rapid Improvement (+15% score growth)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
