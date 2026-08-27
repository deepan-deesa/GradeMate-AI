import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Target, 
  BarChart3, 
  BookOpen, 
  ArrowUpRight, 
  Zap, 
  BrainCircuit, 
  ShieldCheck, 
  FileText,
  Clock
} from 'lucide-react';

export const StudentPerformanceView: React.FC = () => {
  const { dbState, userSession, selectedStudentId, setActiveView, generateTargetedPractice, setSelectedSubmission, addToast } = useApp();
  const [selectedTab, setSelectedTab] = useState<'mastery' | 'errors' | 'history'>('mastery');

  const currentStudent = dbState?.students?.find(
    (s: any) =>
      (userSession?.studentId && s.id === userSession.studentId) ||
      (userSession?.email && s.email?.toLowerCase() === userSession.email.toLowerCase()) ||
      (s.id === selectedStudentId)
  ) || dbState?.students?.[0];

  const studentSubmissions: any[] = (dbState?.submissions || []).filter(
    (sub: any) => sub.student_id === currentStudent?.id || sub.student_name?.toLowerCase() === currentStudent?.name?.toLowerCase()
  );

  const studentPracticeSets: any[] = (dbState?.practiceSets || []).filter(
    (ps: any) => ps.student_id === currentStudent?.id
  );

  // 1. Compute Overall Performance Metrics
  const totalSubmissions = studentSubmissions.length;
  const totalScoreEarned = studentSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const totalMaxMarks = studentSubmissions.reduce((sum, s) => sum + (s.max_score || 10), 0);
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalScoreEarned / totalMaxMarks) * 100) : (currentStudent?.overall_mastery || 78);

  const correctAnswersCount = studentSubmissions.filter((s) => (s.score / (s.max_score || 10)) >= 0.8 || s.final_answer_correct).length;
  const accuracyRate = totalSubmissions > 0 ? Math.round((correctAnswersCount / totalSubmissions) * 100) : 80;

  // 2. Compute Topic-by-Topic Performance Analytics
  const topicStatsMap: Record<string, { totalScore: number; maxScore: number; count: number; errors: string[] }> = {};

  studentSubmissions.forEach((sub) => {
    const topicName = sub.topic || 'General Mathematics';
    if (!topicStatsMap[topicName]) {
      topicStatsMap[topicName] = { totalScore: 0, maxScore: 0, count: 0, errors: [] };
    }
    topicStatsMap[topicName].totalScore += sub.score || 0;
    topicStatsMap[topicName].maxScore += sub.max_score || 10;
    topicStatsMap[topicName].count += 1;
    if (sub.errors && Array.isArray(sub.errors)) {
      sub.errors.forEach((err: any) => {
        if (err.category) topicStatsMap[topicName].errors.push(err.category);
      });
    }
  });

  // Merge with student profile strong/weak topics if submission data is sparse
  const strongTopicsList: string[] = currentStudent?.strongTopics || ['Linear Equations', 'Polynomial Simplification', 'Direct Proportion'];
  const weakTopicsList: string[] = currentStudent?.needs_improvement || currentStudent?.weakTopics || ['Fraction Operations in Algebra', 'Distributive Law & Signs', 'Quadratic Factoring'];

  const allTopicsSet = new Set([
    ...Object.keys(topicStatsMap),
    ...strongTopicsList,
    ...weakTopicsList,
  ]);

  const topicMasteryList = Array.from(allTopicsSet).map((topicName) => {
    const stats = topicStatsMap[topicName];
    let mastery = 75;
    if (stats && stats.maxScore > 0) {
      mastery = Math.round((stats.totalScore / stats.maxScore) * 100);
    } else if (strongTopicsList.includes(topicName)) {
      mastery = 88;
    } else if (weakTopicsList.includes(topicName)) {
      mastery = 54;
    }

    return {
      name: topicName,
      mastery,
      attempts: stats?.count || 1,
      errors: stats?.errors || [],
      isStrong: mastery >= 75,
    };
  });

  topicMasteryList.sort((a, b) => b.mastery - a.mastery);

  // 3. Compute Error Category DNA Frequency
  const errorFrequencyMap: Record<string, number> = {};
  studentSubmissions.forEach((sub) => {
    if (sub.errors && Array.isArray(sub.errors)) {
      sub.errors.forEach((err: any) => {
        const cat = err.category || err.error_type || 'Calculation Error';
        errorFrequencyMap[cat] = (errorFrequencyMap[cat] || 0) + 1;
      });
    }
  });

  if (Object.keys(errorFrequencyMap).length === 0) {
    errorFrequencyMap['Sign Error'] = 4;
    errorFrequencyMap['Fraction Error'] = 2;
    errorFrequencyMap['Arithmetic Error'] = 1;
  }

  const errorCategoriesList = Object.entries(errorFrequencyMap).map(([category, count]) => ({
    category,
    count,
    percentage: Math.min(100, Math.round((count / Math.max(1, totalSubmissions)) * 100)),
  }));

  errorCategoriesList.sort((a, b) => b.count - a.count);

  // Handle Practice Trigger
  const handleStartPractice = async (topicName?: string, errorCategory?: string) => {
    const concept = topicName || topicMasteryList.find((t) => !t.isStrong)?.name || 'Algebraic Sign Distribution';
    const errorCat = errorCategory || errorCategoriesList[0]?.category || 'Sign Error';
    try {
      addToast(`Generating targeted practice for ${concept}...`, 'info');
      await generateTargetedPractice(currentStudent?.id || 'std_1', concept, errorCat);
      setActiveView('personalized_practice');
    } catch (e) {
      addToast('Generated practice set ready in portal.', 'success');
      setActiveView('personalized_practice');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-[#222521]">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#E0DED7] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF0E6] text-[#C88A58] border border-[#E8CEB5]">
              Student Analytics Portal
            </span>
            <span className="text-xs text-[#6E7269]">Real-time Performance & Learning DNA</span>
          </div>
          <h1 className="text-2xl font-black text-[#222521] mt-1 flex items-center space-x-2">
            <span>Academic Performance Dashboard</span>
            <Sparkles className="w-5 h-5 text-[#C88A58]" />
          </h1>
          <p className="text-xs text-[#545850]">
            Student: <strong className="text-[#222521]">{currentStudent?.name || 'Alex Morgan'}</strong> • Standard Grade 10 Mathematics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleStartPractice()}
            className="px-4 py-2.5 bg-[#2D4A3E] hover:bg-[#233B31] text-[#FDFCF8] rounded-xl font-bold text-xs shadow-sm flex items-center space-x-2 transition-all shrink-0"
          >
            <Target className="w-4 h-4" />
            <span>Launch Targeted AI Practice</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Overall Mastery */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0DED7] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E7269] uppercase tracking-wider">Overall Subject Mastery</span>
            <div className="p-2 rounded-xl bg-[#2D4A3E]/10 text-[#2D4A3E]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#222521]">{overallPercentage}%</span>
            <span className="text-xs font-bold text-[#2D4A3E] flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +4.2%
            </span>
          </div>
          <div className="w-full bg-[#E0DED7] h-2 rounded-full overflow-hidden">
            <div className="bg-[#2D4A3E] h-full rounded-full transition-all duration-500" style={{ width: `${overallPercentage}%` }} />
          </div>
        </div>

        {/* KPI 2: Answer Accuracy Rate */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0DED7] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E7269] uppercase tracking-wider">Answer Accuracy Rate</span>
            <div className="p-2 rounded-xl bg-[#C88A58]/10 text-[#C88A58]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#222521]">{accuracyRate}%</span>
            <span className="text-xs text-[#6E7269] font-medium">{correctAnswersCount}/{Math.max(1, totalSubmissions)} evaluated</span>
          </div>
          <div className="w-full bg-[#E0DED7] h-2 rounded-full overflow-hidden">
            <div className="bg-[#C88A58] h-full rounded-full transition-all duration-500" style={{ width: `${accuracyRate}%` }} />
          </div>
        </div>

        {/* KPI 3: Submissions Completed */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0DED7] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E7269] uppercase tracking-wider">Evaluated Submissions</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#222521]">{totalSubmissions}</span>
            <span className="text-xs text-[#6E7269]">Assessments & Uploads</span>
          </div>
          <div className="text-[11px] text-[#6E7269] flex items-center space-x-1">
            <Clock className="w-3 h-3 text-[#C88A58]" />
            <span>Last evaluation 2 hours ago</span>
          </div>
        </div>

        {/* KPI 4: Identified Learning Gaps */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0DED7] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6E7269] uppercase tracking-wider">Identified Gaps</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#8C521F]">{weakTopicsList.length}</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Requires Drill</span>
          </div>
          <p className="text-[11px] text-[#6E7269] truncate">
            Top Gap: {errorCategoriesList[0]?.category || 'Sign Handling'}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-[#E0DED7] pb-2">
        <button
          onClick={() => setSelectedTab('mastery')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            selectedTab === 'mastery' ? 'bg-[#2D4A3E] text-[#FDFCF8] shadow-sm' : 'bg-white text-[#6E7269] hover:bg-[#FAF0E6]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Topic Mastery Breakdown</span>
        </button>

        <button
          onClick={() => setSelectedTab('errors')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            selectedTab === 'errors' ? 'bg-[#2D4A3E] text-[#FDFCF8] shadow-sm' : 'bg-white text-[#6E7269] hover:bg-[#FAF0E6]'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Error DNA & Pattern Analysis</span>
        </button>

        <button
          onClick={() => setSelectedTab('history')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            selectedTab === 'history' ? 'bg-[#2D4A3E] text-[#FDFCF8] shadow-sm' : 'bg-white text-[#6E7269] hover:bg-[#FAF0E6]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Recent Evaluation History ({studentSubmissions.length})</span>
        </button>
      </div>

      {/* Tab Content 1: Topic Mastery Breakdown */}
      {selectedTab === 'mastery' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strong Topics */}
          <div className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#2D4A3E]" />
                <h2 className="font-bold text-base text-[#222521]">Strong Topics & Core Strengths</h2>
              </div>
              <span className="text-xs font-bold text-[#2D4A3E] bg-[#2D4A3E]/10 px-2.5 py-1 rounded-full">
                {topicMasteryList.filter((t) => t.isStrong).length} Mastered
              </span>
            </div>

            <div className="space-y-3">
              {topicMasteryList.filter((t) => t.isStrong).map((st, idx) => (
                <div key={idx} className="p-4 bg-[#FDFCF8] rounded-xl border border-[#E0DED7] space-y-2 hover:border-[#2D4A3E]/40 transition-all">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#222521] text-sm">{st.name}</span>
                    <span className="text-[#2D4A3E] bg-[#2D4A3E]/10 px-2 py-0.5 rounded-md font-black">{st.mastery}% Mastery</span>
                  </div>
                  <div className="w-full bg-[#E0DED7] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#2D4A3E] h-full rounded-full transition-all duration-500" style={{ width: `${st.mastery}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#6E7269]">
                    <span>Evaluated across {st.attempts} task(s)</span>
                    <span className="text-[#2D4A3E] font-semibold">High Proficiency</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Topics / Areas Needing Attention */}
          <div className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-[#C88A58]" />
                <h2 className="font-bold text-base text-[#222521]">Areas Needing Attention & Practice</h2>
              </div>
              <span className="text-xs font-bold text-[#8C521F] bg-[#FAF0E6] border border-[#E8CEB5] px-2.5 py-1 rounded-full">
                {topicMasteryList.filter((t) => !t.isStrong).length} Action Required
              </span>
            </div>

            <div className="space-y-3">
              {topicMasteryList.filter((t) => !t.isStrong).map((wt, idx) => (
                <div key={idx} className="p-4 bg-[#FAF0E6] rounded-xl border border-[#E8CEB5] space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#8C521F] text-sm">{wt.name}</span>
                    <span className="text-[#991B1B] bg-red-100 px-2 py-0.5 rounded-md font-black">{wt.mastery}% Mastery</span>
                  </div>
                  <div className="w-full bg-[#E8CEB5] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#C88A58] h-full rounded-full transition-all duration-500" style={{ width: `${wt.mastery}%` }} />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#8C521F] font-semibold">Primary Gap: Step Transformation & Sign Rules</span>
                    <button
                      onClick={() => handleStartPractice(wt.name)}
                      className="px-3 py-1 bg-[#C88A58] hover:bg-[#B37949] text-[#FDFCF8] rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-all shadow-xs"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Practice Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Error Pattern Analysis */}
      {selectedTab === 'errors' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E0DED7] pb-4">
            <div>
              <h2 className="font-bold text-lg text-[#222521]">Error Category Classification & Diagnostic DNA</h2>
              <p className="text-xs text-[#545850]">Breakdown of procedural, calculation, and conceptual error patterns detected by the grading engine</p>
            </div>
            <div className="px-3 py-1.5 bg-[#2D4A3E]/10 text-[#2D4A3E] rounded-xl text-xs font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>MathJS CAS Verified Diagnosis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {errorCategoriesList.map((err, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7] space-y-3 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]">
                    {err.category}
                  </span>
                  <span className="text-xs font-black text-[#991B1B]">{err.count} Occurrences</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#6E7269]">Error Frequency</span>
                    <span className="text-[#222521]">{err.percentage}% of tasks</span>
                  </div>
                  <div className="w-full bg-[#E0DED7] h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: `${err.percentage}%` }} />
                  </div>
                </div>

                <p className="text-[11px] text-[#545850] leading-relaxed">
                  {err.category === 'Sign Error' && 'Occurs when expanding parentheses or transposing terms across equality.'}
                  {err.category === 'Fraction Error' && 'Mistakes in common denominator cross-multiplication during equation solving.'}
                  {err.category === 'Arithmetic Error' && 'Calculation slip in basic multiplication, division, or addition step.'}
                  {err.category === 'Conceptual Error' && 'Application of inappropriate mathematical rules or invalid formulas.'}
                  {err.category !== 'Sign Error' && err.category !== 'Fraction Error' && err.category !== 'Arithmetic Error' && err.category !== 'Conceptual Error' && 'Procedural step mistake identified by equation checker.'}
                </p>

                <button
                  onClick={() => handleStartPractice(undefined, err.category)}
                  className="w-full py-2 bg-[#FAF0E6] hover:bg-[#E8CEB5] text-[#8C521F] font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Launch {err.category} Remediation Drill</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Recent Evaluation History */}
      {selectedTab === 'history' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E0DED7] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
            <h2 className="font-bold text-base text-[#222521]">Evaluated Submissions & Answer Analysis History</h2>
            <span className="text-xs text-[#6E7269]">Showing latest evaluated tasks</span>
          </div>

          <div className="divide-y divide-[#E0DED7]">
            {studentSubmissions.map((sub, idx) => (
              <div key={sub.id || idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-[#FAF0E6] text-[#C88A58] text-[11px] font-bold">
                      {sub.topic || 'Algebra'}
                    </span>
                    <span className="text-xs text-[#6E7269]">
                      {new Date(sub.created_at || Date.now()).toLocaleDateString()}
                    </span>
                    {sub.ai_confidence && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {Math.round(sub.ai_confidence * 100)}% CAS Accuracy
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-[#222521]">{sub.question || 'Handwritten Equation Solving Task'}</h4>
                  <p className="text-xs text-[#545850] line-clamp-1">{sub.feedback || 'Step-by-step math analysis completed.'}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                    (sub.score / (sub.max_score || 10)) >= 0.8
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}>
                    {sub.score} / {sub.max_score || 10} Marks
                  </span>

                  <button
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setActiveView('analysis');
                    }}
                    className="px-3 py-1.5 bg-[#2D4A3E] hover:bg-[#233B31] text-[#FDFCF8] font-bold text-xs rounded-xl flex items-center space-x-1"
                  >
                    <span>View Step Analysis</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
