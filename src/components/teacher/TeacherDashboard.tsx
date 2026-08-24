import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
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
  const { dbState, setActiveView, setSelectedStudentId } = useApp();

  const stats = dbState?.classStats || {
    totalStudents: 42,
    totalAssignments: 128,
    averageClassScore: 76,
    commonLearningGap: 'Sign Errors & Integer Operations',
    studentsNeedingSupport: 8,
    interventionSuccessRate: 84,
  };

  // Chart Data
  const performanceTrend = [
    { week: 'W1', score: 62, target: 75 },
    { week: 'W2', score: 68, target: 75 },
    { week: 'W3', score: 71, target: 75 },
    { week: 'W4', score: 76, target: 75 },
    { week: 'W5', score: 81, target: 75 },
  ];

  const errorDistributionData = [
    { name: 'Sign Errors', value: 32, color: '#C85A54' },
    { name: 'Arithmetic Errors', value: 21, color: '#C88A58' },
    { name: 'Fraction Errors', value: 17, color: '#A36B88' },
    { name: 'Conceptual Errors', value: 15, color: '#5B7065' },
    { name: 'Missing Steps', value: 9, color: '#2D4A3E' },
    { name: 'Other Slips', value: 6, color: '#888B83' },
  ];

  const topicMasteryData = [
    { topic: 'Linear Equations', mastery: 86 },
    { topic: 'Transposition', mastery: 68 },
    { topic: 'Fractions', mastery: 58 },
    { topic: 'Quadratics', mastery: 52 },
  ];

  const nextActions = dbState?.nextBestActions || [];
  const groups = dbState?.groups || [];
  const students = dbState?.students || [];

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
            onClick={() => setActiveView('upload')}
            className="px-4 py-2.5 bg-[#2D4A3E] hover:bg-[#23382F] text-[#FDFCF8] rounded-xl text-xs font-bold shadow-sm flex items-center space-x-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Evaluate Handwritten Answer</span>
          </button>
          <button
            onClick={() => setActiveView('simulator')}
            className="px-4 py-2.5 bg-[#F4F2EC] hover:bg-[#EAE7DF] text-[#222521] border border-[#D5D1C5] rounded-xl text-xs font-bold flex items-center space-x-2 transition-all"
          >
            <BrainCircuit className="w-4 h-4 text-[#8C521F]" />
            <span>What-If Simulator</span>
          </button>
        </div>
      </div>

      {/* Top Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Students', val: stats.totalStudents, icon: Users, color: 'text-[#2D4A3E]' },
          { label: 'Assignments', val: stats.totalAssignments, icon: BookOpen, color: 'text-[#3A5A40]' },
          { label: 'Avg Class Score', val: `${stats.averageClassScore}%`, icon: TrendingUp, color: 'text-[#2D4A3E]' },
          { label: 'Common Gap', val: 'Sign Errors', icon: AlertTriangle, color: 'text-[#C85A54]', isText: true },
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
              <div className={`font-extrabold ${card.isText ? 'text-base text-[#222521]' : 'text-2xl text-[#222521]'}`}>
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
              <p className="text-xs text-[#545850] font-medium">Weekly average assessment scores vs mastery benchmark</p>
            </div>
            <span className="text-xs text-[#1E3A2B] font-bold bg-[#EAF0E8] px-3 py-1 rounded-full border border-[#C2D4C1]">
              +19% Growth over 5 weeks
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0DED7" />
                <XAxis dataKey="week" stroke="#6E7269" fontSize={12} />
                <YAxis domain={[40, 100]} stroke="#6E7269" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E0DED7', color: '#222521', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                />
                <Line type="monotone" dataKey="score" stroke="#2D4A3E" strokeWidth={3} dot={{ r: 5, fill: '#2D4A3E' }} name="Avg Score %" />
                <Line type="monotone" dataKey="target" stroke="#C88A58" strokeWidth={2} strokeDasharray="5 5" name="Benchmark %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
              {students.slice(0, 5).map((student) => (
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
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedStudentId(students[0]?.id || 'std_1');
              setActiveView('student_profile');
            }}
            className="w-full mt-4 py-2.5 bg-[#F4F2EC] hover:bg-[#EAE7DF] text-[#222521] text-xs font-bold rounded-xl border border-[#D5D1C5] transition-colors"
          >
            Open Full Student Profile
          </button>
        </div>
      </div>
    </div>
  );
};
