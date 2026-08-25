import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileCheck, Upload, Sparkles, CheckCircle2, Eye, FileText, HelpCircle } from 'lucide-react';

export const QuestionPapersView: React.FC = () => {
  const { addToast, setActiveView } = useApp();
  const [papers, setPapers] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadPaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      setTimeout(() => {
        const file = e.target.files![0];
        const newPaper = {
          id: `qp_${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          questions: 4,
          topic: 'Mathematics',
          status: 'Extracted',
          maxMarks: 40
        };
        setPapers([newPaper, ...papers]);
        setSelectedPaper(newPaper);
        setUploading(false);
        addToast(`Uploaded and extracted question paper: ${newPaper.title}`, 'success');
      }, 1500);
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
            <span className="text-xs text-[#6E7269]">Question Paper Bank</span>
          </div>
          <h1 className="text-2xl font-black text-[#222521] mt-1">Question Papers & Question Extraction</h1>
          <p className="text-xs text-[#545850]">Upload question paper images/PDFs and review AI-extracted question steps & rubrics</p>
        </div>

        <label className="cursor-pointer px-4 py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-[#FDFCF8] rounded-xl font-bold text-xs shadow-sm flex items-center space-x-2 transition-all shrink-0">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Extracting Questions via AI...' : 'Upload Question Paper'}</span>
          <input type="file" accept="image/*,.pdf" onChange={handleUploadPaper} className="hidden" disabled={uploading} />
        </label>
      </div>

      {papers.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#6E7269] font-medium bg-white rounded-2xl border border-dashed border-[#E0DED7] space-y-3">
          <FileText className="w-10 h-10 text-[#A3B19B] mx-auto" />
          <h3 className="text-base font-bold text-[#222521]">No Question Papers Uploaded Yet</h3>
          <p className="text-xs text-[#545850]">Upload a question paper image or PDF using the button above to extract question rubrics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Papers List */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#6E7269] uppercase tracking-wider">Uploaded Papers ({papers.length})</h2>
            <div className="space-y-3">
              {papers.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPaper(p)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedPaper?.id === p.id
                      ? 'bg-[#F4F2EC] border-[#2D4A3E] shadow-sm'
                      : 'bg-white border-[#E0DED7] hover:border-[#A3B19B]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#EAF0E8] rounded-lg text-[#2D4A3E]">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#222521]">{p.title}</h3>
                        <p className="text-xs text-[#6E7269]">{p.topic} • {p.questions} Questions</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Paper Extracted Questions Preview */}
          {selectedPaper && (
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#E0DED7] pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#2D4A3E]">{selectedPaper.topic}</span>
                    <h2 className="text-xl font-bold text-[#222521]">{selectedPaper.title}</h2>
                  </div>
                  <button
                    onClick={() => setActiveView('upload')}
                    className="px-3.5 py-1.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Evaluate Student Answer Sheets
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#222521] flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#2D4A3E]" />
                    <span>Extracted Questions & Step-by-Step Rubrics</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="p-4 bg-[#FDFCF8] rounded-xl border border-[#E0DED7] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#2D4A3E]">Question 1 ({selectedPaper.maxMarks || 10} Marks)</span>
                        <span className="px-2 py-0.5 bg-[#EAF0E8] text-[#1E3A2B] rounded-md font-semibold">Step Rubric</span>
                      </div>
                      <p className="text-sm font-bold text-[#222521]">{selectedPaper.title} - Question 1</p>
                    </div>
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
