import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { GraduationCap, Sparkles, UserCheck, Users, Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>('TEACHER');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);

  // Form states
  const [emailOrId, setEmailOrId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSent, setForgotSent] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (showForgotPassword) {
      setForgotSent(true);
      return;
    }

    if (!emailOrId || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    const credentials = {
      email: emailOrId.includes('@') ? emailOrId : `${emailOrId.toLowerCase()}@student.school`,
      studentId: selectedRole === 'STUDENT' && !emailOrId.includes('@') ? emailOrId : undefined,
      password,
      name: fullName || (emailOrId.includes('@') ? emailOrId.split('@')[0] : emailOrId),
      isRegistering,
    };

    try {
      await login(selectedRole, credentials);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-[#222521]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2D4A3E] border border-[#23382F] shadow-md mb-4">
          <GraduationCap className="w-8 h-8 text-[#FDFCF8]" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#222521] tracking-tight">
          GradeMate<span className="text-[#2D4A3E]">-AI</span>
        </h2>
        <p className="mt-2 text-sm text-[#545850]">
          Closed-loop educational evaluation & learning gap diagnostics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-[#E0DED7] sm:px-10">
          
          {/* STEP 1: ROLE SELECTION TABS */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6E7269] mb-2 text-center">
              Select Your Role to Continue
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F4F2EC] rounded-xl border border-[#E0DED7]">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('TEACHER');
                  setIsRegistering(false);
                  setShowForgotPassword(false);
                }}
                className={`py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                  selectedRole === 'TEACHER'
                    ? 'bg-[#2D4A3E] text-[#FDFCF8] shadow-sm'
                    : 'text-[#545850] hover:text-[#222521] hover:bg-[#EAE7DF]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('STUDENT');
                  setIsRegistering(false);
                  setShowForgotPassword(false);
                }}
                className={`py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                  selectedRole === 'STUDENT'
                    ? 'bg-[#C88A58] text-[#FDFCF8] shadow-sm'
                    : 'text-[#545850] hover:text-[#222521] hover:bg-[#EAE7DF]'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Student</span>
              </button>
            </div>
          </div>



          {/* FORGOT PASSWORD VIEW */}
          {showForgotPassword ? (
            <div>
              <h3 className="text-lg font-bold text-[#222521] mb-2">Reset Password</h3>
              <p className="text-xs text-[#545850] mb-4">
                Enter your registered {selectedRole === 'TEACHER' ? 'Teacher email' : 'Student Email / ID'} to receive a password reset link.
              </p>

              {forgotSent ? (
                <div className="p-4 bg-[#EAF0E8] rounded-xl border border-[#C2D4C1] text-xs text-[#1E3A2B] space-y-2 mb-4">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#2D4A3E]" />
                    <span>Reset Link Sent!</span>
                  </div>
                  <p>We sent reset instructions to <strong>{forgotEmail || 'your email address'}</strong>.</p>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                    className="mt-2 text-[#2D4A3E] underline font-bold"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#545850] mb-1">
                      {selectedRole === 'TEACHER' ? 'Teacher Email Address' : 'Student Email / ID'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={selectedRole === 'TEACHER' ? 'teacher@school.edu' : 'student@school.edu or STD-2024-001'}
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl font-bold text-sm transition-all shadow-sm"
                  >
                    Send Reset Link
                  </button>
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="text-xs text-[#6E7269] hover:text-[#222521] font-medium"
                    >
                      Cancel & Return to Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* LOGIN & REGISTRATION FORMS */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-b border-[#E0DED7] pb-3 mb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#222521]">
                  {isRegistering
                    ? `Create ${selectedRole === 'TEACHER' ? 'Teacher' : 'Student'} Account`
                    : `${selectedRole === 'TEACHER' ? 'Teacher Portal Sign In' : 'Student Portal Sign In'}`}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F4F2EC] text-[#545850] border border-[#E0DED7]">
                  {selectedRole} ROLE
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {errorMessage}
                </div>
              )}

              {isRegistering && (
                <div>
                  <label className="block text-xs font-semibold text-[#545850] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A3B19B] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder={selectedRole === 'TEACHER' ? 'e.g. Prof. John Smith' : 'e.g. Alice Johnson'}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#545850] mb-1">
                  {selectedRole === 'TEACHER' ? 'Teacher Email' : 'Email / Student ID'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A3B19B] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedRole === 'TEACHER'
                        ? 'teacher@school.edu'
                        : 'student@school.edu or STD-2024-8902'
                    }
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#545850]">Password</label>
                  {!isRegistering && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-[#2D4A3E] hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A3B19B] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 ${
                  selectedRole === 'TEACHER'
                    ? 'bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white'
                    : 'bg-[#C88A58] hover:bg-[#B37949] text-white'
                }`}
              >
                <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-[#E0DED7] text-center">
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-xs text-[#2D4A3E] hover:underline font-bold"
                >
                  {isRegistering
                    ? 'Already have an account? Sign In'
                    : selectedRole === 'TEACHER'
                    ? 'Create Teacher Account'
                    : 'Create Student Account'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security badge footer */}
        <div className="mt-6 text-center flex items-center justify-center space-x-2 text-xs text-[#6E7269]">
          <ShieldCheck className="w-4 h-4 text-[#2D4A3E]" />
          <span>Role-Authenticated & Secure Learning Environment</span>
        </div>
      </div>
    </div>
  );
};
