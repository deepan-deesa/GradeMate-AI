import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { GraduationCap, Sparkles, UserCheck, Users, Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle2, Send, KeyRound } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>('TEACHER');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);

  // Invitation link state
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  // Form states
  const [emailOrId, setEmailOrId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSent, setForgotSent] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // OTP Password Reset states
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('invite');
      const emailParam = params.get('email');

      if (token || emailParam) {
        setSelectedRole('STUDENT');
        setIsRegistering(true);
        if (token) setInviteToken(token);
        if (emailParam) setEmailOrId(decodeURIComponent(emailParam));
      }
    } catch (e) {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!forgotEmail) {
      setErrorMessage('Please enter your registered email address or Student ID.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to send OTP.');
        return;
      }
      setOtpStep('verify');
      setDevOtp(data.devOtp || null);
      setOtpMessage(data.message || 'OTP sent to your email.');
    } catch (err: any) {
      setErrorMessage('Error sending OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpCode || !newPassword || !confirmPassword) {
      setErrorMessage('Please complete all OTP and password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/auth/forgot-password/verify-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otpCode,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to reset password.');
        return;
      }

      setForgotSent(true);
      setOtpMessage(data.message || 'Password reset successfully!');
      setEmailOrId(forgotEmail);
      setPassword(newPassword);
    } catch (err: any) {
      setErrorMessage('Error verifying OTP and resetting password.');
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
        {inviteToken && (
          <div className="mb-4 p-4 rounded-2xl bg-[#FAF0E6] border border-[#E8CEB5] text-[#8C521F] shadow-sm flex items-start space-x-3">
            <Send className="w-5 h-5 text-[#C88A58] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm text-[#222521]">Teacher Invitation Received!</h4>
              <p className="text-xs text-[#545850] mt-0.5">
                You were invited by your teacher. Log in using default password <strong>student123</strong> or set your account details below.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-[#E0DED7] sm:px-10">
          {/* ROLE SELECTION TABS */}
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
                  setOtpStep('request');
                  setErrorMessage('');
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
                  setOtpStep('request');
                  setErrorMessage('');
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

          {/* FORGOT PASSWORD VIEW (2-STEP OTP RESET) */}
          {showForgotPassword ? (
            <div>
              <h3 className="text-lg font-bold text-[#222521] mb-2 flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-[#C88A58]" />
                <span>{otpStep === 'request' ? 'Request Password Reset OTP' : 'Verify OTP & Set New Password'}</span>
              </h3>
              <p className="text-xs text-[#545850] mb-4">
                {otpStep === 'request'
                  ? `Enter your registered ${selectedRole === 'TEACHER' ? 'Teacher Email' : 'Student Email / ID'} to receive a 6-digit OTP code.`
                  : `Enter the 6-digit OTP sent to ${forgotEmail} along with your new password.`}
              </p>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {errorMessage}
                </div>
              )}

              {forgotSent ? (
                <div className="p-4 bg-[#EAF0E8] rounded-xl border border-[#C2D4C1] text-xs text-[#1E3A2B] space-y-2 mb-4">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#2D4A3E]" />
                    <span>Password Reset Completed!</span>
                  </div>
                  <p>{otpMessage || 'Your password has been changed successfully. You can now log in with your new password.'}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotSent(false);
                      setOtpStep('request');
                    }}
                    className="mt-2 text-[#2D4A3E] underline font-bold"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              ) : otpStep === 'request' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
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
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending OTP...' : 'Send OTP to Email'}
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
              ) : (
                <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                  {devOtp && (
                    <div className="p-3 bg-[#FAF0E6] border border-[#E8CEB5] rounded-xl text-xs text-[#8C521F] font-semibold flex items-center justify-between">
                      <span>📩 Verification OTP Code:</span>
                      <span className="font-mono text-sm font-black text-[#222521] tracking-widest bg-white px-2 py-0.5 rounded border border-[#E0DED7]">
                        {devOtp}
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#545850] mb-1">6-Digit OTP Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 482910"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm font-mono tracking-widest text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#545850] mb-1">New Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#545850] mb-1">Re-enter New Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-white rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify OTP & Reset Password'}
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setOtpStep('request')}
                      className="text-[#2D4A3E] hover:underline font-semibold"
                    >
                      ← Resend OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="text-[#6E7269] hover:text-[#222521] font-medium"
                    >
                      Return to Login
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
                      onClick={() => {
                        setShowForgotPassword(true);
                        setOtpStep('request');
                        setForgotEmail(emailOrId);
                      }}
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
                    placeholder={isRegistering ? 'At least 6 characters' : 'Enter password (Default: student123)'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FDFCF8] border border-[#E0DED7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]"
                  />
                </div>
                {selectedRole === 'STUDENT' && !isRegistering && (
                  <p className="text-[11px] text-[#6E7269] mt-1">
                    * Default student password created by teacher is <strong className="text-[#2D4A3E]">student123</strong>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#2D4A3E] hover:bg-[#1E3A2B] text-[#FDFCF8] rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md disabled:opacity-50 mt-2"
              >
                <span>{isRegistering ? 'Complete Registration' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-[#E0DED7] flex items-center justify-between text-xs">
                <span className="text-[#6E7269]">
                  {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="font-bold text-[#2D4A3E] hover:underline"
                >
                  {isRegistering ? 'Sign In Here' : 'Register Account'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* QUICK DEMO CREDENTIALS HINT */}
        <div className="mt-6 p-4 bg-white/80 rounded-2xl border border-[#E0DED7] shadow-xs text-xs space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-[#222521]">
            <Sparkles className="w-4 h-4 text-[#C88A58]" />
            <span>Quick Login Hints for Testing</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-[#F4F2EC] rounded-xl border border-[#E0DED7]">
              <span className="font-bold text-[#2D4A3E] block">Teacher Portal:</span>
              <p className="text-[#545850]">teacher@school.edu / teacher123</p>
            </div>
            <div className="p-2 bg-[#FAF0E6] rounded-xl border border-[#E8CEB5]">
              <span className="font-bold text-[#8C521F] block">Student Portal:</span>
              <p className="text-[#545850]">student@school.edu / student123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
