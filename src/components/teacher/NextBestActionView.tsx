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
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-600/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Next Best Teaching Actions</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              What should I teach or revise next? Evidence-backed decision support based on student submission data.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {actions.map((act: any) => (
          <div
            key={act.id}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  act.priority === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {act.priority} Priority Action
                </span>
                <span className="text-xs text-slate-400 font-semibold">• Topic: {act.related_topic}</span>
              </div>
              <span className="text-xs text-blue-400 font-bold">{act.affected_students_count} Students Affected</span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white mb-2">{act.action_title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{act.reason}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div>
                <strong className="text-slate-200">Data Evidence:</strong>{' '}
                <span className="text-slate-400">{act.evidence}</span>
              </div>
              <div>
                <strong className="text-blue-400">Suggested Action:</strong>{' '}
                <span className="text-slate-300 font-medium">{act.suggested_action}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-400">
                <span>Affected students: </span>
                <span className="text-slate-200 font-medium">{act.affected_students_names.join(', ')}</span>
              </div>

              <button
                onClick={() => handleExecute(act)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs shadow-lg flex items-center space-x-2 transition-all"
              >
                <span>Execute Recommendation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
