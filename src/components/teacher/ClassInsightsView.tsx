import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieIcon,
  Sparkles,
  Search,
  ChevronRight,
  UserCheck,
  FileText,
  Upload,
  BrainCircuit,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  Layers,
  Award,
} from 'lucide-react';

export const ClassInsightsView: React.FC = () => {
  const { dbState, userSession, setSelectedStudentId, setActiveView } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'mastery' | 'errors'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'Mastered' | 'Developing' | 'Needs Support'>('ALL');

  const teacherName = userSession?.name || 'Teacher';
  const students = dbState?.students || [];
  const submissions = dbState?.submissions || [];
  const assignments = dbState?.assignments || [];

  // 1. Calculate Individual Performance Scores strictly for assigned students of this teacher
  const studentPerformanceList = students.map((st: any) => {
    const stSubs = submissions.filter(
      (sub: any) => sub.student_id === st.id || sub.student_name?.toLowerCase() === st.name?.toLowerCase()
    );
    const totalScoreEarned = stSubs.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
    const totalMaxMarks = stSubs.reduce((sum: number, s: any) => sum + (s.max_score || 10), 0);
    const performanceScore = totalMaxMarks > 0
      ? Math.round((totalScoreEarned / totalMaxMarks) * 100)
      : (st.overall_mastery ?? st.overallAccuracy ?? 78);

    let status: 'Mastered' | 'Developing' | 'Needs Support' = 'Developing';
    if (performanceScore >= 80) status = 'Mastered';
    else if (performanceScore < 60) status = 'Needs Support';

    return {
      ...st,
      performanceScore,
      evaluationsCount: stSubs.length,
      status,
      commonError: st.common_error || (stSubs[0]?.errors?.[0]?.error_type || 'Sign Handling'),
    };
  });

  studentPerformanceList.sort((a: any, b: any) => b.performanceScore - a.performanceScore);

  // Filtered Roster
  const filteredStudents = studentPerformanceList.filter((st: any) => {
    const matchesSearch = st.name.toLowerCase().includes(searchTerm.toLowerCase()) || st.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'ALL' || st.status === filterLevel;
    return matchesSearch && matchesFilter;
  });

  // 2. Compute Aggregated Overall Performance Metrics for this Teacher's Class
  const totalClassStudents = studentPerformanceList.length;
  const overallClassAvgScore = totalClassStudents > 0
    ? Math.round(studentPerformanceList.reduce((acc: number, s: any) => acc + s.performanceScore, 0) / totalClassStudents)
    : 0;

  const masteredCount = studentPerformanceList.filter((s: any) => s.status === 'Mastered').length;
  const developingCount = studentPerformanceList.filter((s: any) => s.status === 'Developing').length;
  const needsSupportCount = studentPerformanceList.filter((s: any) => s.status === 'Needs Support').length;

  const totalEvaluationsAnalyzed = submissions.length;

  // 3. Dynamic Error Distribution Analysis
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

  const colors = ['#C85A54', '#C88A58', '#A36B88', '#5B7065', '#2D4A3E', '#888B83'];
  const descs: Record<string, string> = {
    'Sign Errors': 'Negative sign transposition across equality',
    'Arithmetic Errors': 'Calculation or division slips',
    'Fraction Errors': 'Denominator cross-multiplication & LCM',
    'Conceptual Errors': 'Invalid algebraic rules applied',
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

  // 4. Topic Mastery Breakdown across all teacher's students
  const topicsMap: Record<string, { total: number; count: number }> = {};
  students.forEach((st: any) => {
    (st.topic_mastery || []).forEach((tm: any) => {
      if (!topicsMap[tm.topic]) topicsMap[tm.topic] = { total: 0, count: 0 };
      topicsMap[tm.topic].total += tm.mastery_percentage;
      topicsMap[tm.topic].count += 1;
    });
  });

  const topicMasteryData = Object.keys(topicsMap).map((top) => ({
    topic: top,
    mastery: Math.round(topicsMap[top].total / Math.max(1, topicsMap[top].count)),
  }));

  // Performance distribution pie chart data
  const statusPieData = [
    { name: 'Mastered (80%+)', value: masteredCount, color: '#2D4A3E' },
    { name: 'Developing (60-79%)', value: developingCount, color: '#C88A58' },
    { name: 'Needs Support (<60%)', value: needsSupportCount, color: '#C85A54' },
  ].filter((d) => d.value > 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-[#FDFCF8] min-h-screen text-[#222521] font-sans">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-[#2D4A3E]/10 text-[#2D4A3E] rounded-2xl border border-[#C2D4C1]">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1] text-xs font-bold">
                Teacher Analytics Workspace
              </span>
              <span className="text-xs text-[#6E7269]">Class Performance Intelligence</span>
            </div>
            <h1 className="text-2xl font-black text-[#222521] mt-0.5 flex items-center space-x-2">
              <span>Overall Student Performance Analytics</span>
              <Sparkles className="w-5 h-5 text-[#C88A58]" />
            </h1>
            <p className="text-[#545850] text-xs mt-0.5 font-medium">
              Assigned Teacher: <strong className="text-[#222521]">{teacherName}</strong> • {totalClassStudents} Enrolled Students
            </p>
          </div>
        </div>

        {/* Quick Component Access Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveView('students')}
            className="px-3.5 py-2 bg-[#F4F2EC] hover:bg-[#EAE7DF] text-[#222521] rounded-xl text-xs font-bold border border-[#E0DED7] flex items-center space-x-1.5 transition-all"
          >
            <UserCheck className="w-4 h-4 text-[#2D4A3E]" />
            <span>Student Profiles</span>
          </button>
          <button
            onClick={() => setActiveView('grouping')}
            className="px-3.5 py-2 bg-[#F4F2EC] hover:bg-[#EAE7DF] text-[#222521] rounded-xl text-xs font-bold border border-[#E0DED7] flex items-center space-x-1.5 transition-all"
          >
            <Layers className="w-4 h-4 text-[#C88A58]" />
            <span>Misconception Groups</span>
          </button>
          <button
            onClick={() => setActiveView('upload')}
            className="px-3.5 py-2 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Evaluate Answers</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Class Average Performance */}
        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#E0DED7] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E7269] font-semibold">
            <span>Overall Class Score</span>
            <TrendingUp className="w-4 h-4 text-[#2D4A3E]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#222521]">{overallClassAvgScore}%</span>
            <span className="text-xs font-bold text-[#2D4A3E] flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Synchronized
            </span>
          </div>
          <div className="w-full bg-[#E0DED7] h-2 rounded-full overflow-hidden">
            <div className="bg-[#2D4A3E] h-full rounded-full transition-all duration-500" style={{ width: `${overallClassAvgScore}%` }} />
          </div>
        </div>

        {/* KPI 2: Total Enrolled Students */}
        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#E0DED7] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E7269] font-semibold">
            <span>Class Roster</span>
            <Users className="w-4 h-4 text-[#3A5A40]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#222521]">{totalClassStudents}</span>
            <span className="text-xs text-[#6E7269] font-medium">Students</span>
          </div>
          <p className="text-[11px] text-[#6E7269]">Assigned to Teacher ID: {userSession?.id || 'usr_teacher'}</p>
        </div>

        {/* KPI 3: Total Evaluated Tasks */}
        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#E0DED7] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E7269] font-semibold">
            <span>AI Vision Evaluations</span>
            <FileText className="w-4 h-4 text-[#C88A58]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#222521]">{totalEvaluationsAnalyzed}</span>
            <span className="text-xs text-[#6E7269] font-medium font-mono">Answer Sheets</span>
          </div>
          <p className="text-[11px] text-[#6E7269]">CAS Step-by-step verified</p>
        </div>

        {/* KPI 4: Support Required Alert */}
        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#E0DED7] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E7269] font-semibold">
            <span>Support Needed</span>
            <AlertTriangle className="w-4 h-4 text-[#C85A54]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#8C2B22]">{needsSupportCount}</span>
            <span className="text-xs font-bold text-[#8C2B22] bg-[#FDF0EE] px-2 py-0.5 rounded border border-[#ECC4C1]">Below 60%</span>
          </div>
          <p className="text-[11px] text-[#6E7269]">Auto-Enrolled in Remedial</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-[#E0DED7] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'overview' ? 'bg-[#2D4A3E] text-[#FDFCF8] shadow-sm' : 'bg-[#FFFFFF] text-[#6E7269] hover:bg-[#FAF0E6]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Performance Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'roster' ? 'bg-[#2D4A3E] text-[#FDFCF8] shadow-sm' : 'bg-[#FFFFFF] text-[#6E7269] hover:bg-[#FAF0E6]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Performance Ranking ({studentPerformanceList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mastery')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'mastery' ? 'bg-[#2D4A3E] text-[#FDFCF8] shadow-sm' : 'bg-[#FFFFFF] text-[#6E7269] hover:bg-[#FAF0E6]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Class Topic Mastery</span>
        </button>

        <button
          onClick={() => setActiveTab('errors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'errors' ? 'bg-[#2D4A3E] text-[#FDFCF8] shadow-sm' : 'bg-[#FFFFFF] text-[#6E7269] hover:bg-[#FAF0E6]'
          }`}
        >
          <PieIcon className="w-4 h-4" />
          <span>Class Error DNA</span>
        </button>
      </div>

      {/* TAB CONTENT 1: Overview Charts */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Class Performance Breakdown */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-6">
            <h3 className="font-bold text-[#222521] text-base border-b border-[#E0DED7] pb-3 flex items-center justify-between">
              <span>Student Performance Status Distribution</span>
              <span className="text-xs text-[#2D4A3E] font-bold">{totalClassStudents} Students Evaluated</span>
            </h3>

            {statusPieData.length > 0 ? (
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {statusPieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E0DED7', color: '#222521', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-[#6E7269] text-center py-12">No student performance distribution available.</p>
            )}

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-[#EAF0E8] border border-[#C2D4C1]">
                <span className="text-[#1E3A2B] font-black text-lg block">{masteredCount}</span>
                <span className="text-[#222521] text-[11px] font-semibold">Mastered (80%+)</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF0E6] border border-[#E8CEB5]">
                <span className="text-[#8C521F] font-black text-lg block">{developingCount}</span>
                <span className="text-[#222521] text-[11px] font-semibold">Developing (60-79%)</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FDF0EE] border border-[#ECC4C1]">
                <span className="text-[#8C2B22] font-black text-lg block">{needsSupportCount}</span>
                <span className="text-[#222521] text-[11px] font-semibold">Needs Support (&lt;60%)</span>
              </div>
            </div>
          </div>

          {/* Quick Roster Leaderboard Preview */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
                <h3 className="font-bold text-[#222521] text-base">Top Performing & Active Students</h3>
                <button
                  onClick={() => setActiveTab('roster')}
                  className="text-xs text-[#2D4A3E] hover:text-[#1E3A2B] font-bold flex items-center space-x-1"
                >
                  <span>View Full Roster</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 mt-4">
                {studentPerformanceList.slice(0, 5).map((st: any) => (
                  <div
                    key={st.id}
                    onClick={() => {
                      setSelectedStudentId(st.id);
                      setActiveView('student_profile');
                    }}
                    className="p-3.5 rounded-2xl bg-[#FDFCF8] border border-[#E0DED7] hover:border-[#2D4A3E] cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} alt={st.name} className="w-9 h-9 rounded-xl object-cover border border-[#E0DED7]" />
                      <div>
                        <h4 className="font-bold text-[#222521] text-xs">{st.name}</h4>
                        <span className="text-[11px] text-[#6E7269] block">{st.commonError}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                        st.performanceScore >= 80 ? 'bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]' : st.performanceScore >= 60 ? 'bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]' : 'bg-[#FDF0EE] text-[#8C2B22] border border-[#ECC4C1]'
                      }`}>
                        {st.performanceScore}% Score
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E0DED7]">
              <button
                onClick={() => {
                  if (studentPerformanceList.length > 0) {
                    setSelectedStudentId(studentPerformanceList[0].id);
                  }
                  setActiveView('student_profile');
                }}
                className="w-full py-3 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition-all"
              >
                <span>Inspect Individual Student Performance Profiles</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Full Student Roster & Performance Ranking */}
      {activeTab === 'roster' && (
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0DED7] pb-4">
            <div>
              <h3 className="font-bold text-[#222521] text-lg">Student Performance Roster</h3>
              <p className="text-xs text-[#545850]">Directly synchronized with student login evaluations & test scores</p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#6E7269] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#FDFCF8] border border-[#E0DED7] rounded-xl pl-9 pr-4 py-2 text-xs text-[#222521] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as any)}
                className="bg-[#FDFCF8] border border-[#E0DED7] rounded-xl px-3 py-2 text-xs font-bold text-[#222521] focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
              >
                <option value="ALL">All Performance Levels</option>
                <option value="Mastered">Mastered (&gt;=80%)</option>
                <option value="Developing">Developing (60-79%)</option>
                <option value="Needs Support">Needs Support (&lt;60%)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E0DED7] text-[11px] font-bold text-[#6E7269] uppercase tracking-wider bg-[#F4F2EC]/60">
                  <th className="py-3 px-4 rounded-l-xl">Student Name</th>
                  <th className="py-3 px-4">Evaluations</th>
                  <th className="py-3 px-4">Performance Score</th>
                  <th className="py-3 px-4">Status Level</th>
                  <th className="py-3 px-4">Identified Gap</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0DED7] text-xs">
                {filteredStudents.map((st: any) => (
                  <tr key={st.id} className="hover:bg-[#FAF0E6]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#222521] flex items-center space-x-3">
                      <img src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} alt={st.name} className="w-8 h-8 rounded-xl object-cover border border-[#E0DED7]" />
                      <div>
                        <span>{st.name}</span>
                        <span className="block text-[10px] text-[#6E7269] font-normal">{st.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#545850] font-mono font-bold">
                      {st.evaluationsCount} Tasks
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-[#222521] text-sm">{st.performanceScore}%</span>
                        <div className="w-20 bg-[#E0DED7] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              st.performanceScore >= 80 ? 'bg-[#2D4A3E]' : st.performanceScore >= 60 ? 'bg-[#C88A58]' : 'bg-[#C85A54]'
                            }`}
                            style={{ width: `${st.performanceScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        st.status === 'Mastered' ? 'bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]' : st.status === 'Developing' ? 'bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]' : 'bg-[#FDF0EE] text-[#8C2B22] border border-[#ECC4C1]'
                      }`}>
                        {st.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#545850] font-medium">
                      {st.commonError}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudentId(st.id);
                          setActiveView('student_profile');
                        }}
                        className="px-3 py-1.5 bg-[#FAF0E6] hover:bg-[#E8CEB5] text-[#8C521F] rounded-lg text-xs font-bold border border-[#E8CEB5] transition-all flex items-center space-x-1 ml-auto"
                      >
                        <span>Inspect Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: Topic Mastery Breakdown */}
      {activeTab === 'mastery' && (
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-6">
          <h3 className="font-bold text-[#222521] text-base border-b border-[#E0DED7] pb-3">Topic Mastery Overview</h3>

          {topicMasteryData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicMasteryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DED7" />
                  <XAxis dataKey="topic" stroke="#6E7269" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#6E7269" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E0DED7', color: '#222521', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="mastery" fill="#2D4A3E" radius={[8, 8, 0, 0]} name="Mastery %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-8 text-center text-[#6E7269] text-xs space-y-2">
              <p className="font-bold text-[#222521]">No topic mastery recorded yet.</p>
              <p className="text-[11px] text-[#545850]">Evaluated student answer sheets will automatically populate topic mastery levels.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: Error DNA Classification */}
      {activeTab === 'errors' && (
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm space-y-6">
          <h3 className="font-bold text-[#222521] text-base border-b border-[#E0DED7] pb-3 flex items-center justify-between">
            <span>Classroom Error Distribution</span>
            <span className="text-xs text-[#C85A54] font-bold">
              {totalErrors > 0 ? `Total Errors Analyzed: ${totalErrors}` : 'No Errors Recorded Yet'}
            </span>
          </h3>

          {totalErrors > 0 ? (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={errorDistributionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0DED7" />
                    <XAxis type="number" domain={[0, 100]} stroke="#6E7269" fontSize={12} />
                    <YAxis dataKey="name" type="category" width={120} stroke="#6E7269" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E0DED7', color: '#222521', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
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
                  <div key={idx} className="p-3 rounded-xl bg-[#FDFCF8] border border-[#E0DED7] flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div>
                        <span className="font-bold text-[#222521]">{item.name}</span>
                        <p className="text-[11px] text-[#545850]">{item.desc}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-sm text-[#222521]">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-[#6E7269] text-xs space-y-2">
              <PieIcon className="w-10 h-10 mx-auto text-[#A3B19B] mb-1" />
              <p className="font-bold text-[#222521]">No evaluation error data available yet.</p>
              <p className="text-[11px] text-[#545850] max-w-sm mx-auto">
                Once student answer sheets are evaluated, aggregated calculation slips and structural misconceptions will be plotted here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
