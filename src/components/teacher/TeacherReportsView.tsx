import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Download, BarChart3, TrendingUp, Users, CheckCircle2, ShieldCheck } from 'lucide-react';

export const TeacherReportsView: React.FC = () => {
  const { addToast } = useApp();

  const handleDownloadReport = (type: string) => {
    addToast(`Exporting ${type} report as PDF/Excel...`, 'success');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E0DED7] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]">
              Teacher Portal
            </span>
            <span className="text-xs text-[#6E7269]">Reports & Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-[#222521] mt-1">Class Reports & Diagnostics Export</h1>
          <p className="text-xs text-[#545850]">Generate comprehensive class performance, learning gap DNA, and intervention reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#EAF0E8] flex items-center justify-center text-[#2D4A3E]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#222521]">Classroom Performance Summary</h3>
            <p className="text-xs text-[#545850]">Complete breakdown of student scores, average marks, and topic-wise mastery levels across all assessments.</p>
          </div>
          <button
            onClick={() => handleDownloadReport('Class Performance')}
            className="w-full py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Class PDF Report</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF0E6] flex items-center justify-center text-[#C88A58]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#222521]">Learning Gap & Error DNA</h3>
            <p className="text-xs text-[#545850]">Diagnostic report categorizing arithmetic slips, sign errors, and prerequisite weaknesses for targeted intervention.</p>
          </div>
          <button
            onClick={() => handleDownloadReport('Learning Gap DNA')}
            className="w-full py-2.5 bg-[#C88A58] hover:bg-[#B37949] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Error DNA Excel</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#EAF0E8] flex items-center justify-center text-[#2D4A3E]">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#222521]">Student Remedial Progress</h3>
            <p className="text-xs text-[#545850]">Tracks before and after accuracy improvement following AI targeted practice drills and teacher interventions.</p>
          </div>
          <button
            onClick={() => handleDownloadReport('Remedial Progress')}
            className="w-full py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Remedial Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
