import React from 'react';
import { useApp } from '../../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PieChart as PieIcon, AlertTriangle, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

export const ClassInsightsView: React.FC = () => {
  const { dbState } = useApp();

  const errorDistributionData = [
    { name: 'Sign Errors', value: 32, color: '#ef4444', desc: 'Negative sign transposition across equals sign' },
    { name: 'Arithmetic Errors', value: 21, color: '#f59e0b', desc: 'Mental division/multiplication slips' },
    { name: 'Fraction Errors', value: 17, color: '#ec4899', desc: 'Denominator cross-multiplication & LCM' },
    { name: 'Conceptual Errors', value: 15, color: '#8b5cf6', desc: 'Invalid algebraic transformation rules' },
    { name: 'Missing Steps', value: 9, color: '#3b82f6', desc: 'Omitting intermediate term substitution' },
    { name: 'Other Slips', value: 6, color: '#64748b', desc: 'Transcription or legibility errors' },
  ];

  const topicMasteryData = [
    { topic: 'Linear Equations', mastery: 86 },
    { topic: 'Algebraic Simplification', mastery: 72 },
    { topic: 'Fraction Equations', mastery: 58 },
    { topic: 'Quadratics', mastery: 52 },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
            <PieIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Class Learning Insights & Error DNA</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Aggregated error classification and prerequisite mastery distribution across Class 8 Mathematics.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Error Distribution Pie/Bar */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Classroom Error Distribution</span>
            <span className="text-xs text-rose-400 font-semibold">Sign Errors — 32% (Primary Gap)</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 40]} stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" width={120} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {errorDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {errorDistributionData.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <span className="font-bold text-white">{item.name}</span>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-slate-200">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Mastery & Recurring Error Analysis */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">Topic Mastery Overview</h3>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicMasteryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="topic" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }} />
                  <Bar dataKey="mastery" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Mastery %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base">Slip vs Misconception Analysis</h3>
            <p className="text-xs text-slate-400">
              GradeMate AI automatically separates single calculation slips from recurring structural misconceptions.
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                <span className="font-bold text-amber-300 block mb-1">One-Time Calculation Slips</span>
                <span className="text-2xl font-extrabold text-white">28%</span>
                <p className="text-[11px] text-slate-400 mt-1">Isolated slips unlikely to require reteaching.</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
                <span className="font-bold text-purple-300 block mb-1">Recurring Misconceptions</span>
                <span className="text-2xl font-extrabold text-white">72%</span>
                <p className="text-[11px] text-slate-400 mt-1">Structural gaps requiring targeted practice.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
