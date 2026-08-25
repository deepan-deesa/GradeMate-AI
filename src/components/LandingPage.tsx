import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  BrainCircuit, 
  Target, 
  TrendingUp, 
  Layers, 
  Users, 
  Play, 
  GraduationCap,
  ShieldCheck,
  FileSearch,
  BookOpen
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView, resetToDemo, setRole } = useApp();

  const handleQuickDemoFlow = () => {
    resetToDemo();
    setActiveView('upload');
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#222521] flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-[#E0DED7] bg-gradient-to-b from-[#F4F2EC] via-[#FDFCF8] to-[#FDFCF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#EAF0E8] border border-[#C2D4C1] text-[#1E3A2B] text-xs font-bold mb-6 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#3A5A40] animate-pulse" />
              <span>Closed-Loop Handwritten Math Assessment & Diagnosis</span>
            </div>

            {/* Title & Tagline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#222521] tracking-tight leading-tight mb-4">
              GradeMate <span className="text-[#2D4A3E]">AI</span>
            </h1>

            <p className="text-2xl sm:text-3xl font-bold text-[#353932] tracking-tight mb-6">
              "Don't just grade the answer. <br className="hidden sm:inline" />
              <span className="text-[#2D4A3E]">Understand the learning gap.</span>"
            </p>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-[#545850] max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
              AI-powered handwritten mathematics assessment that grades student reasoning step-by-step, diagnoses recurring learning gaps, creates personalized interventions, and measures real improvement.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <button
                onClick={() => setActiveView('login')}
                className="w-full sm:w-auto px-8 py-4 bg-[#2D4A3E] hover:bg-[#23382F] text-[#FDFCF8] font-bold rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-base"
              >
                <span>Get Started & Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Major Visual Loop Banner */}
            <div className="p-6 bg-[#FFFFFF] border border-[#E0DED7] rounded-3xl shadow-sm">
              <div className="text-xs font-bold text-[#6E7269] uppercase tracking-widest mb-4">
                The Closed-Loop Educational Engine
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-left">
                {[
                  { title: '1. GRADE', desc: 'Handwritten work & step reasoning', color: 'bg-[#EAF0E8] border-[#C2D4C1] text-[#1E3A2B]' },
                  { title: '2. DIAGNOSE', desc: 'Error DNA & misconception gap', color: 'bg-[#FAF0E6] border-[#E8CEB5] text-[#8C521F]' },
                  { title: '3. INTERVENE', desc: 'Targeted practice generation', color: 'bg-[#F2F1ED] border-[#DDD9D0] text-[#444841]' },
                  { title: '4. REASSESS', desc: 'Student attempts practice set', color: 'bg-[#E3E8DE] border-[#B8C9AF] text-[#2D4A3E]' },
                  { title: '5. MEASURE', desc: 'Before/After mastery & gain', color: 'bg-[#E2ECE9] border-[#A8C7BE] text-[#1A433A]' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border ${item.color} relative overflow-hidden`}
                  >
                    <div className="font-extrabold text-sm mb-1">{item.title}</div>
                    <div className="text-xs font-medium leading-snug">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Flow Diagram */}
      <section className="py-16 bg-[#F4F2EC] border-b border-[#E0DED7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#222521] mb-2">
              From Grading Papers to Improving Learning
            </h2>
            <p className="text-[#545850] text-sm max-w-2xl mx-auto font-medium">
              Traditional AI graders stop at giving a score. GradeMate AI identifies the precise misconception and drives student mastery through targeted intervention.
            </p>
          </div>

          {/* Diagram Flow */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
            {[
              { icon: GraduationCap, label: 'Handwritten Work', sub: 'JPG, PNG, Camera Upload', color: 'bg-[#FFFFFF] text-[#2D4A3E] border-[#E0DED7]' },
              { icon: BrainCircuit, label: 'AI Step Analysis', sub: 'Vision + Symbolic Validation', color: 'bg-[#EAF0E8] text-[#1E3A2B] border-[#C2D4C1]' },
              { icon: FileSearch, label: 'Learning Gap DNA', sub: 'Misconception vs Slip', color: 'bg-[#FAF0E6] text-[#8C521F] border-[#E8CEB5]' },
              { icon: Target, label: 'Targeted Practice', sub: 'Auto-Generated Questions', color: 'bg-[#F2F1ED] text-[#444841] border-[#DDD9D0]' },
              { icon: TrendingUp, label: 'Measured Gain', sub: '+38% Mastery Delta', color: 'bg-[#E3E8DE] text-[#2D4A3E] border-[#B8C9AF]' },
            ].map((node, i) => {
              const Icon = node.icon;
              return (
                <React.Fragment key={i}>
                  <div className={`p-5 rounded-2xl border ${node.color} flex flex-col items-center text-center w-full lg:w-48 shadow-sm`}>
                    <div className="w-12 h-12 rounded-xl bg-[#F4F2EC] flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-[#2D4A3E]" />
                    </div>
                    <div className="font-bold text-sm text-[#222521] mb-1">{node.label}</div>
                    <div className="text-xs text-[#545850] font-medium">{node.sub}</div>
                  </div>
                  {i < 4 && (
                    <div className="hidden lg:block text-[#A8A395] font-bold text-xl">
                      →
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* Differentiation Comparison Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFFFF] border border-[#E0DED7] rounded-3xl p-8 sm:p-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-[#222521] mb-2">Why GradeMate AI is Different</h3>
            <p className="text-[#545850] text-sm font-medium">
              Closing the loop between teacher diagnosis and student growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Standard Graders */}
            <div className="bg-[#FDF0EE] p-6 rounded-2xl border border-[#ECC4C1]">
              <div className="text-[#8C2B22] font-bold text-base mb-4 flex items-center space-x-2">
                <span>Traditional AI Graders</span>
              </div>
              <ul className="space-y-3 text-sm text-[#5C2B27]">
                <li className="flex items-start space-x-2">
                  <span className="text-[#8C2B22] font-bold">✕</span>
                  <span>Evaluates final answer and assigns raw marks</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#8C2B22] font-bold">✕</span>
                  <span>Treats all errors as generic wrong answers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#8C2B22] font-bold">✕</span>
                  <span>Leaves teacher with raw scores and no next steps</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#8C2B22] font-bold">✕</span>
                  <span>No follow-up practice or reassessment loop</span>
                </li>
              </ul>
            </div>

            {/* GradeMate AI */}
            <div className="bg-[#EAF0E8] p-6 rounded-2xl border border-[#C2D4C1]">
              <div className="text-[#1E3A2B] font-bold text-base mb-4 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#2D4A3E]" />
                <span>GradeMate AI Closed-Loop Platform</span>
              </div>
              <ul className="space-y-3 text-sm text-[#1E3A2B] font-semibold">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#2D4A3E] shrink-0 mt-0.5" />
                  <span>Evaluates step-by-step mathematical reasoning with partial credit</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#2D4A3E] shrink-0 mt-0.5" />
                  <span>Classifies error DNA (Sign, Fraction, Conceptual) and distinguishes slips vs recurring misconceptions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#2D4A3E] shrink-0 mt-0.5" />
                  <span>Auto-generates targeted practice questions specific to detected gaps</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#2D4A3E] shrink-0 mt-0.5" />
                  <span>Reassesses student attempts and measures percentage improvement for teacher decision support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection & Quick Demo Bar */}
      <section className="py-12 bg-[#F4F2EC] border-t border-[#E0DED7] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h4 className="text-xl font-bold text-[#222521] mb-6">Choose Your Portal to Experience the App</h4>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => {
                setRole('TEACHER');
                setActiveView('login');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-[#2D4A3E] hover:bg-[#23382F] text-[#FDFCF8] font-bold rounded-2xl shadow-md flex items-center justify-center space-x-3 transition-all"
            >
              <Users className="w-5 h-5" />
              <span>Teacher Portal Sign In</span>
            </button>

            <button
              onClick={() => {
                setRole('STUDENT');
                setActiveView('login');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-[#C88A58] hover:bg-[#B47747] text-[#FDFCF8] font-bold rounded-2xl shadow-md flex items-center justify-center space-x-3 transition-all"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Student Portal Sign In</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
