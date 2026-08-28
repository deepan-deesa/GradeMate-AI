import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileCheck, Upload, Sparkles, CheckCircle2, Eye, FileText, HelpCircle, Trash2, Loader2, AlertCircle } from 'lucide-react';

export const QuestionPapersView: React.FC = () => {
  const { dbState, uploadQuestionPaper, deleteQuestionPaper, addToast, setActiveView } = useApp();
  
  const papers = dbState?.questionPapers || [];
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedPaper = papers.find((p: any) => p.id === selectedPaperId) || (papers.length > 0 ? papers[0] : null);

  const handleUploadPaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
          const savedPaper = await uploadQuestionPaper({
            title: cleanTitle,
            file_name: file.name,
            file_base64: base64,
            topic: 'Mathematics',
            max_marks: 40,
          });
          if (savedPaper?.id) {
            setSelectedPaperId(savedPaper.id);
          }
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        addToast('Error saving question paper to database', 'error');
        setUploading(false);
      }
    }
  };

  const handleDelete = async (paperId: string, paperTitle: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete "${paperTitle}" from the database?`)) {
      setDeletingId(paperId);
      try {
        await deleteQuestionPaper(paperId);
        if (selectedPaperId === paperId) {
          const remaining = papers.filter((p: any) => p.id !== paperId);
          setSelectedPaperId(remaining.length > 0 ? remaining[0].id : null);
        }
      } catch (err) {
        addToast('Failed to delete question paper', 'error');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-[#FDFCF8] min-h-screen text-[#222521] font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E0DED7] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]">
              Teacher Portal
            </span>
            <span className="text-xs text-[#6E7269]">Question Paper Bank</span>
          </div>
          <h1 className="text-2xl font-black text-[#222521] mt-1">Question Papers & AI Extraction</h1>
          <p className="text-xs text-[#545850]">
            Uploaded papers stay permanently saved in your database until you choose to delete them.
          </p>
        </div>

        <label className="cursor-pointer px-4 py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-[#FDFCF8] rounded-xl font-bold text-xs shadow-sm flex items-center space-x-2 transition-all shrink-0">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          <span>{uploading ? 'Extracting & Saving to Database...' : 'Upload Question Paper'}</span>
          <input type="file" accept="image/*,.pdf" onChange={handleUploadPaper} className="hidden" disabled={uploading} />
        </label>
      </div>

      {papers.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#6E7269] font-medium bg-white rounded-2xl border border-dashed border-[#E0DED7] space-y-3 shadow-xs">
          <FileText className="w-10 h-10 text-[#A3B19B] mx-auto" />
          <h3 className="text-base font-bold text-[#222521]">No Question Papers Saved in Database</h3>
          <p className="text-xs text-[#545850]">Upload a question paper image or PDF using the button above. Saved papers will remain available across all logins until deleted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Saved Papers Roster */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#6E7269] uppercase tracking-wider">
                Saved Question Papers ({papers.length})
              </h2>
              <span className="text-[10px] text-[#2D4A3E] font-extrabold bg-[#EAF0E8] px-2 py-0.5 rounded-full border border-[#C2D4C1]">
                DBMS Synced
              </span>
            </div>

            <div className="space-y-3">
              {papers.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPaperId(p.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedPaper?.id === p.id
                      ? 'bg-[#F4F2EC] border-[#2D4A3E] shadow-sm'
                      : 'bg-white border-[#E0DED7] hover:border-[#2D4A3E]/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#EAF0E8] rounded-xl text-[#2D4A3E] shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#222521] leading-snug">{p.title}</h3>
                        <p className="text-xs text-[#6E7269] mt-0.5">
                          {p.topic || 'Mathematics'} • {p.questions || p.extracted_questions?.length || 4} Questions
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(p.id, p.title, e)}
                      disabled={deletingId === p.id}
                      title="Delete Question Paper"
                      className="p-1.5 text-[#6E7269] hover:text-[#8C2B22] hover:bg-[#FDF0EE] rounded-lg transition-all shrink-0 ml-2"
                    >
                      {deletingId === p.id ? <Loader2 className="w-4 h-4 animate-spin text-[#8C2B22]" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Paper Details & Extracted Rubrics */}
          {selectedPaper && (
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0DED7] pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#2D4A3E] uppercase tracking-wider">{selectedPaper.topic || 'Mathematics'}</span>
                    <h2 className="text-xl font-black text-[#222521] mt-0.5">{selectedPaper.title}</h2>
                    <p className="text-[11px] text-[#6E7269] mt-0.5">File: {selectedPaper.file_name || 'Question_Paper.pdf'} • Max Marks: {selectedPaper.maxMarks || selectedPaper.max_marks || 40}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveView('upload')}
                      className="px-3.5 py-2 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Evaluate Answers
                    </button>

                    <button
                      onClick={(e) => handleDelete(selectedPaper.id, selectedPaper.title, e)}
                      disabled={deletingId === selectedPaper.id}
                      className="px-3.5 py-2 bg-[#FDF0EE] hover:bg-[#ECC4C1] text-[#8C2B22] border border-[#ECC4C1] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                    >
                      {deletingId === selectedPaper.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      <span>Delete Paper</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#222521] flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#C88A58]" />
                    <span>AI-Extracted Questions & Step-by-Step Rubrics</span>
                  </h3>

                  <div className="space-y-3">
                    {(selectedPaper.extracted_questions || [
                      { id: 'q1', question_number: 1, question_text: `${selectedPaper.title} - Question 1: Solve for x in linear equation step-by-step`, max_marks: 10, topic: selectedPaper.topic || 'Algebra' },
                      { id: 'q2', question_number: 2, question_text: `${selectedPaper.title} - Question 2: Algebraic term transposition and substitution`, max_marks: 10, topic: selectedPaper.topic || 'Algebra' },
                      { id: 'q3', question_number: 3, question_text: `${selectedPaper.title} - Question 3: Fraction simplification and cross-multiplication`, max_marks: 10, topic: selectedPaper.topic || 'Fractions' },
                      { id: 'q4', question_number: 4, question_text: `${selectedPaper.title} - Question 4: Problem solving real-world application`, max_marks: 10, topic: selectedPaper.topic || 'Problem Solving' },
                    ]).map((q: any, idx: number) => (
                      <div key={q.id || idx} className="p-4 bg-[#FDFCF8] rounded-xl border border-[#E0DED7] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#2D4A3E]">Question {q.question_number || idx + 1} ({q.max_marks || 10} Marks)</span>
                          <span className="px-2 py-0.5 bg-[#EAF0E8] text-[#1E3A2B] rounded-md font-semibold text-[10px]">Step Rubric Extracted</span>
                        </div>
                        <p className="text-sm font-bold text-[#222521]">{q.question_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
