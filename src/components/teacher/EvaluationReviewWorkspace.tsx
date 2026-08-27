import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Edit3, 
  Save, 
  Check, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  FileText,
  Award,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

export const EvaluationReviewWorkspace: React.FC = () => {
  const { selectedSubmission, overrideGrade, addToast, setActiveView } = useApp();

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [editingScore, setEditingScore] = useState<boolean>(false);
  const [customScore, setCustomScore] = useState<number>(selectedSubmission?.score || 7);
  const [teacherComment, setTeacherComment] = useState<string>(selectedSubmission?.teacher_comment || '');

  // Step-by-step state for teacher inline edits
  const [steps, setSteps] = useState(
    selectedSubmission?.student_steps || [
      { step_number: 1, expression: '2x + 5 = 15', correct: true, marks_awarded: 3, max_marks: 3, explanation: 'Transcribed original equation accurately.' },
      { step_number: 2, expression: '2x = 10', correct: true, marks_awarded: 4, max_marks: 4, explanation: 'Subtracted 5 from both sides correctly.' },
      { step_number: 3, expression: 'x = 6', correct: false, marks_awarded: 0, max_marks: 3, error_type: 'Arithmetic Error' as any, explanation: 'Division slip: 10 / 2 is 5, but student calculated 6.' }
    ]
  );

  const [editingStepNumber, setEditingStepNumber] = useState<number | null>(null);
  const [editStepMarks, setEditStepMarks] = useState<number>(0);
  const [editStepExplanation, setEditStepExplanation] = useState<string>('');

  const handleStartEditStep = (stepNum: number, currentMarks: number, currentExp: string) => {
    setEditingStepNumber(stepNum);
    setEditStepMarks(currentMarks);
    setEditStepExplanation(currentExp);
  };

  const handleSaveStep = (stepNum: number) => {
    const updated = steps.map((s) => {
      if (s.step_number === stepNum) {
        return { ...s, marks_awarded: editStepMarks, explanation: editStepExplanation };
      }
      return s;
    });
    setSteps(updated);
    const newTotal = updated.reduce((acc, curr) => acc + curr.marks_awarded, 0);
    setCustomScore(newTotal);
    setEditingStepNumber(null);
    addToast(`Updated Step ${stepNum} marks & feedback`, 'success');
  };

  const handleApprove = async () => {
    if (selectedSubmission) {
      await overrideGrade(selectedSubmission.id, customScore, teacherComment);
      addToast(`Evaluation approved! Grade set to ${customScore} marks.`, 'success');
      setActiveView('analysis');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#F8FAFC] text-[#1E293B]">
      {/* Workspace Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-3 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveView('analysis')}
            className="p-1.5 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                Desktop Evaluation Workspace
              </span>
              <span className="text-xs text-[#64748B]">Student: {selectedSubmission?.student_name || 'Enrolled Student'}</span>
            </div>
            <h1 className="text-lg font-extrabold text-[#1E293B]">
              {selectedSubmission?.assignment_title || `${selectedSubmission?.topic || 'Handwritten Math'} Assessment`}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
            <span className="text-[10px] text-[#64748B] font-bold block uppercase">AI Confidence</span>
            <span className="text-xs font-bold text-[#16A34A]">94% Accurate</span>
          </div>

          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Approve & Finalize Grade</span>
          </button>
        </div>
      </div>

      {/* 3-PANE DESKTOP WORKSPACE LAYOUT */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden divide-x divide-[#E2E8F0]">
        
        {/* PANE 1: LEFT PANE (Question Info & Rubrics) */}
        <div className="col-span-3 bg-white p-5 overflow-y-auto space-y-5">
          <div>
            <span className="text-xs font-bold text-[#2563EB] uppercase">Topic / Module</span>
            <h3 className="font-bold text-sm text-[#1E293B] mt-0.5">{selectedSubmission?.topic || 'Mathematics'}</h3>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
            <p className="text-xs font-bold text-[#64748B] uppercase">Question</p>
            <p className="text-sm font-extrabold text-[#1E293B]">{selectedSubmission?.question || 'Uploaded Math Question'}</p>
            <p className="text-xs text-[#64748B] font-medium pt-1">Max Marks: {selectedSubmission?.max_score || 10} Marks</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-[#64748B] uppercase flex items-center space-x-1">
              <BookOpen className="w-4 h-4 text-[#2563EB]" />
              <span>Syllabus Learning Objective</span>
            </p>
            <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs text-[#1E40AF]">
              Isolate single variable terms by applying inverse arithmetic operations. Recognize valid alternative methods.
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-[#64748B] uppercase">Rubric Criteria Breakdown</p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <p className="font-bold text-[#1E293B]">1. Equation Setup (3 Mks)</p>
                <p className="text-[#64748B]">Transcribe initial equation correctly.</p>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <p className="font-bold text-[#1E293B]">2. Term Isolation (4 Mks)</p>
                <p className="text-[#64748B]">Subtract 5 from both sides (2x = 10).</p>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <p className="font-bold text-[#1E293B]">3. Division & Value (3 Mks)</p>
                <p className="text-[#64748B]">Divide by 2 to compute x = 5.</p>
              </div>
            </div>
          </div>
        </div>

        {/* PANE 2: CENTER PANE (Original Student Handwritten Work) */}
        <div className="col-span-5 bg-[#F1F5F9] flex flex-col items-center justify-between p-4 overflow-hidden relative">
          {/* Zoom controls */}
          <div className="w-full flex items-center justify-between mb-2 shrink-0 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <span className="text-xs font-bold text-[#64748B]">Original Student Submission</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 20, 60))}
                className="p-1 text-[#64748B] hover:text-[#1E293B]"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-[#1E293B] w-12 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 20, 180))}
                className="p-1 text-[#64748B] hover:text-[#1E293B]"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1 text-[#64748B] hover:text-[#1E293B]"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Paper Image Container */}
          <div className="flex-1 w-full flex items-center justify-center overflow-auto p-2">
            <img
              src={selectedSubmission?.image_url || '/assets/sample_handwriting.png'}
              alt="Student Answer Sheet"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
              className="max-h-full max-w-full rounded-xl border border-[#CBD5E1] shadow-md transition-transform duration-150 object-contain bg-white"
            />
          </div>

          <div className="mt-2 text-[11px] text-[#64748B] text-center shrink-0">
            Handwritten Vision Recognition Active • High Precision Step OCR
          </div>
        </div>

        {/* PANE 3: RIGHT PANE (Step-by-Step AI Evaluation & Teacher Override) */}
        <div className="col-span-4 bg-white p-5 overflow-y-auto space-y-5">
          {/* Total Marks Banner */}
          <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-[#1E40AF] font-bold uppercase">Marks Awarded</p>
              <p className="text-2xl font-black text-[#1E40AF]">
                {customScore} / {selectedSubmission?.max_score || 10}
              </p>
            </div>
            <button
              onClick={() => setEditingScore(!editingScore)}
              className="px-3 py-1.5 bg-white border border-[#BFDBFE] text-[#1E40AF] rounded-xl text-xs font-bold shadow-2xs hover:bg-[#DBEAFE] transition-all flex items-center space-x-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{editingScore ? 'Done' : 'Override Score'}</span>
            </button>
          </div>

          {editingScore && (
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
              <label className="block text-xs font-bold text-[#1E293B]">Set Custom Final Score</label>
              <input
                type="number"
                value={customScore}
                onChange={(e) => setCustomScore(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-sm font-bold text-[#1E293B]"
              />
            </div>
          )}

          {/* Step-by-Step Evaluation Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Step-by-Step AI Evaluation</h3>

            {steps.map((st) => (
              <div
                key={st.step_number}
                className={`p-4 rounded-xl border space-y-2 transition-all ${
                  st.correct
                    ? 'bg-white border-[#E2E8F0]'
                    : 'bg-[#FEF2F2] border-[#FCA5A5]'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    {st.correct ? (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    )}
                    <span className="font-bold text-[#1E293B]">Step {st.step_number}: {st.expression}</span>
                  </div>

                  <span className={`font-bold ${st.correct ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                    {st.marks_awarded} / {st.max_marks} marks
                  </span>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed">{st.explanation}</p>

                {editingStepNumber === st.step_number ? (
                  <div className="pt-2 space-y-2 border-t border-[#E2E8F0]">
                    <div className="flex items-center space-x-2">
                      <label className="text-xs font-bold text-[#1E293B]">Step Marks:</label>
                      <input
                        type="number"
                        value={editStepMarks}
                        onChange={(e) => setEditStepMarks(Number(e.target.value))}
                        className="w-20 px-2 py-1 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold"
                      />
                    </div>
                    <textarea
                      value={editStepExplanation}
                      onChange={(e) => setEditStepExplanation(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                      rows={2}
                    />
                    <button
                      onClick={() => handleSaveStep(st.step_number)}
                      className="px-3 py-1 bg-[#2563EB] text-white rounded-lg text-xs font-bold"
                    >
                      Save Step Edit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEditStep(st.step_number, st.marks_awarded, st.explanation)}
                    className="text-[11px] text-[#2563EB] font-bold hover:underline"
                  >
                    Edit Step Marks & Comment
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Teacher Comment Box */}
          <div className="space-y-2 border-t border-[#E2E8F0] pt-4">
            <label className="block text-xs font-bold text-[#1E293B]">Teacher Feedback Note</label>
            <textarea
              value={teacherComment}
              onChange={(e) => setTeacherComment(e.target.value)}
              placeholder="Add teacher review feedback for student..."
              className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
