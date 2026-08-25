import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  UserPlus,
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Upload, 
  BrainCircuit, 
  Sparkles, 
  ChevronRight,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

export const TeacherDashboard: React.FC = () => {
  const { userSession, dbState, setActiveView, setSelectedStudentId, addToast, refreshState } = useApp();
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('Grade 10');
  const [newStudentSection, setNewStudentSection] = useState('A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const students = dbState?.students || [];
  const submissions = dbState?.submissions || [];
  const assignments = dbState?.assignments || [];

  // Dynamic Class Stats
  const totalStudents = students.length;
  const totalAssignmentsCount = assignments.length + submissions.length;
  const averageClassScore = submissions.length > 0
    ? Math.round(submissions.reduce((acc: number, s: any) => acc + ((s.score || 0) / (s.max_score || 10)) * 100, 0) / submissions.length)
    : 0;
  
  // Find common learning gap
  const gapCounts: Record<string, number> = {};
  submissions.forEach((s: any) => {
    if (s.errors) {
      s.errors.forEach((err: any) => {
        const typeStr = typeof err === 'string' ? err : err.error_type || 'General Error';
        gapCounts[typeStr] = (gapCounts[typeStr] || 0) + 1;
      });
    }
  });
  let commonLearningGap = 'No errors logged';
  let maxGapCount = 0;
  Object.keys(gapCounts).forEach((gap) => {
    if (gapCounts[gap] > maxGapCount) {
      maxGapCount = gapCounts[gap];
      commonLearningGap = gap;
    }
  });

  const studentsNeedingSupport = students.filter(
    (s: any) => (s.overall_mastery ?? s.overallAccuracy ?? 100) < 65
  ).length;

  const stats = {
    totalStudents,
    totalAssignments: totalAssignmentsCount,
    averageClassScore,
    commonLearningGap,
    studentsNeedingSupport,
    interventionSuccessRate: dbState?.classStats?.interventionSuccessRate || (submissions.length > 0 ? 80 : 0),
  };

  // Dynamic Class Performance Trend from Real Submissions
  const performanceTrend = submissions.map((sub: any, idx: number) => ({
    week: `Eval #${idx + 1}`,
    score: Math.round(((sub.score || 0) / (sub.max_score || 10)) * 100),
    target: 75,
    title: sub.assignment_title || `Submission ${idx + 1}`,
  }));

  // Dynamic Error Distribution Data
  const errorCounts: Record<string, number> = {
    'Sign Errors': 0,
    'Arithmetic Errors': 0,
    'Fraction Errors': 0,
    'Conceptual Errors': 0,
    'Missing Steps': 0,
    'Other Slips': 0,
  };
  let totalErrorsCount = 0;
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
        totalErrorsCount++;
      });
    }
  });

  const errorColors = ['#C85A54', '#C88A58', '#A36B88', '#5B7065', '#2D4A3E', '#888B83'];
  const errorDistributionData = Object.keys(errorCounts)
    .map((key, idx) => ({
      name: key,
      value: totalErrorsCount > 0 ? Math.round((errorCounts[key] / totalErrorsCount) * 100) : 0,
      color: errorColors[idx],
    }))
    .filter((item) => totalErrorsCount === 0 || item.value > 0);

  const nextActions = dbState?.nextBestActions || [];
  const groups = dbState?.groups || [];

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) {
      addToast('Name and email are required', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/students/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudentName,
          email: newStudentEmail,
          grade: newStudentGrade,
          section: newStudentSection,
          teacherId: userSession?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Successfully added student ${newStudentName}!`, 'success');
        setShowAddStudentModal(false);
        setNewStudentName('');
        setNewStudentEmail('');
        await refreshState();
      } else {
        addToast(data.error || 'Failed to add student', 'error');
      }
    } catch (err: any) {
      addToast('Error creating student account', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-[#FDFCF8] min-h-screen text-[#222521] font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-[#222521]">Teacher Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF0E8] text-[#1E3A2B] text-xs font-bold border border-[#C2D4C1]">
              GradeMate Engine
            </span>
          </div>
          <p className="text-[#545850] text-sm mt-1 font-medium">
            Real-time assessment analytics, error classification, and closed-loop learning recommendations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-4 py-2.5 bg-[#3A5A40] hover:bg-[#2D4A3E] text-[#FDFCF8] rounded-xl text-xs font-bold shadow-sm flex items-center space-x-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
          <button
            onClick={() => setActiveView('upload')}
            className="px-4 py-2.5 bg-[#2D4A3E] hover:bg-[#23382F] text-[#FDFCF8] rounded-xl text-xs font-bold shadow-sm flex items-center space-x-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Evaluate Answer Sheet</span>
          </button>
          <button
            onClick={() => setActiveView('simulator')}
            className="px-4 py-2.5 bg-[#F4F2EC] hover:bg-[#EAE7DF] text-[#222521] border border-[#D5D1C5] rounded-xl text-xs font-bold flex items-center space-x-2 transition-all"
          >
            <BrainCircuit className="w-4 h-4 text-[#8C521F]" />
            <span>Simulator</span>
          </button>
        </div>
      </div>

      {/* Top Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Students', val: stats.totalStudents, icon: Users, color: 'text-[#2D4A3E]' },
          { label: 'Assignments', val: stats.totalAssignments, icon: BookOpen, color: 'text-[#3A5A40]' },
          { label: 'Avg Class Score', val: `${stats.averageClassScore}%`, icon: TrendingUp, color: 'text-[#2D4A3E]' },
          { label: 'Common Gap', val: stats.commonLearningGap, icon: AlertTriangle, color: 'text-[#C85A54]', isText: true },
          { label: 'Need Support', val: `${stats.studentsNeedingSupport} Students`, icon: Users, color: 'text-[#C88A58]', isText: true },
          { label: 'Intervention Success', val: `${stats.interventionSuccessRate}%`, icon: CheckCircle2, color: 'text-[#3A5A40]' },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E0DED7] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#6E7269]">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className={`font-extrabold ${card.isText ? 'text-sm text-[#222521] truncate' : 'text-2xl text-[#222521]'}`}>
                {card.val}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Class Performance Trend */}
        <div className="lg:col-span-2 bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-[#222521] text-base">Class Performance Trend</h3>
              <p className="text-xs text-[#545850] font-medium">Evaluation average scores vs benchmark</p>
            </div>
            {performanceTrend.length > 0 && (
              <span className="text-xs text-[#1E3A2B] font-bold bg-[#EAF0E8] px-3 py-1 rounded-full border border-[#C2D4C1]">
                {performanceTrend.length} Evaluations Recorded
              </span>
            )}
          </div>
          
          {performanceTrend.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DED7" />
                  <XAxis dataKey="week" stroke="#6E7269" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#6E7269" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E0DED7', color: '#222521', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#2D4A3E" strokeWidth={3} dot={{ r: 5, fill: '#2D4A3E' }} name="Avg Score %" />
                  <Line type="monotone" dataKey="target" stroke="#C88A58" strokeWidth={2} strokeDasharray="5 5" name="Benchmark %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-12 text-center text-[#6E7269] text-xs space-y-2 border border-dashed border-[#E0DED7] rounded-2xl">
              <TrendingUp className="w-8 h-8 mx-auto text-[#A3B19B]" />
              <p className="font-bold text-[#222521]">No assessment data available yet</p>
              <p className="text-[11px] text-[#545850]">Evaluate handwritten answer sheets to generate dynamic class performance trends.</p>
            </div>
          )}
        </div>

        {/* Chart 2: Class Error Distribution */}
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-[#222521] text-base flex items-center space-x-2">
                <PieIcon className="w-4 h-4 text-[#C85A54]" />
                <span>Class Error Distribution</span>
              </h3>
            </div>
            <p className="text-xs text-[#545850] mb-4 font-medium">Dynamically classified learning gap errors</p>

            {errorDistributionData.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={errorDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {errorDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E0DED7', color: '#222521', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-8 text-center text-[#6E7269] text-xs space-y-1 border border-dashed border-[#E0DED7] rounded-2xl">
                <p className="font-bold text-[#222521]">No error data logged</p>
                <p className="text-[11px] text-[#545850]">Evaluated student errors will populate here.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-[#E0DED7] text-xs">
            {errorDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[#545850] truncate">{item.name}: <strong className="text-[#222521]">{item.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Best Teaching Actions (Core Decision Support) */}
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-[#C88A58]" />
              <h2 className="text-lg font-extrabold text-[#222521]">Next Best Teaching Actions</h2>
              <span className="px-2 py-0.5 rounded bg-[#FAF0E6] text-[#8C521F] text-[10px] font-bold uppercase tracking-wider border border-[#E8CEB5]">
                Decision Support
              </span>
            </div>
            <p className="text-xs text-[#545850] mt-0.5 font-medium">
              Evidence-based recommendations derived from student handwritten submission data.
            </p>
          </div>

          <button
            onClick={() => setActiveView('next_actions')}
            className="text-xs text-[#2D4A3E] hover:text-[#1E3A2B] font-bold flex items-center space-x-1"
          >
            <span>View All ({nextActions.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nextActions.map((act) => (
            <div
              key={act.id}
              className="bg-[#F4F2EC] p-5 rounded-2xl border border-[#E0DED7] hover:border-[#C2D4C1] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    act.priority === 'High' ? 'bg-[#FDF0EE] text-[#8C2B22] border border-[#ECC4C1]' : 'bg-[#FAF0E6] text-[#8C521F] border border-[#E8CEB5]'
                  }`}>
                    {act.priority} Priority
                  </span>
                  <span className="text-xs text-[#6E7269] font-semibold">{act.related_topic}</span>
                </div>
                <h4 className="font-bold text-[#222521] text-sm mb-2">{act.action_title}</h4>
                <p className="text-xs text-[#545850] mb-3 line-clamp-2">{act.reason}</p>
                <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E0DED7] text-[11px] text-[#545850] mb-4">
                  <strong className="text-[#222521]">Evidence:</strong> {act.evidence}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E0DED7] text-xs">
                <span className="text-[#6E7269] font-medium">{act.affected_students_count} Students affected</span>
                <button
                  onClick={() => setActiveView('next_actions')}
                  className="px-3 py-1.5 bg-[#2D4A3E] hover:bg-[#23382F] text-[#FDFCF8] rounded-lg text-xs font-bold shadow-xs"
                >
                  Execute
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Student Grouping Preview & Student Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Student Groups */}
        <div className="lg:col-span-2 bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-[#222521] text-base">AI Student Grouping</h3>
              <p className="text-xs text-[#545850] font-medium">Automatically grouped by common misconception patterns</p>
            </div>
            <button
              onClick={() => setActiveView('grouping')}
              className="text-xs text-[#2D4A3E] hover:text-[#1E3A2B] font-bold flex items-center space-x-1"
            >
              <span>Manage Groups</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div key={group.id} className="p-4 rounded-2xl bg-[#F4F2EC] border border-[#E0DED7]">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    group.level === 'NEEDS SUPPORT' ? 'bg-[#FDF0EE] text-[#8C2B22]' : group.level === 'DEVELOPING' ? 'bg-[#FAF0E6] text-[#8C521F]' : 'bg-[#EAF0E8] text-[#1E3A2B]'
                  }`}>
                    {group.level}
                  </span>
                  <span className="text-xs text-[#6E7269] font-bold">{group.students.length} Students</span>
                </div>
                <h4 className="font-bold text-[#222521] text-sm mb-1">{group.name}</h4>
                <p className="text-xs text-[#545850] mb-3">{group.common_issue}</p>

                <div className="flex items-center space-x-2 pt-2 border-t border-[#E0DED7]">
                  {group.students.slice(0, 3).map((st) => (
                    <span
                      key={st.id}
                      className="px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#222521] text-[11px] font-medium border border-[#E0DED7]"
                    >
                      {st.name.split(' ')[0]}
                    </span>
                  ))}
                  {group.students.length > 3 && (
                    <span className="text-[10px] text-[#6E7269]">+{group.students.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Student Search / Profile Jump */}
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E0DED7] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#222521] text-base mb-1">Student Roster & Error DNA</h3>
            <p className="text-xs text-[#545850] mb-4 font-medium">Click student to inspect learning profile</p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {students.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#F4F2EC] border border-[#E0DED7] text-center space-y-2">
                  <p className="text-xs text-[#545850] font-medium">No students enrolled in your class yet.</p>
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2D4A3E] text-white hover:bg-[#1f342b] transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Your First Student
                  </button>
                </div>
              ) : (
                students.slice(0, 5).map((student) => (
                  <div
                    key={student.id}
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setActiveView('student_profile');
                    }}
                    className="p-3 rounded-xl bg-[#F4F2EC] border border-[#E0DED7] hover:border-[#2D4A3E] cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full object-cover border border-[#E0DED7]" />
                      <div>
                        <div className="text-xs font-bold text-[#222521]">{student.name}</div>
                        <div className="text-[10px] text-[#6E7269]">{student.common_error}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-[#2D4A3E]">{student.overall_mastery}%</div>
                      <div className="text-[10px] text-[#6E7269]">Mastery</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <button
              onClick={() => {
                setSelectedStudentId(students[0]?.id || 'std_1');
                setActiveView('student_profile');
              }}
              className="w-full py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5"
            >
              <span>Inspect Student Analytics Profile</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E0DED7] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0DED7] pb-3">
              <h2 className="text-lg font-bold text-[#222521] flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-[#2D4A3E]" />
                <span>Add Student to Class</span>
              </h2>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-[#6E7269] hover:text-[#222521] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#545850] mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#545850] mb-1">Student Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@grademate.edu"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#545850] mb-1">Grade / Class</label>
                  <input
                    type="text"
                    value={newStudentGrade}
                    onChange={(e) => setNewStudentGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#545850] mb-1">Section</label>
                  <input
                    type="text"
                    value={newStudentSection}
                    onChange={(e) => setNewStudentSection(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#6E7269] hover:text-[#222521]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
