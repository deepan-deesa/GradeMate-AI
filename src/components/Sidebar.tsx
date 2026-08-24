import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  FileCheck, 
  UploadCloud, 
  Users, 
  BarChart3, 
  Settings,
  Sparkles,
  Award,
  TrendingUp,
  AlertTriangle,
  Target,
  User,
  Home
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { role, activeView, setActiveView } = useApp();

  if (activeView === 'landing' || activeView === 'login') {
    return null; // Landing & Login pages handle full layout
  }

  const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen, badge: 'Syllabus' },
    { id: 'assessments', label: 'Assessments', icon: FileText },
    { id: 'question_papers', label: 'Question Papers', icon: FileCheck },
    { id: 'upload', label: 'Answer Sheets', icon: UploadCloud, badge: 'AI Vision' },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const studentNavItems = [
    { id: 'student_dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student_results', label: 'My Results', icon: Award },
    { id: 'student_performance', label: 'Performance', icon: TrendingUp },
    { id: 'student_mistakes', label: 'Mistakes', icon: AlertTriangle, badge: 'AI Gap' },
    { id: 'student_practice', label: 'Practice', icon: Target, badge: 'Drills' },
    { id: 'student_profile_view', label: 'Profile', icon: User },
  ];

  const items = role === 'TEACHER' ? teacherNavItems : studentNavItems;

  return (
    <aside className="w-64 bg-[#F4F2EC] border-r border-[#E0DED7] text-[#222521] min-h-[calc(100vh-4rem)] flex flex-col shrink-0 p-4">
      {/* Role Title */}
      <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#6E7269] mb-2 flex items-center justify-between">
        <span>{role === 'TEACHER' ? 'Teacher Portal' : 'Student Portal'}</span>
        <button
          onClick={() => setActiveView('landing')}
          className="text-xs text-[#2D4A3E] hover:text-[#1E3A2B] font-semibold flex items-center space-x-1"
        >
          <Home className="w-3 h-3" />
          <span>Home</span>
        </button>
      </div>

      {/* Nav List */}
      <nav className="space-y-1.5 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#2D4A3E] text-[#FDFCF8] shadow-sm font-bold'
                  : 'hover:bg-[#EAE7DF] text-[#545850] hover:text-[#222521]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FDFCF8]' : 'text-[#6E7269]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-[#3A5A40] text-[#FDFCF8]'
                      : 'bg-[#EAF0E8] text-[#1E3A2B] border border-[#C2D4C1]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Closed Loop Reminder Footer */}
      <div className="mt-6 p-3.5 bg-[#EAE7DF] rounded-xl border border-[#E0DED7] text-xs">
        <p className="font-bold text-[#222521] mb-1">Closed-Loop Model</p>
        <p className="text-[#545850] text-[11px] leading-relaxed">
          Grade → Diagnose → Intervene → Reassess → Measure Improvement
        </p>
      </div>
    </aside>
  );
};
