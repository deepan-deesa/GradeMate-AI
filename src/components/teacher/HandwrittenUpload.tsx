import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FeedbackMode } from '../../types';
import { generateHandwrittenPaperSvg } from '../../utils/paperSvg';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  Image as ImageIcon, 
  Camera, 
  Loader2,
  AlertCircle
} from 'lucide-react';

export const HandwrittenUpload: React.FC = () => {
  const { dbState, analyzeHandwriting, setActiveView, setSelectedSubmission, addToast, curricula, selectedCurriculumId, evaluationSettings } = useApp();

  const students = dbState?.students || [];

  const [selectedCurriculum, setSelectedCurriculum] = useState<string>(selectedCurriculumId || (curricula[0]?.id || 'curr_cbse_10_math'));
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std_1');
  const [question, setQuestion] = useState<string>('Solve for x: 2x + 5 = 15');
  const [topic, setTopic] = useState<string>('Linear Equations');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [maxMarks, setMaxMarks] = useState<number>(10);
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>(evaluationSettings?.feedbackMode || 'Encouraging');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [previewName, setPreviewName] = useState<string>('Rahul_LinearEq_Work.png');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  // Sample pre-loaded papers for 1-click testing!
  const samplePapers = [
    {
      title: 'Rahul Kumar — Linear Equations (Division Error)',
      studentId: 'std_1',
      question: 'Solve for x: 2x + 5 = 15',
      topic: 'Linear Equations',
      preview: '2x + 5 = 15 -> 2x = 10 -> x = 6 (Err)',
      svg: generateHandwrittenPaperSvg('Rahul Kumar', '2x + 5 = 15', [
        { line: '2x + 5 = 15', isCorrect: true },
        { line: '2x = 10', isCorrect: true },
        { line: 'x = 6', isCorrect: false },
      ]),
    },
    {
      title: 'Priya Sharma — Fraction Denominator Cross Multiplication',
      studentId: 'std_2',
      question: 'Solve: x/3 + x/2 = 5',
      topic: 'Fractions',
      preview: 'x/3 + x/2 = 5 -> 2x/6 + 3x/6 = 5 -> 5x = 5 (Err)',
      svg: generateHandwrittenPaperSvg('Priya Sharma', 'x/3 + x/2 = 5', [
        { line: 'x/3 + x/2 = 5', isCorrect: true },
        { line: '2x/6 + 3x/6 = 5', isCorrect: true },
        { line: '5x/6 = 5 => 5x = 5', isCorrect: false },
      ]),
    },
    {
      title: 'Arun Patel — Algebraic Sign Transposition',
      studentId: 'std_3',
      question: 'Simplify: -(3x - 8) + 2x',
      topic: 'Algebraic Simplification',
      preview: '-(3x - 8) + 2x -> -3x - 8 + 2x = -x - 8 (Err)',
      svg: generateHandwrittenPaperSvg('Arun Patel', 'Simplify: -(3x - 8) + 2x', [
        { line: '-(3x - 8) + 2x', isCorrect: true },
        { line: '-3x - 8 + 2x', isCorrect: false },
        { line: '= -x - 8', isCorrect: false },
      ]),
    },
  ];

  const handleSelectSample = (sample: typeof samplePapers[0]) => {
    setSelectedStudentId(sample.studentId);
    setQuestion(sample.question);
    setTopic(sample.topic);
    setImageBase64(sample.svg);
    setPreviewName(sample.title);
    addToast(`Loaded sample handwritten paper: ${sample.title}`, 'info');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

    try {
      setAnalysisStep('1/4: Vision & Handwriting OCR Extraction...');
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStep('2/4: Deterministic Symbolic Math Validation...');
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStep('3/4: Step-by-step Partial Credit Rubric Evaluation...');
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStep('4/4: Diagnosing Error DNA & Closing the Learning Loop...');

      const sub = await analyzeHandwriting({
        image_base64: imageBase64 || generateHandwrittenPaperSvg(selectedStudent?.name || 'Rahul Kumar', question, [
          { line: '2x + 5 = 15', isCorrect: true },
          { line: '2x = 10', isCorrect: true },
          { line: 'x = 6', isCorrect: false },
        ]),
        question,
        topic,
        subject,
        max_marks: maxMarks,
        student_id: selectedStudent?.id || 'std_1',
        student_name: selectedStudent?.name || 'Rahul Kumar',
        feedback_mode: feedbackMode,
        curriculum_id: selectedCurriculum,
      });

      setSelectedSubmission(sub);
      setActiveView('analysis');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Title */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Evaluate Student Handwritten Answer</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Upload student paper or choose a pre-loaded sample. AI extracts reasoning, grades steps, and identifies learning gaps.
            </p>
          </div>
        </div>
      </div>

      {/* 1-Click Sample Papers Carousel */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Or Select a Sample Handwritten Paper (1-Click Evaluation)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {samplePapers.map((sample, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSample(sample)}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500 cursor-pointer transition-all flex flex-col justify-between group shadow-md"
            >
              <div>
                <div className="text-xs font-bold text-blue-300 group-hover:text-blue-200 mb-1">{sample.title}</div>
                <div className="text-[11px] text-slate-400 font-mono mb-2">{sample.preview}</div>
              </div>
              <div className="text-[10px] text-indigo-400 font-semibold flex items-center space-x-1 pt-2 border-t border-slate-800">
                <span>Click to load paper</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Want to explore all 60 handwritten equations & scanned images from Dataset 1?</span>
          <button
            onClick={() => setActiveView('dataset1')}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold underline flex items-center space-x-1"
          >
            <span>Open Dataset 1 Explorer</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Input Details */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
          {/* Syllabus Knowledge Base Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Target Syllabus Knowledge Base</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Isolated RAG Context Active
              </span>
            </label>
            <select
              value={selectedCurriculum}
              onChange={(e) => setSelectedCurriculum(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {curricula.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.board} • Class {c.class})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Answer sheet methods, formulas, and rubrics will be corrected according to this uploaded syllabus.
            </p>
          </div>

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.common_error} history)
                </option>
              ))}
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Question / Problem Statement</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Solve for x: 2x + 5 = 15"
            />
          </div>

          {/* Topic & Max Marks */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Maximum Marks</label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Feedback Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Student Feedback Mode</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['Encouraging', 'Concise', 'Socratic', 'Detailed', 'Exam-oriented'] as FeedbackMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFeedbackMode(mode)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-all ${
                    feedbackMode === mode
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Upload Dropzone & Preview */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Handwritten Paper Upload</h3>

            <div className="mt-4 border-2 border-dashed border-slate-700 hover:border-blue-500/70 rounded-2xl p-6 text-center bg-slate-950/60 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  Drag & Drop Handwritten Solution or Browse
                </span>
                <span className="text-[11px] text-slate-400">Supports JPG, PNG, WebP or Camera capture</span>
              </div>
            </div>

            {/* Paper Preview */}
            {imageBase64 && (
              <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold truncate max-w-[200px]">{previewName}</span>
                  <span className="text-emerald-400 text-[10px] font-bold">✓ Ready for Evaluation</span>
                </div>
                <div className="max-h-48 rounded-xl overflow-hidden border border-slate-800 bg-white">
                  <img src={imageBase64} alt="Preview" className="w-full h-full object-contain" />
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center space-x-2 transition-all text-sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{analysisStep}</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-5 h-5 text-indigo-300" />
                <span>Analyze Answer & Close Learning Loop</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
