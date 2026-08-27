import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Plus, Calendar, CheckCircle2, Clock, Award, Users, BookOpen, Trash2 } from 'lucide-react';

export const AssessmentsView: React.FC = () => {
  const { dbState, curricula, selectedCurriculumId, createAssessment, deleteAssessment, setActiveView, addToast } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Linear Equations');
  const [selectedCurrId, setSelectedCurrId] = useState(selectedCurriculumId || (curricula[0]?.id || 'curr_cbse_10_math'));
  const [assignedStudentId, setAssignedStudentId] = useState<string>('ALL');
  const [maxMarks, setMaxMarks] = useState<number>(10);
  const [questionMarks, setQuestionMarks] = useState<number>(1);
  const [dueDate, setDueDate] = useState<string>('2026-08-30');
  const [viewingAssessment, setViewingAssessment] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const assignments = dbState?.assignments || [];

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await createAssessment({
        title: title || 'Mathematics Assessment',
        subject: 'Mathematics',
        topic,
        curriculum_id: selectedCurrId,
        max_marks: maxMarks,
        question_marks: questionMarks,
        due_date: dueDate,
        assigned_student_id: assignedStudentId,
      });
      setShowCreateModal(false);
      setTitle('');
    } catch (e) {
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAssessment = async (e: React.MouseEvent, id: string, asgnTitle: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${asgnTitle}"? This will permanently remove it from the database.`)) {
      await deleteAssessment(id);
    }
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
      {assignments.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#6E7269] font-medium bg-white rounded-2xl border border-dashed border-[#E0DED7] space-y-3">
          <BookOpen className="w-10 h-10 text-[#A3B19B] mx-auto" />
          <h3 className="text-base font-bold text-[#222521]">No Assessments Created Yet</h3>
          <p className="text-xs text-[#545850]">Click "Create New Assessment" above to add your first assessment linked to a curriculum syllabus.</p>
        </div>
      ) : (
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
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#6E7269] flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{as.due_date}</span>
                      </span>
                      <button
                        onClick={(e) => handleDeleteAssessment(e, as.id, as.title)}
                        className="p-1 text-[#6E7269] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                    onClick={() => setViewingAssessment(as)}
                    className="px-3 py-2 bg-[#F4F2EC] hover:bg-[#EAE7DF] text-[#222521] rounded-xl font-semibold text-xs border border-[#E0DED7] transition-colors"
                  >
                    View Questions ({as.questions?.length || 0})
                  </button>
                  <button
                    onClick={(e) => handleDeleteAssessment(e, as.id, as.title)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-xs border border-red-200 transition-colors"
                    title="Remove Assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                <label className="block text-xs font-semibold text-[#545850] mb-1 font-bold text-[#2D4A3E]">
                  Assign to Student *
                </label>
                <select
                  value={assignedStudentId}
                  onChange={(e) => setAssignedStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#2D4A3E] rounded-xl text-sm font-semibold text-[#222521] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                >
                  <option value="ALL">All Enrolled Students</option>
                  {(dbState?.students || []).map((std: any) => (
                    <option key={std.id} value={std.id}>
                      {std.name} ({std.email || std.id})
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#545850] mb-1">Total Marks</label>
                  <select
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-xs font-bold text-[#222521] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                  >
                    <option value={10}>10 Marks</option>
                    <option value={15}>15 Marks</option>
                    <option value={20}>20 Marks</option>
                    <option value={25}>25 Marks</option>
                    <option value={50}>50 Marks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#545850] mb-1 font-bold text-[#2D4A3E]">Question Type</label>
                  <select
                    value={questionMarks}
                    onChange={(e) => setQuestionMarks(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-[#FDFCF8] border border-[#2D4A3E] rounded-xl text-xs font-bold text-[#222521] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                  >
                    <option value={1}>1 Mark ({Math.round(maxMarks / 1)} Questions)</option>
                    <option value={2}>2 Marks ({Math.round(maxMarks / 2)} Questions)</option>
                    <option value={3}>3 Marks ({Math.round(maxMarks / 3)} Questions)</option>
                    <option value={5}>5 Marks ({Math.round(maxMarks / 5)} Questions)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#545850] mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#F4F2EC] rounded-xl border border-[#E0DED7] text-[11px] text-[#2D4A3E] font-medium flex items-center justify-between">
                <span>AI Output Specification:</span>
                <span className="font-bold bg-white px-2 py-0.5 rounded border border-[#E0DED7]">
                  {Math.round(maxMarks / questionMarks)} × {questionMarks}-Mark Question(s) = {maxMarks} Total Marks
                </span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#6E7269] hover:text-[#222521]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin text-sm">⚡</span>
                      <span>Generating AI Questions...</span>
                    </>
                  ) : (
                    <span>Generate AI Assessment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW QUESTIONS MODAL */}
      {viewingAssessment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E0DED7] shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3 shrink-0">
              <div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F4F2EC] text-[#2D4A3E] border border-[#E0DED7]">
                  {viewingAssessment.topic}
                </span>
                <h2 className="text-lg font-bold text-[#222521] mt-1">{viewingAssessment.title}</h2>
                <p className="text-xs text-[#6E7269]">
                  Total Marks: {viewingAssessment.max_marks} marks • Total Questions: {viewingAssessment.questions?.length || 0} • Due: {viewingAssessment.due_date}
                </p>
              </div>
              <button
                onClick={() => setViewingAssessment(null)}
                className="px-3 py-1.5 bg-[#F4F2EC] hover:bg-[#EAE7DF] text-[#222521] rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {!viewingAssessment.questions || viewingAssessment.questions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#6E7269] font-medium bg-[#FDFCF8] rounded-xl border border-dashed border-[#E0DED7]">
                  No questions found for this assessment.
                </div>
              ) : (
                viewingAssessment.questions.map((q: any, idx: number) => (
                  <div key={q.id || idx} className="p-4 rounded-xl bg-[#FDFCF8] border border-[#E0DED7] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2D4A3E] bg-[#EAF0E8] px-2 py-0.5 rounded border border-[#C2D4C1]">
                        Question {idx + 1}
                      </span>
                      <div className="flex items-center space-x-2">
                        {q.unit && <span className="text-[10px] text-[#6E7269] bg-white px-2 py-0.5 rounded border border-[#E0DED7]">{q.unit}</span>}
                        {q.topic && <span className="text-[10px] text-[#2D4A3E] bg-white px-2 py-0.5 rounded border border-[#E0DED7] font-semibold">{q.topic}</span>}
                        <span className="font-bold text-[#222521] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">{q.max_marks || viewingAssessment.question_marks || 1} Mark{(q.max_marks || 1) > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[#222521] leading-relaxed">
                      {q.question_text || q.question}
                    </div>
                    {q.rubric_guidelines && (
                      <div className="mt-2 p-2.5 bg-white rounded-lg border border-[#E0DED7] text-xs text-[#545850]">
                        <span className="font-bold text-[#2D4A3E] block mb-0.5">Answer Key & Grading Rubric:</span>
                        <p className="whitespace-pre-wrap">{q.rubric_guidelines}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#E0DED7] flex items-center justify-end shrink-0">
              <button
                onClick={() => setViewingAssessment(null)}
                className="px-4 py-2 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl text-xs font-bold"
              >
                Done Reviewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

