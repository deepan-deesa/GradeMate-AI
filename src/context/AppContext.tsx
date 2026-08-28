import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import {
  Role,
  UserSession,
  SubmissionAnalysis,
  StudentProfile,
  PracticeSet,
  FeedbackMode,
  SimulatorQueryResponse,
  Curriculum,
  CurriculumTopic,
  EvaluationSettings,
} from '../types';

async function safeFetchJson(url: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data: any; isHtml?: boolean; error?: string }> {
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return { ok: response.ok, status: response.status, data };
    } catch {
      return { ok: false, status: response.status, data: null, isHtml: true, error: text.slice(0, 100) };
    }
  } catch (err: any) {
    return { ok: false, status: 500, data: null, error: err.message };
  }
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  userSession: UserSession | null;
  login: (role: Role, credentials: { email: string; password: string; studentId?: string; name?: string }) => void;
  logout: () => void;
  role: Role;
  setRole: (role: Role) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  selectedSubmission: SubmissionAnalysis | null;
  setSelectedSubmission: (sub: SubmissionAnalysis | null) => void;
  curricula: Curriculum[];
  selectedCurriculumId: string;
  setSelectedCurriculumId: (id: string) => void;
  dbState: any | null;
  isLoading: boolean;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  activePracticeSet: PracticeSet | null;
  setActivePracticeSet: (ps: PracticeSet | null) => void;
  evaluationSettings: EvaluationSettings;
  updateEvaluationSettings: (newSettings: EvaluationSettings) => Promise<void>;
  
  // API Actions
  refreshState: (overrideSession?: UserSession | null) => Promise<void>;
  resetToDemo: () => Promise<void>;
  uploadSyllabus: (payload: {
    name: string;
    board: string;
    class_year: string;
    subject: string;
    academic_year: string;
    file_name?: string;
    file_base64?: string;
    file_mime_type?: string;
    raw_text?: string;
    onProgressStatus?: (statusText: string) => void;
  }) => Promise<Curriculum>;
  deleteSyllabus: (id: string) => Promise<void>;
  updateCurriculumTopic: (curriculumId: string, topicId: string, data: Partial<CurriculumTopic>) => Promise<void>;
  createAssessment: (payload: { title: string; subject: string; topic: string; unit?: string; curriculum_id: string; max_marks?: number; question_marks?: number; due_date?: string; assigned_student_id?: string }) => Promise<any>;
  deleteAssessment: (id: string) => Promise<void>;
  analyzeHandwriting: (payload: {
    image_base64?: string;
    question: string;
    topic?: string;
    subject?: string;
    max_marks?: number;
    student_id?: string;
    student_name?: string;
    feedback_mode?: FeedbackMode;
    curriculum_id?: string;
    question_paper_id?: string;
  }) => Promise<SubmissionAnalysis>;
  overrideGrade: (submissionId: string, newScore: number, comment?: string) => Promise<void>;
  generateTargetedPractice: (studentId: string, concept: string, errorType: string) => Promise<PracticeSet>;
  submitPracticeAnswers: (practiceSetId: string, answers: Record<string, string>) => Promise<any>;
  askSimulator: (query: string) => Promise<SimulatorQueryResponse>;
  generateRemedialAssignment: (topic: string) => Promise<any>;
  uploadQuestionPaper: (payload: { title?: string; file_name?: string; file_base64?: string; topic?: string; max_marks?: number }) => Promise<any>;
  deleteQuestionPaper: (id: string) => Promise<void>;
  fetchDataset1: () => Promise<{ total: number; items: any[] }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      // Clean up legacy localStorage item if present to prevent automatic login after app reopen
      if (typeof window !== 'undefined' && localStorage.getItem('assessly_user_session')) {
        localStorage.removeItem('assessly_user_session');
      }
      const stored = typeof window !== 'undefined' ? sessionStorage.getItem('assessly_user_session') : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const [role, setRoleState] = useState<Role>(userSession ? userSession.role : 'TEACHER');
  const [activeView, setActiveView] = useState<string>(
    userSession ? (userSession.role === 'TEACHER' ? 'dashboard' : 'student_dashboard') : 'login'
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std_1');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionAnalysis | null>(null);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('');

  useEffect(() => {
    if (userSession && userSession.role === 'STUDENT') {
      if (role !== 'STUDENT') {
        setRoleState('STUDENT');
      }
      if (userSession.studentId && userSession.studentId !== selectedStudentId) {
        setSelectedStudentId(userSession.studentId);
      }
    }
  }, [userSession, role, selectedStudentId]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const login = async (
    loginRole: Role, 
    credentials: { email: string; password: string; studentId?: string; name?: string; isRegistering?: boolean }
  ) => {
    try {
      const endpoint = credentials.isRegistering ? '/api/auth/register' : '/api/auth/login';
      const cleanEmail = credentials.email.trim().toLowerCase();
      const cleanName = credentials.name?.trim() || cleanEmail.split('@')[0];
      const cleanStdId = credentials.studentId?.trim() || (loginRole === 'STUDENT' ? `std_${Date.now()}` : undefined);

      let userObj: any = null;

      // 1. Try Express API Endpoint first with safe JSON parser
      const apiRes = await safeFetchJson(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: credentials.password,
          name: cleanName,
          role: loginRole,
          studentId: cleanStdId,
        }),
      });

      if (apiRes.ok && apiRes.data?.user) {
        userObj = apiRes.data.user;
      } else if (!apiRes.isHtml && apiRes.data?.error) {
        // Express returned a valid structured business error (e.g. incorrect password)
        const errorMsg = apiRes.data.error;
        addToast(errorMsg, 'error');
        throw new Error(errorMsg);
      } else {
        // 2. Direct Supabase Client Fallback (e.g. static hosting deployment where /api returns 404 HTML)
        console.log('[GradeMate Auth] Using direct Supabase Client authentication fallback...');
        if (credentials.isRegistering) {
          const userId = `usr_${Date.now()}`;
          const newUserRow: any = {
            id: userId,
            name: cleanName,
            email: cleanEmail,
            passwordHash: credentials.password,
            role: loginRole,
            studentId: cleanStdId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const { error: upsertErr } = await supabase.from('User').upsert(newUserRow);
          if (upsertErr) {
            console.warn('[Supabase Direct Auth Warning]:', upsertErr.message);
          }
          userObj = newUserRow;
        } else {
          const { data: dbUser, error: queryErr } = await supabase
            .from('User')
            .select('*')
            .or(`email.eq.${cleanEmail},studentId.eq.${cleanEmail}`)
            .maybeSingle();

          if (queryErr || !dbUser) {
            const errorMsg = 'No account found in database for this email/student ID. Please click "Create Account" to register.';
            addToast(errorMsg, 'error');
            throw new Error(errorMsg);
          }

          if (dbUser.passwordHash && dbUser.passwordHash !== credentials.password) {
            const errorMsg = 'Incorrect password. Please check your credentials.';
            addToast(errorMsg, 'error');
            throw new Error(errorMsg);
          }

          userObj = dbUser;
        }
      }

      if (!userObj) {
        throw new Error('Authentication failed. Please try again.');
      }

      const session: UserSession = {
        id: userObj.id,
        name: userObj.name || cleanName,
        email: userObj.email || cleanEmail,
        role: userObj.role || loginRole,
        studentId: userObj.studentId || cleanStdId,
      };

      const actualRole: Role = userObj.role || loginRole;
      setUserSession(session);
      setRoleState(actualRole);
      if (userObj.studentId) {
        setSelectedStudentId(userObj.studentId);
      }
      sessionStorage.setItem('assessly_user_session', JSON.stringify(session));

      // Fetch fresh database state for authenticated user BEFORE opening dashboard
      await refreshState(session);

      if (actualRole === 'TEACHER') {
        setActiveView('dashboard');
        addToast(`Welcome ${session.name}! Teacher portal active.`, 'success');
      } else {
        setActiveView('student_dashboard');
        addToast(`Welcome ${session.name}! Student portal active.`, 'success');
      }
    } catch (err: any) {
      throw err;
    }
  };

  const logout = () => {
    setUserSession(null);
    sessionStorage.removeItem('assessly_user_session');
    localStorage.removeItem('assessly_user_session');
    setDbState(null);
    setActiveView('login');
    addToast('Logged out successfully', 'info');
  };

  const setRole = (newRole: Role) => {
    if (userSession && userSession.role !== newRole) {
      logout();
      addToast(`Logged out. Please sign in with an authorized ${newRole === 'TEACHER' ? 'Teacher' : 'Student'} account.`, 'info');
      return;
    }
    setRoleState(newRole);
    if (newRole === 'STUDENT') {
      setActiveView('student_dashboard');
    } else {
      setActiveView('dashboard');
    }
  };

  const [dbState, setDbState] = useState<any | null>(null);
  const [activePracticeSet, setActivePracticeSet] = useState<PracticeSet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [evaluationSettings, setEvaluationSettings] = useState<EvaluationSettings>({
    feedbackMode: 'Socratic',
    partialCreditStrictness: 'Balanced',
    autoFlagReview: true,
  });

  const updateEvaluationSettings = async (newSettings: EvaluationSettings) => {
    try {
      setEvaluationSettings(newSettings);
      const res = await fetch('/api/teacher/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        addToast('Teacher evaluation settings saved to DBMS!', 'success');
        await refreshState();
      }
    } catch (e) {
      console.error(e);
      addToast('Failed to save settings to DBMS', 'error');
    }
  };

  const refreshState = async (overrideSession?: UserSession | null) => {
    const activeSession = overrideSession !== undefined ? overrideSession : userSession;
    try {
      setIsLoading(true);

      const queryParams = new URLSearchParams();
      if (activeSession?.id) {
        queryParams.append('teacherId', activeSession.id);
        queryParams.append('role', activeSession.role);
        if (activeSession.studentId) queryParams.append('studentId', activeSession.studentId);
      }
      
      const apiRes = await safeFetchJson(`/api/db/state?${queryParams.toString()}`, {
        headers: {
          'x-teacher-id': activeSession?.id || '',
          'x-user-role': activeSession?.role || '',
          'x-student-id': activeSession?.studentId || '',
        },
      });

      if (apiRes.ok && apiRes.data) {
        const data = apiRes.data;
        if (data.assignments && Array.isArray(data.assignments)) {
          data.assignments.forEach((a: any) => {
            if ((!a.questions || a.questions.length === 0) && typeof window !== 'undefined') {
              try {
                const cached = localStorage.getItem(`grademate_asgn_questions_${a.id}`);
                if (cached) a.questions = JSON.parse(cached);
              } catch {}
            } else if (Array.isArray(a.questions) && a.questions.length > 0 && typeof window !== 'undefined') {
              try {
                localStorage.setItem(`grademate_asgn_questions_${a.id}`, JSON.stringify(a.questions));
              } catch {}
            }
          });
        }
        setDbState(data);
        setCurricula(data.curricula || []);
        if (data.evaluationSettings) {
          setEvaluationSettings(data.evaluationSettings);
        }
        if (data.submissions && data.submissions.length > 0) {
          setSelectedSubmission(data.submissions[0]);
        } else {
          setSelectedSubmission(null);
        }
        if (data.practiceSets && data.practiceSets.length > 0) {
          setActivePracticeSet(data.practiceSets[0]);
        } else {
          setActivePracticeSet(null);
        }
        if (data.students && data.students.length > 0) {
          if (!data.students.some((s: any) => s.id === selectedStudentId)) {
            setSelectedStudentId(data.students[0].id);
          }
        }
        if (data.curricula && data.curricula.length > 0) {
          setSelectedCurriculumId(data.curricula[0].id);
        }
      } else {
        // Fallback: Query Supabase tables directly
        console.log('[GradeMate State] Loading directly from Supabase Cloud...');
        const teacherId = activeSession?.id;
        const [currRes, asgnRes, stdRes] = await Promise.all([
          teacherId ? supabase.from('Curriculum').select('*').eq('teacherId', teacherId) : supabase.from('Curriculum').select('*'),
          teacherId ? supabase.from('Assessment').select('*').eq('teacherId', teacherId) : supabase.from('Assessment').select('*'),
          (activeSession?.role === 'TEACHER' && teacherId)
            ? supabase.from('User').select('*').eq('role', 'STUDENT').or(`teacherId.eq.${teacherId},teacher_id.eq.${teacherId}`)
            : supabase.from('User').select('*').eq('role', 'STUDENT'),
        ]);

        const curriculaData = (currRes.data || []).map((c: any) => ({
          id: c.id,
          teacherId: c.teacherId,
          name: c.name,
          board: c.board,
          class: c.class,
          subject: c.subject,
          academicYear: c.academicYear,
          fileUrl: c.fileUrl,
          fileName: c.fileName,
          status: c.status || 'Analysed',
          unitsCount: c.unitsCount || 0,
          topicsCount: c.topicsCount || 0,
          conceptsCount: c.conceptsCount || 0,
          rawText: c.rawText,
          createdAt: c.createdAt,
        }));

        const assignmentsData = (asgnRes.data || []).map((a: any) => {
          let questions = Array.isArray(a.questions) ? a.questions : [];
          if (questions.length === 0 && typeof window !== 'undefined') {
            try {
              const cached = localStorage.getItem(`grademate_asgn_questions_${a.id}`);
              if (cached) questions = JSON.parse(cached);
            } catch {}
          }
          return {
            id: a.id,
            teacherId: a.teacherId,
            curriculumId: a.curriculumId,
            title: a.title,
            subject: a.subject,
            topic: a.topic || 'General Topic',
            total_submissions: 0,
            max_marks: a.totalMarks || 10,
            average_score: 0,
            due_date: a.dueDate ? String(a.dueDate).split('T')[0] : '2026-08-30',
            questions,
            createdAt: a.createdAt,
          };
        });

        const studentsData = (stdRes.data || []).map((u: any) => ({
          id: u.studentId || u.id,
          name: u.name,
          email: u.email,
          class: 'Grade 10 A',
          overall_mastery: 0,
          overallAccuracy: 0,
          totalEvaluations: 0,
          error_frequency: 0,
          common_error: 'None recorded yet',
          error_dna: [],
          weakTopics: [],
          strongTopics: [],
          strengths: ['Enrolled Student'],
          needs_improvement: [],
          topic_mastery: [],
          assignment_history: [],
          learning_velocity: 'Active Student',
          digitalTwinSummary: `${u.name} enrolled in GradeMate AI.`,
        }));

        const fallbackState = {
          curricula: curriculaData,
          assignments: assignmentsData,
          students: studentsData,
          submissions: [],
          groups: [],
          nextBestActions: [],
          interventions: [],
          practiceSets: [],
          classStats: {
            totalStudents: studentsData.length,
            totalAssignments: assignmentsData.length,
            averageClassScore: 0,
            commonLearningGap: 'None recorded yet',
            studentsNeedingSupport: 0,
            interventionSuccessRate: 0,
          },
        };

        setDbState(fallbackState);
        setCurricula(curriculaData);
        if (curriculaData.length > 0) setSelectedCurriculumId(curriculaData[0].id);
        if (studentsData.length > 0) setSelectedStudentId(studentsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load DB state:', err);
      addToast('Loaded offline state', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userSession) {
      refreshState(userSession);
    } else {
      setDbState(null);
    }
  }, [userSession]);

  const uploadSyllabus = async (payload: {
    name: string;
    board: string;
    class_year: string;
    subject: string;
    academic_year: string;
    file_name?: string;
    file_base64?: string;
    file_mime_type?: string;
    raw_text?: string;
    onProgressStatus?: (statusText: string) => void;
  }): Promise<Curriculum> => {
    setIsLoading(true);
    try {
      const updateProgress = (text: string) => {
        if (payload.onProgressStatus) payload.onProgressStatus(text);
      };

      updateProgress('Uploading syllabus...');
      await new Promise((r) => setTimeout(r, 400));
      
      updateProgress('Reading syllabus...');
      await new Promise((r) => setTimeout(r, 500));

      updateProgress('Understanding curriculum...');
      await new Promise((r) => setTimeout(r, 500));

      updateProgress('Identifying units...');
      await new Promise((r) => setTimeout(r, 500));

      updateProgress('Identifying topics...');
      await new Promise((r) => setTimeout(r, 500));

      updateProgress('Creating evaluation knowledge base...');

      const res = await fetch('/api/curricula/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          teacher_id: userSession?.id || 'usr_teacher_demo',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to analyze syllabus');
      }

      const data = await res.json();
      updateProgress('Syllabus ready for evaluation');
      await refreshState();
      setSelectedCurriculumId(data.curriculum.id);
      addToast(`Analyzed syllabus "${data.curriculum.name}"! Knowledge base ready.`, 'success');
      return data.curriculum;
    } catch (err: any) {
      addToast(err.message || 'Syllabus upload failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSyllabus = async (id: string) => {
    try {
      const res = await fetch(`/api/curricula/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Syllabus and knowledge base deleted from database', 'success');
        if (selectedCurriculumId === id) {
          const remaining = curricula.filter((c) => c.id !== id);
          setSelectedCurriculumId(remaining.length > 0 ? remaining[0].id : '');
        }
        await refreshState();
      } else {
        addToast('Failed to delete syllabus from database', 'error');
      }
    } catch (e) {
      addToast('Failed to delete syllabus', 'error');
    }
  };

  const updateCurriculumTopic = async (curriculumId: string, topicId: string, data: Partial<CurriculumTopic>) => {
    try {
      const res = await fetch(`/api/curricula/${curriculumId}/topic/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        addToast('Updated topic learning objective', 'success');
        await refreshState();
      }
    } catch (e) {
      addToast('Failed to update topic', 'error');
    }
  };

  const createAssessment = async (payload: {
    title: string;
    subject: string;
    topic: string;
    unit?: string;
    curriculum_id: string;
    max_marks?: number;
    question_marks?: number;
    due_date?: string;
    assigned_student_id?: string;
  }) => {
    try {
      const res = await fetch('/api/assessments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          teacher_id: userSession?.id || 'usr_teacher_demo',
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate AI assessment from syllabus');
      }
      const data = await res.json();
      if (data.assignment?.id && Array.isArray(data.assignment.questions) && data.assignment.questions.length > 0 && typeof window !== 'undefined') {
        try {
          localStorage.setItem(`grademate_asgn_questions_${data.assignment.id}`, JSON.stringify(data.assignment.questions));
        } catch {}
      }
      addToast(`Created assessment "${data.assignment.title}" linked to syllabus!`, 'success');
      await refreshState();
      return data.assignment;
    } catch (e: any) {
      addToast(e.message || 'Failed to create assessment', 'error');
      throw e;
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/assessments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        addToast('Assessment permanently removed from database.', 'success');
        await refreshState();
      } else {
        const data = await res.json();
        addToast(data.error || 'Failed to delete assessment', 'error');
      }
    } catch (err: any) {
      console.error('Error deleting assessment:', err);
      addToast('Failed to delete assessment from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadQuestionPaper = async (payload: {
    title?: string;
    file_name?: string;
    file_base64?: string;
    topic?: string;
    max_marks?: number;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/question-papers/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          teacher_id: userSession?.id || 'usr_teacher_demo',
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to upload question paper');
      }
      const data = await res.json();
      addToast(`Saved question paper "${data.paper.title}" to database!`, 'success');
      await refreshState();
      return data.paper;
    } catch (err: any) {
      addToast(err.message || 'Failed to upload question paper', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuestionPaper = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/question-papers/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        addToast('Question paper deleted from database.', 'success');
        await refreshState();
      } else {
        addToast('Failed to delete question paper', 'error');
      }
    } catch (err: any) {
      addToast('Failed to delete question paper from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDemo = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/db/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDbState(data.db);
        if (data.db.submissions.length > 0) {
          setSelectedSubmission(data.db.submissions[0]);
        }
        if (data.db.practiceSets.length > 0) {
          setActivePracticeSet(data.db.practiceSets[0]);
        }
        addToast('Reset to demo dataset successfully!', 'success');
      }
    } catch (e) {
      addToast('Failed to reset demo data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeHandwriting = async (payload: {
    image_base64?: string;
    question?: string;
    topic?: string;
    subject?: string;
    max_marks?: number;
    student_id?: string;
    student_name?: string;
    feedback_mode?: FeedbackMode;
    curriculum_id?: string;
    question_paper_id?: string;
  }): Promise<SubmissionAnalysis> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze-handwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data = await res.json();
      const newSub: SubmissionAnalysis = data.submission;
      
      setSelectedSubmission(newSub);
      await refreshState();
      addToast(`Analyzed submission for ${newSub.student_name}. Score: ${newSub.score}/${newSub.max_score}`, 'success');
      return newSub;
    } catch (e: any) {
      addToast(e.message || 'Error analyzing handwritten math', 'error');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const overrideGrade = async (submissionId: string, newScore: number, comment?: string) => {
    try {
      const res = await fetch('/api/submissions/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: submissionId, new_score: newScore, teacher_comment: comment }),
      });
      if (res.ok) {
        addToast(`Grade overridden to ${newScore} marks`, 'success');
        await refreshState();
      }
    } catch (e) {
      addToast('Failed to override grade', 'error');
    }
  };

  const generateTargetedPractice = async (studentId: string, concept: string, errorType: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, concept, error_type: errorType }),
      });
      const data = await res.json();
      const ps = data.practiceSet;
      setActivePracticeSet(ps);
      await refreshState();
      addToast(`Generated 5 targeted practice questions for ${ps.student_name}!`, 'success');
      return ps;
    } catch (e) {
      addToast('Error generating practice set', 'error');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const submitPracticeAnswers = async (practiceSetId: string, answers: Record<string, string>) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practice_set_id: practiceSetId, student_answers: answers }),
      });
      const data = await res.json();
      setActivePracticeSet(data.practiceSet);
      await refreshState();
      addToast(`Practice submitted! Accuracy: ${data.afterAccuracy}% (+${data.improvementDelta}% improvement)`, 'success');
      return data;
    } catch (e) {
      addToast('Error submitting practice answers', 'error');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const askSimulator = async (query: string): Promise<SimulatorQueryResponse> => {
    try {
      const res = await fetch('/api/simulator/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      return data.result;
    } catch (e) {
      addToast('Simulator query failed', 'error');
      throw e;
    }
  };

  const generateRemedialAssignment = async (topic: string) => {
    try {
      const res = await fetch('/api/assignments/generate-remedial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      addToast(`Created remedial assignment: ${data.assignment.title}`, 'success');
      await refreshState();
      return data.assignment;
    } catch (e) {
      addToast('Failed to generate assignment', 'error');
    }
  };

  const fetchDataset1 = async () => {
    try {
      const res = await fetch('/api/dataset1');
      if (res.ok) {
        return await res.json();
      }
      return { total: 0, items: [] };
    } catch (e) {
      console.error('Failed to fetch dataset1:', e);
      return { total: 0, items: [] };
    }
  };

  return (
    <AppContext.Provider
      value={{
        userSession,
        login,
        logout,
        role,
        setRole,
        activeView,
        setActiveView,
        selectedStudentId,
        setSelectedStudentId,
        selectedSubmission,
        setSelectedSubmission,
        curricula,
        selectedCurriculumId,
        setSelectedCurriculumId,
        dbState,
        isLoading,
        toasts,
        addToast,
        activePracticeSet,
        setActivePracticeSet,
        evaluationSettings,
        updateEvaluationSettings,
        refreshState,
        resetToDemo,
        uploadSyllabus,
        deleteSyllabus,
        updateCurriculumTopic,
        createAssessment,
        deleteAssessment,
        analyzeHandwriting,
        overrideGrade,
        generateTargetedPractice,
        submitPracticeAnswers,
        askSimulator,
        generateRemedialAssignment,
        uploadQuestionPaper,
        deleteQuestionPaper,
        fetchDataset1,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
