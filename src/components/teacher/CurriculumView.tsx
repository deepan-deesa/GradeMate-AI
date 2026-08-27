import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Curriculum, CurriculumTopic } from '../../types';
import { 
  BookOpen, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Plus, 
  ChevronRight, 
  FileText, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Loader2,
  RefreshCw,
  Book,
  FileCheck
} from 'lucide-react';

export const CurriculumView: React.FC = () => {
  const { 
    curricula, 
    selectedCurriculumId, 
    setSelectedCurriculumId, 
    uploadSyllabus, 
    deleteSyllabus, 
    updateCurriculumTopic, 
    addToast,
    setActiveView 
  } = useApp();

  // Form state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [name, setName] = useState('');
  const [board, setBoard] = useState('CBSE');
  const [classYear, setClassYear] = useState('10');
  const [subject, setSubject] = useState('Mathematics');
  const [academicYear, setAcademicYear] = useState('2026');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // View details modal / drawer
  const [showViewDrawer, setShowViewDrawer] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editConcept, setEditConcept] = useState('');
  const [editObjective, setEditObjective] = useState('');

  const activeCurriculum = curricula.find((c) => c.id === selectedCurriculumId) || curricula[0];

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      let fileBase64 = '';
      let fileMimeType = selectedFile ? selectedFile.type : '';
      let extractedFileText = rawText;

      if (selectedFile) {
        try {
          fileBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (evt) => {
              const res = (evt.target?.result as string) || '';
              // Remove data URL prefix e.g. "data:application/pdf;base64,"
              const base64Content = res.includes(',') ? res.split(',')[1] : res;
              resolve(base64Content);
            };
            reader.onerror = () => resolve('');
            reader.readAsDataURL(selectedFile);
          });
        } catch (e) {
          console.warn('Error reading file as base64:', e);
        }

        // If text file, also extract raw text
        if (selectedFile.type.includes('text') || selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.md')) {
          try {
            extractedFileText = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (evt) => resolve((evt.target?.result as string) || '');
              reader.onerror = () => resolve('');
              reader.readAsText(selectedFile);
            });
          } catch (e) {}
        }
      }

      await uploadSyllabus({
        name,
        board,
        class_year: classYear,
        subject,
        academic_year: academicYear,
        file_name: selectedFile ? selectedFile.name : `${name.replace(/\s+/g, '_')}.pdf`,
        file_base64: fileBase64 || undefined,
        file_mime_type: fileMimeType || (selectedFile?.name.endsWith('.pdf') ? 'application/pdf' : undefined),
        raw_text: extractedFileText || undefined,
        onProgressStatus: (text) => setProcessingStatus(text),
      });
      setShowUploadModal(false);
      setIsProcessing(false);
      setProcessingStatus('');
    } catch (err) {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async (topicId: string) => {
    if (activeCurriculum) {
      await updateCurriculumTopic(activeCurriculum.id, topicId, {
        concept: editConcept,
        learningObjective: editObjective,
      });
      setEditingTopicId(null);
    }
  };

  const handleDeleteSyllabus = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" and its AI knowledge base from the database?`)) {
      deleteSyllabus(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#2D4A3E]" />
            <span className="text-xs text-[#6E7269]">Curriculum & Syllabus Knowledge Base</span>
          </div>
          <h1 className="text-2xl font-black text-[#222521] mt-1">Syllabus Upload & AI Syllabus Analysis</h1>
          <p className="text-xs text-[#6E7269] mt-0.5">
            Uploaded course syllabi serve as the ground-truth standard for evaluation rubrics and student mastery tracking.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-3 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl font-bold text-sm transition-all shadow-sm flex items-center space-x-2 self-start md:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload & Analyse Syllabus</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Syllabus Selector Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#222521]">
              Uploaded Syllabi ({curricula.length})
            </h2>
          </div>

          <div className="space-y-3">
            {curricula.map((sys) => {
              const isSelected = activeCurriculum?.id === sys.id;
              return (
                <div
                  key={sys.id}
                  onClick={() => setSelectedCurriculumId(sys.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F4F2EC] border-[#2D4A3E] shadow-sm'
                      : 'bg-white border-[#E0DED7] hover:border-[#A3B19B]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-[#EAF0E8] rounded-xl text-[#2D4A3E]">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#222521]">{sys.name}</h3>
                        <p className="text-xs text-[#6E7269]">
                          {sys.board} • Class {sys.class} • {sys.academicYear}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1] rounded-full flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-[#2D4A3E]" />
                        <span>{sys.status}</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSyllabus(sys.id, sys.name);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete syllabus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#E0DED7] text-center text-xs">
                    <div>
                      <p className="text-[10px] text-[#6E7269]">Units</p>
                      <p className="font-bold text-[#222521]">{sys.unitsCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6E7269]">Topics</p>
                      <p className="font-bold text-[#222521]">{sys.topicsCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6E7269]">Concepts</p>
                      <p className="font-bold text-[#2D4A3E]">{sys.conceptsCount}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Syllabus Overview & Extraction */}
        {activeCurriculum && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm space-y-6">
              {/* Syllabus Overview Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0DED7] pb-4">
                <div>
                  <span className="text-xs font-bold text-[#2D4A3E]">
                    {activeCurriculum.board} | Class {activeCurriculum.class} | {activeCurriculum.subject} ({activeCurriculum.academicYear})
                  </span>
                  <h2 className="text-xl font-black text-[#222521] mt-0.5">{activeCurriculum.name}</h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowViewDrawer(true)}
                    className="px-3.5 py-2 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    View & Edit Curriculum
                  </button>
                  <button
                    onClick={() => handleDeleteSyllabus(activeCurriculum.id, activeCurriculum.name)}
                    className="p-2 text-[#991B1B] hover:bg-[#FDF0EE] rounded-xl border border-[#ECC4C1] transition-all"
                    title="Delete Syllabus from Database"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Overview Banner */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-[#FDFCF8] rounded-xl border border-[#E0DED7]">
                  <p className="text-xs text-[#6E7269] font-semibold">Status</p>
                  <p className="text-base font-extrabold text-[#2D4A3E] flex items-center space-x-1 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Analysed</span>
                  </p>
                </div>
                <div className="p-4 bg-[#FDFCF8] rounded-xl border border-[#E0DED7]">
                  <p className="text-xs text-[#6E7269] font-semibold">Extracted Units</p>
                  <p className="text-base font-extrabold text-[#222521] mt-1">{activeCurriculum.unitsCount} Units</p>
                </div>
                <div className="p-4 bg-[#FDFCF8] rounded-xl border border-[#E0DED7]">
                  <p className="text-xs text-[#6E7269] font-semibold">Core Concepts</p>
                  <p className="text-base font-extrabold text-[#2D4A3E] mt-1">{activeCurriculum.conceptsCount} Concepts</p>
                </div>
              </div>

              {/* Syllabus Context Isolation Banner */}
              <div className="p-4 bg-[#EAF0E8] border border-[#C2D4C1] rounded-xl text-xs text-[#1E3A2B] space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#2D4A3E]" />
                  <span>Isolated Curriculum Context Active</span>
                </div>
                <p className="leading-relaxed">
                  Evaluations for assessments linked to <strong>"{activeCurriculum.name}"</strong> will exclusively use this curriculum context. Knowledge is strictly isolated per syllabus and teacher.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setSelectedCurriculumId(activeCurriculum.id);
                    setActiveView('upload');
                  }}
                  className="px-4 py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-2"
                >
                  <FileCheck className="w-4 h-4 text-[#A3C9A8]" />
                  <span>Evaluate Answer Sheets using this Syllabus</span>
                </button>

                <button
                  onClick={() => setActiveView('assessments')}
                  className="px-4 py-2.5 bg-[#F4F2EC] hover:bg-[#EAE7DF] text-[#222521] border border-[#E0DED7] rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
                >
                  <BookOpen className="w-4 h-4 text-[#2D4A3E]" />
                  <span>Create Assessment with this Syllabus</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UPLOAD SYLLABUS MODAL WITH REAL PROCESSING STATE */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E0DED7] shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
              <h2 className="text-lg font-bold text-[#222521]">Upload Course Syllabus</h2>
              {!isProcessing && (
                <button onClick={() => setShowUploadModal(false)} className="text-xs text-[#6E7269] hover:text-[#222521]">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {isProcessing ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EAF0E8] border border-[#C2D4C1] flex items-center justify-center text-[#2D4A3E]">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#222521]">{processingStatus}</h3>
                  <p className="text-xs text-[#545850] mt-1">Analyzing curriculum, units, topics, and knowledge level...</p>
                </div>
                <div className="w-full bg-[#E0DED7] h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                  <div className="bg-[#2D4A3E] h-full rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#545850] mb-1">Syllabus Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10th Mathematics"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#545850] mb-1">Board / University</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CBSE / Matriculation / IB"
                      value={board}
                      onChange={(e) => setBoard(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#545850] mb-1">Class / Year</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10"
                      value={classYear}
                      onChange={(e) => setClassYear(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#545850] mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mathematics"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#545850] mb-1">Academic Year</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2026"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#545850] mb-1">Syllabus File (PDF, DOCX, Image)</label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,image/*"
                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-[#545850] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#EAF0E8] file:text-[#1E3A2B] hover:file:bg-[#D8E4D6] cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-xs font-medium text-[#6E7269]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload & Analyse Syllabus</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* VIEW & EDIT CURRICULUM DRAWER */}
      {showViewDrawer && activeCurriculum && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white max-w-2xl w-full h-full p-6 overflow-y-auto space-y-6 shadow-2xl border-l border-[#E0DED7]">
            <div className="flex items-center justify-between border-b border-[#E0DED7] pb-4">
              <div>
                <span className="text-xs font-bold text-[#2D4A3E]">
                  {activeCurriculum.board} | Class {activeCurriculum.class}
                </span>
                <h2 className="text-xl font-bold text-[#222521]">{activeCurriculum.name}</h2>
              </div>
              <button onClick={() => setShowViewDrawer(false)} className="p-2 text-[#6E7269] hover:text-[#222521]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#222521] flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#2D4A3E]" />
                <span>Extracted Units & Topics</span>
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-[#FDFCF8] rounded-xl border border-[#E0DED7] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2D4A3E]">Unit 1: Algebra</span>
                    <span className="px-2 py-0.5 bg-[#EAF0E8] text-[#1E3A2B] rounded-md font-semibold">Linear Equations</span>
                  </div>
                  <p className="text-sm font-bold text-[#222521]">Isolation of Variables & Inverse Operations</p>
                  <p className="text-xs text-[#545850]">
                    Learning Objective: Solve linear equations using substitution, elimination, and inverse operations.
                  </p>
                  <div className="p-2.5 bg-[#F4F2EC] rounded-lg text-xs space-y-1 text-[#545850]">
                    <p className="font-semibold text-[#222521]">Expected Methods:</p>
                    <p>• Substitution Method | Elimination Method | Inverse Arithmetic Isolation</p>
                  </div>
                </div>

                <div className="p-4 bg-[#FDFCF8] rounded-xl border border-[#E0DED7] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2D4A3E]">Unit 2: Quadratic Equations</span>
                    <span className="px-2 py-0.5 bg-[#EAF0E8] text-[#1E3A2B] rounded-md font-semibold">Roots & Discriminant</span>
                  </div>
                  <p className="text-sm font-bold text-[#222521]">Factoring & Quadratic Formula Solution</p>
                  <p className="text-xs text-[#545850]">
                    Learning Objective: Determine real roots using factoring by splitting middle term or quadratic formula.
                  </p>
                  <div className="p-2.5 bg-[#F4F2EC] rounded-lg text-xs space-y-1 text-[#545850]">
                    <p className="font-semibold text-[#222521]">Expected Methods:</p>
                    <p>• Middle Term Factoring | Quadratic Formula</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E0DED7] flex justify-end">
              <button
                onClick={() => setShowViewDrawer(false)}
                className="px-5 py-2 bg-[#2D4A3E] text-white font-bold text-xs rounded-xl"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
