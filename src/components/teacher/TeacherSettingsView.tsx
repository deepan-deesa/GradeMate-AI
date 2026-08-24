import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FeedbackMode } from '../../types';
import { Settings, Save, Sliders, Shield, Bell, CheckCircle2 } from 'lucide-react';

export const TeacherSettingsView: React.FC = () => {
  const { evaluationSettings, updateEvaluationSettings } = useApp();

  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>(evaluationSettings?.feedbackMode || 'Socratic');
  const [partialCreditStrictness, setPartialCreditStrictness] = useState<'Generous' | 'Balanced' | 'Strict'>(
    evaluationSettings?.partialCreditStrictness || 'Balanced'
  );
  const [autoFlagReview, setAutoFlagReview] = useState<boolean>(
    evaluationSettings?.autoFlagReview ?? true
  );

  useEffect(() => {
    if (evaluationSettings) {
      setFeedbackMode(evaluationSettings.feedbackMode || 'Socratic');
      setPartialCreditStrictness(evaluationSettings.partialCreditStrictness || 'Balanced');
      setAutoFlagReview(evaluationSettings.autoFlagReview ?? true);
    }
  }, [evaluationSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateEvaluationSettings({
      feedbackMode,
      partialCreditStrictness,
      autoFlagReview,
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#E0DED7] pb-4">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]">
            Teacher Portal
          </span>
          <span className="text-xs text-[#6E7269]">Settings & Evaluation Rules</span>
        </div>
        <h1 className="text-2xl font-black text-[#222521] mt-1">Teacher Evaluation Settings</h1>
        <p className="text-xs text-[#545850]">Configure default AI feedback modes, rubric strictness, and evaluation rules</p>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-[#222521] mb-2 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#2D4A3E]" />
            <span>Default AI Feedback Mode</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Socratic', 'Encouraging', 'Detailed', 'Exam-oriented'].map((mode) => (
              <button
                type="button"
                key={mode}
                onClick={() => setFeedbackMode(mode as FeedbackMode)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  feedbackMode === mode
                    ? 'bg-[#2D4A3E] text-[#FDFCF8] border-[#2D4A3E] shadow-sm'
                    : 'bg-[#FDFCF8] text-[#545850] border-[#E0DED7] hover:border-[#A3B19B]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#E0DED7] pt-4">
          <label className="block text-sm font-bold text-[#222521] mb-2">Partial Credit Strictness</label>
          <select
            value={partialCreditStrictness}
            onChange={(e) => setPartialCreditStrictness(e.target.value as 'Generous' | 'Balanced' | 'Strict')}
            className="w-full px-3 py-2.5 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm font-medium text-[#222521] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
          >
            <option value="Generous">Generous (Maximum partial credit for reasoning)</option>
            <option value="Balanced">Balanced (Standard partial credit deduction)</option>
            <option value="Strict">Strict (High deduction for arithmetic slips)</option>
          </select>
        </div>

        <div className="border-t border-[#E0DED7] pt-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm text-[#222521]">Flag Low AI Confidence for Teacher Review</p>
            <p className="text-xs text-[#545850]">Automatically require human teacher approval if AI confidence is below 85%.</p>
          </div>
          <input
            type="checkbox"
            checked={autoFlagReview}
            onChange={(e) => setAutoFlagReview(e.target.checked)}
            className="w-5 h-5 accent-[#2D4A3E] rounded cursor-pointer"
          />
        </div>

        <div className="pt-4 border-t border-[#E0DED7] flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
