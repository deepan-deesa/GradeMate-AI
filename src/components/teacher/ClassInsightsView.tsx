import React from 'react';
import { useApp } from '../../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PieChart as PieIcon, AlertTriangle, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

export const ClassInsightsView: React.FC = () => {
  const { dbState } = useApp();

  const submissions = dbState?.submissions || [];

  // Calculate dynamic error distribution from real AI evaluations
  const errorCounts: Record<string, number> = {
    'Sign Errors': 0,
    'Arithmetic Errors': 0,
    'Fraction Errors': 0,
    'Conceptual Errors': 0,
    'Missing Steps': 0,
    'Other Slips': 0,
  };

  let totalErrors = 0;
  submissions.forEach((sub: any) => {
    if (sub.errors && sub.errors.length > 0) {
      sub.errors.forEach((err: any) => {
        const typeStr = typeof err === 'string' ? err : err.error_type || '';
        if (typeStr.includes('Sign')) errorCounts['Sign Errors']++;
        else if (typeStr.includes('Arithmetic') || typeStr.includes('Calculation')) errorCounts['Arithmetic Errors']++;
        else if (typeStr.includes('Fraction')) errorCounts['Fraction Errors']++;
        else if (typeStr.includes('Conceptual')) errorCounts['Conceptual Errors']++;
        else if (typeStr.includes('Step')) errorCounts['Missing Steps']++;
        else errorCounts['Other Slips']++;
        totalErrors++;
      });
    }
  });

  const colors = ['#ef4444', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#64748b'];
  const descs: Record<string, string> = {
    'Sign Errors': 'Negative sign transposition across equals sign',
    'Arithmetic Errors': 'Mental division/multiplication slips',
    'Fraction Errors': 'Denominator cross-multiplication & LCM',
    'Conceptual Errors': 'Invalid algebraic transformation rules',
    'Missing Steps': 'Omitting intermediate term substitution',
    'Other Slips': 'Transcription or legibility errors',
  };

  const errorDistributionData = Object.keys(errorCounts)
    .map((key, idx) => ({
      name: key,
      value: totalErrors > 0 ? Math.round((errorCounts[key] / totalErrors) * 100) : 0,
      count: errorCounts[key],
      color: colors[idx],
      desc: descs[key],
    }))
    .filter((item) => totalErrors === 0 || item.value > 0);

  // Calculate dynamic topic mastery from real curriculum topics / student mastery
  const topicsMap: Record<string, { total: number; count: number }> = {};
  (dbState?.students || []).forEach((st: any) => {
    (st.topic_mastery || []).forEach((tm: any) => {
      if (!topicsMap[tm.topic]) topicsMap[tm.topic] = { total: 0, count: 0 };
      topicsMap[tm.topic].total += tm.mastery_percentage;
      topicsMap[tm.topic].count += 1;
    });
  });

  const topicMasteryData = Object.keys(topicsMap).map((top) => ({
    topic: top,
    mastery: Math.round(topicsMap[top].total / topicsMap[top].count),
  }));

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
            <span className="text-xs text-rose-400 font-semibold">
              {totalErrors > 0 ? `Total Errors Analyzed: ${totalErrors}` : 'No Errors Recorded Yet'}
            </span>
          </h3>

          {totalErrors > 0 ? (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={errorDistributionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
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
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <PieIcon className="w-10 h-10 mx-auto text-slate-600 mb-1" />
              <p className="font-bold text-slate-300">No evaluation error data available yet.</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Once student answer sheets are evaluated, aggregated calculation slips and structural misconceptions will be plotted here.
              </p>
            </div>
          )}
        </div>

        {/* Topic Mastery & Recurring Error Analysis */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">Topic Mastery Overview</h3>

            {topicMasteryData.length > 0 ? (
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
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <p className="font-bold text-slate-300">No topic mastery recorded yet.</p>
                <p className="text-[11px] text-slate-500">Evaluated student answer sheets will automatically populate topic mastery levels.</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base">Slip vs Misconception Analysis</h3>
            <p className="text-xs text-slate-400">
              GradeMate AI automatically separates single calculation slips from recurring structural misconceptions.
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                <span className="font-bold text-amber-300 block mb-1">One-Time Calculation Slips</span>
                <span className="text-2xl font-extrabold text-white">
                  {totalErrors > 0 ? `${Math.round(((errorCounts['Arithmetic Errors'] + errorCounts['Other Slips']) / totalErrors) * 100)}%` : '0%'}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Isolated slips unlikely to require reteaching.</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
                <span className="font-bold text-purple-300 block mb-1">Recurring Misconceptions</span>
                <span className="text-2xl font-extrabold text-white">
                  {totalErrors > 0 ? `${Math.round(((errorCounts['Sign Errors'] + errorCounts['Fraction Errors'] + errorCounts['Conceptual Errors']) / totalErrors) * 100)}%` : '0%'}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Structural gaps requiring targeted practice.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
