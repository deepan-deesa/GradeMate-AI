import React, { createContext, useContext, useState, useEffect } from 'react';
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
  refreshState: () => Promise<void>;
  resetToDemo: () => Promise<void>;
  uploadSyllabus: (payload: {
    name: string;
    board: string;
    class_year: string;
    subject: string;
    academic_year: string;
    file_name?: string;
    raw_text?: string;
    onProgressStatus?: (statusText: string) => void;
  }) => Promise<Curriculum>;
  deleteSyllabus: (id: string) => Promise<void>;
  updateCurriculumTopic: (curriculumId: string, topicId: string, data: Partial<CurriculumTopic>) => Promise<void>;
  createAssessment: (payload: { title: string; subject: string; topic: string; curriculum_id: string; max_marks?: number; due_date?: string }) => Promise<any>;
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
  }) => Promise<SubmissionAnalysis>;
  overrideGrade: (submissionId: string, newScore: number, comment?: string) => Promise<void>;
  generateTargetedPractice: (studentId: string, concept: string, errorType: string) => Promise<PracticeSet>;
  submitPracticeAnswers: (practiceSetId: string, answers: Record<string, string>) => Promise<any>;
  askSimulator: (query: string) => Promise<SimulatorQueryResponse>;
  generateRemedialAssignment: (topic: string) => Promise<any>;
  fetchDataset1: () => Promise<{ total: number; items: any[] }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem('assessly_user_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id === 'usr_teacher_demo' || parsed.email?.includes('assessly.edu') || parsed.email?.includes('grademate.edu')) {
          localStorage.removeItem('assessly_user_session');
          return null;
        }
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
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
          role: loginRole,
          studentId: credentials.studentId,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.user) {
        const errorMsg = data.error || 'Authentication failed. Please check credentials.';
        addToast(errorMsg, 'error');
        throw new Error(errorMsg);
      }

      const session: UserSession = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        studentId: data.user.studentId,
      };

      const actualRole: Role = data.user.role || loginRole;
      setUserSession(session);
      setRoleState(actualRole);
      if (data.user.studentId) {
        setSelectedStudentId(data.user.studentId);
      }
      localStorage.setItem('assessly_user_session', JSON.stringify(session));

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
    localStorage.removeItem('assessly_user_session');
    setActiveView('login');
    addToast('Logged out successfully', 'info');
  };

  const setRole = (newRole: Role) => {
    if (userSession && userSession.role === 'STUDENT' && newRole === 'TEACHER') {
      addToast('Student accounts are restricted to Student Portal access.', 'error');
      return;
    }
    setRoleState(newRole);
    if (userSession) {
      const updatedSession = { ...userSession, role: newRole };
      setUserSession(updatedSession);
      localStorage.setItem('assessly_user_session', JSON.stringify(updatedSession));
    }
    if (newRole === 'STUDENT') {
      setActiveView('student_dashboard');
    } else {
      setActiveView('dashboard');
    }
    addToast(`Switched view to ${newRole === 'TEACHER' ? 'Teacher Portal' : 'Student Portal'}`, 'info');
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

  const refreshState = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/db/state');
      if (res.ok) {
        const data = await res.json();
        setDbState(data);
        setCurricula(data.curricula || []);
        if (data.evaluationSettings) {
          setEvaluationSettings(data.evaluationSettings);
        }
        if (data.submissions && data.submissions.length > 0 && !selectedSubmission) {
          setSelectedSubmission(data.submissions[0]);
        }
        if (data.practiceSets && data.practiceSets.length > 0 && !activePracticeSet) {
          setActivePracticeSet(data.practiceSets[0]);
        }
        if (data.curricula && data.curricula.length > 0 && !selectedCurriculumId) {
          setSelectedCurriculumId(data.curricula[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load DB state:', err);
      addToast('Error loading application state', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  const uploadSyllabus = async (payload: {
    name: string;
    board: string;
    class_year: string;
    subject: string;
    academic_year: string;
    file_name?: string;
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
        addToast('Syllabus and knowledge base deleted successfully', 'success');
        await refreshState();
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
    curriculum_id: string;
    max_marks?: number;
    due_date?: string;
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
      if (!res.ok) throw new Error('Failed to create assessment');
      const data = await res.json();
      addToast(`Created assessment "${data.assignment.title}" linked to syllabus!`, 'success');
      await refreshState();
      return data.assignment;
    } catch (e: any) {
      addToast(e.message || 'Failed to create assessment', 'error');
      throw e;
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
    question: string;
    topic?: string;
    subject?: string;
    max_marks?: number;
    student_id?: string;
    student_name?: string;
    feedback_mode?: FeedbackMode;
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
        analyzeHandwriting,
        overrideGrade,
        generateTargetedPractice,
        submitPracticeAnswers,
        askSimulator,
        generateRemedialAssignment,
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
