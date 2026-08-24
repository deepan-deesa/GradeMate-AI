import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Plus, Calendar, CheckCircle2, Clock, Award, Users, BookOpen } from 'lucide-react';

export const AssessmentsView: React.FC = () => {
  const { dbState, curricula, selectedCurriculumId, createAssessment, setActiveView, addToast } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Linear Equations');
  const [selectedCurrId, setSelectedCurrId] = useState(selectedCurriculumId || (curricula[0]?.id || 'curr_cbse_10_math'));
  const [maxMarks, setMaxMarks] = useState(10);
  const [dueDate, setDueDate] = useState('2026-08-20');

  const assignments = dbState?.assignments || [
    { id: 'as_1', title: 'Linear Equations Mid-Term Assessment', topic: 'Linear Equations', total_submissions: 15, max_marks: 10, average_score: 7.2, due_date: '2026-08-10', curriculumId: 'curr_cbse_10_math' },
    { id: 'as_2', title: 'Quadratic Equations Diagnostic Test', topic: 'Quadratic Equations', total_submissions: 12, max_marks: 10, average_score: 8.1, due_date: '2026-08-14', curriculumId: 'curr_cbse_10_math' },
    { id: 'as_3', title: 'Algebraic Fraction Slip Quiz', topic: 'Fractions & Operations', total_submissions: 18, max_marks: 10, average_score: 6.8, due_date: '2026-08-18', curriculumId: 'curr_cbse_10_math' },
  ];

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAssessment({
        title: title || 'Mathematics Assessment',
        subject: 'Mathematics',
        topic,
        curriculum_id: selectedCurrId,
        max_marks: maxMarks,
        due_date: dueDate,
      });
      setShowCreateModal(false);
      setTitle('');
    } catch (e) {}
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
            <span className="text-xs text-[#6E7269]">Assessment Management</span>
          </div>
          <h1 className="text-2xl font-black text-[#222521] mt-1">Assessments & Test Rubrics</h1>
          <p className="text-xs text-[#545850]">Create tests mandatorily connected to an uploaded syllabus for AI evaluation</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-[#FDFCF8] rounded-xl font-bold text-xs shadow-sm flex items-center space-x-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Assessment</span>
        </button>
      </div>

      {/* Grid of Assessments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((as: any) => {
          const curr = curricula.find((c) => c.id === as.curriculumId);
          return (
            <div key={as.id} className="bg-white p-5 rounded-2xl border border-[#E0DED7] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F4F2EC] text-[#2D4A3E] border border-[#E0DED7]">
                    {as.topic}
                  </span>
                  <span className="text-xs font-bold text-[#6E7269] flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{as.due_date}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#222521] leading-snug mb-1">{as.title}</h3>
                <p className="text-xs text-[#545850]">Max Marks: {as.max_marks} marks</p>
                <div className="mt-2 p-2 bg-[#FDFCF8] rounded-lg border border-[#E0DED7] text-[11px] text-[#2D4A3E] font-semibold flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Syllabus: {curr ? curr.name : '10th CBSE Mathematics'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-[#FDFCF8] rounded-xl border border-[#E0DED7] text-xs">
                <div>
                  <p className="text-[10px] text-[#6E7269]">Submissions</p>
                  <p className="font-bold text-[#222521] flex items-center space-x-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-[#2D4A3E]" />
                    <span>{as.total_submissions} Students</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#6E7269]">Avg. Class Score</p>
                  <p className="font-bold text-[#2D4A3E] flex items-center space-x-1 mt-0.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>{as.average_score} / {as.max_marks}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-[#E0DED7]">
                <button
                  onClick={() => setActiveView('upload')}
                  className="flex-1 py-2 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl font-bold text-xs transition-colors text-center"
                >
                  Upload Answer Sheets
                </button>
                <button
                  onClick={() => setActiveView('analysis')}
                  className="px-3 py-2 bg-[#F4F2EC] hover:bg-[#EAE7DF] text-[#222521] rounded-xl font-semibold text-xs border border-[#E0DED7]"
                >
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE ASSESSMENT MODAL WITH MANDATORY CURRICULUM SELECTOR */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E0DED7] shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#222521]">Create Assessment</h2>
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#545850] mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Test 1 - Algebra & Equations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#545850] mb-1 font-bold text-[#2D4A3E]">
                  Select Curriculum (Mandatory) *
                </label>
                <select
                  required
                  value={selectedCurrId}
                  onChange={(e) => setSelectedCurrId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#2D4A3E] rounded-xl text-sm font-semibold text-[#222521] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                >
                  {curricula.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.board} Class {c.class})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#545850] mb-1">Topic</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#545850] mb-1">Max Marks</label>
                  <input
                    type="number"
                    required
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#545850] mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#6E7269] hover:text-[#222521]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl text-xs font-bold"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

