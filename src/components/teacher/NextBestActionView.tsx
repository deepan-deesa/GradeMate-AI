import React from 'react';
import { useApp } from '../../context/AppContext';
import { Zap, AlertTriangle, Users, BookPlus, ArrowRight, CheckCircle2 } from 'lucide-react';

export const NextBestActionView: React.FC = () => {
  const { dbState, generateTargetedPractice, setActiveView, addToast } = useApp();

  const actions = dbState?.nextBestActions || [];

  const handleExecute = async (action: any) => {
    try {
      await generateTargetedPractice('std_1', action.related_topic, 'Sign Error');
      setActiveView('personalized_practice');
      addToast(`Executed teaching recommendation: ${action.action_title}`, 'success');
    } catch (e) {
      addToast('Failed to execute recommendation', 'error');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-[#FDFCF8] min-h-screen text-[#222521] font-sans">
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#FAF0E6] text-[#C88A58] rounded-2xl border border-[#E8CEB5]">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#222521]">Next Best Teaching Actions</h1>
            <p className="text-[#545850] text-xs mt-0.5 font-medium">
              What should I teach or revise next? Evidence-backed decision support based on student submission data.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {actions.map((act: any) => (
          <div
            key={act.id}
            className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E0DED7] shadow-sm space-y-4 hover:border-[#2D4A3E]/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0DED7] pb-3">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  act.priority === 'High' ? 'bg-[#FDF0EE] text-[#8C2B22] border border-[#ECC4C1]' : 'bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]'
                }`}>
                  {act.priority} Priority Action
                </span>
                <span className="text-xs text-[#6E7269] font-medium">• Topic: {act.related_topic}</span>
              </div>
              <span className="text-xs text-[#2D4A3E] font-black">{act.affected_students_count} Students Affected</span>
            </div>

            <div>
              <h3 className="text-lg font-black text-[#222521] mb-2">{act.action_title}</h3>
              <p className="text-xs text-[#545850] leading-relaxed">{act.reason}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7] text-xs space-y-2">
              <div>
                <strong className="text-[#222521]">Data Evidence:</strong>{' '}
                <span className="text-[#545850]">{act.evidence}</span>
              </div>
              <div>
                <strong className="text-[#2D4A3E]">Suggested Action:</strong>{' '}
                <span className="text-[#222521] font-bold">{act.suggested_action}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-[#6E7269]">
                <span>Affected students: </span>
                <span className="text-[#222521] font-bold">{act.affected_students_names.join(', ')}</span>
              </div>

              <button
                onClick={() => handleExecute(act)}
                className="px-5 py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white font-bold rounded-2xl text-xs shadow-xs flex items-center space-x-2 transition-all"
              >
                <span>Execute Recommendation</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
