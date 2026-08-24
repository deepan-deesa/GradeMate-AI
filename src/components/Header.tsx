import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  Sparkles, 
  RotateCcw, 
  UserCheck, 
  Users, 
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  Info,
  LogOut,
  User
} from 'lucide-react';

export const Header: React.FC = () => {
  const { userSession, logout, role, setRole, activeView, setActiveView, resetToDemo, toasts } = useApp();

  return (
    <header className="bg-[#2D4A3E] border-b border-[#23382F] text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveView(userSession ? (role === 'TEACHER' ? 'dashboard' : 'student_dashboard') : 'landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-[#3A5A40] border border-[#4F7357] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-[#FDFCF8]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-[#FDFCF8]">GradeMate-AI</span>
              </div>
              <p className="text-xs text-[#C2C9BF] hidden sm:block">
                {role === 'TEACHER' ? 'Teacher Evaluation & Gap Diagnostic Portal' : 'Student Performance & Learning Gap Portal'}
              </p>
            </div>
          </div>

          {/* Closed Loop & Supabase Connection Badge */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-[#1E3028] border border-[#3A5A40] rounded-full text-xs text-[#E0DED7]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 font-medium">Supabase Cloud</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3.5 py-1 bg-[#23382F] border border-[#3A5A40] rounded-full text-xs text-[#E0DED7]">
              <span className="text-[#A3C9A8] font-semibold">Grade</span>
              <span className="text-[#6B8573]">→</span>
              <span className="text-[#E0C097] font-semibold">Diagnose</span>
              <span className="text-[#6B8573]">→</span>
              <span className="text-[#D8A47F] font-semibold">Intervene</span>
              <span className="text-[#6B8573]">→</span>
              <span className="text-[#B5C99A] font-semibold">Reassess</span>
            </div>
          </div>

          {/* Right Controls: User Profile, Role Toggle & Actions */}
          <div className="flex items-center space-x-3">
            {role === 'TEACHER' && (
              <button
                onClick={() => setActiveView('upload')}
                className="px-3.5 py-1.5 bg-[#8B9E82] hover:bg-[#7A8C71] text-[#1E3A2B] rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Evaluate Work</span>
              </button>
            )}

            {/* Clear Database */}
            <button
              onClick={() => resetToDemo()}
              className="px-3 py-1.5 bg-[#23382F] hover:bg-[#1E3028] text-[#FDFCF8] border border-[#3A5A40] rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
              title="Clear all data and start fresh in Supabase"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C88A58]" />
              <span className="hidden md:inline">Clear Data</span>
            </button>

            {/* Role Switcher Toggle (Hidden on Login View & Hidden for logged-in Students) */}
            {activeView !== 'login' && (
              userSession?.role === 'STUDENT' ? (
                <div className="px-3 py-1 bg-[#C88A58]/20 border border-[#C88A58]/40 rounded-xl text-xs text-[#E0C097] font-semibold flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#C88A58]" />
                  <span>Student Portal</span>
                </div>
              ) : (
                <div className="bg-[#23382F] p-1 rounded-xl border border-[#3A5A40] flex items-center space-x-1">
                  <button
                    onClick={() => setRole('TEACHER')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
                      role === 'TEACHER'
                        ? 'bg-[#3A5A40] text-[#FDFCF8] shadow-sm font-semibold'
                        : 'text-[#A3B19B] hover:text-[#FDFCF8]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Teacher</span>
                  </button>
                  <button
                    onClick={() => setRole('STUDENT')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
                      role === 'STUDENT'
                        ? 'bg-[#C88A58] text-[#FDFCF8] shadow-sm font-semibold'
                        : 'text-[#A3B19B] hover:text-[#FDFCF8]'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Student</span>
                  </button>
                </div>
              )
            )}

            {/* User Session Chip / Logout */}
            {userSession ? (
              <div className="flex items-center space-x-2 border-l border-[#3A5A40] pl-3">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-7 h-7 rounded-full bg-[#3A5A40] border border-[#4F7357] flex items-center justify-center font-bold text-white shrink-0">
                    {userSession.name.charAt(0)}
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="font-bold text-[#FDFCF8] text-[11px] leading-none">{userSession.name}</p>
                    <p className="text-[10px] text-[#A3B19B] leading-none mt-0.5">{userSession.role}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-[#C2C9BF] hover:text-white hover:bg-[#23382F] rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveView('login')}
                className="px-3.5 py-1.5 bg-[#3A5A40] hover:bg-[#2D4A3E] text-white rounded-lg text-xs font-bold border border-[#4F7357] transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-md">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-3.5 rounded-xl shadow-lg border text-sm font-medium flex items-start space-x-2.5 animate-in slide-in-from-bottom-2 ${
                toast.type === 'success'
                  ? 'bg-[#EAF0E8] border-[#A3B19B] text-[#1E3A2B]'
                  : toast.type === 'error'
                  ? 'bg-[#FDF0EE] border-[#ECC4C1] text-[#8C2B22]'
                  : 'bg-[#FAF0E6] border-[#E8CEB5] text-[#8C521F]'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#2D4A3E] shrink-0 mt-0.5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#991B1B] shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};
