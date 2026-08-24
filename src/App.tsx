import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { LoginView } from './components/auth/LoginView';

// Teacher Views
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { CurriculumView } from './components/teacher/CurriculumView';
import { AssessmentsView } from './components/teacher/AssessmentsView';
import { QuestionPapersView } from './components/teacher/QuestionPapersView';
import { HandwrittenUpload } from './components/teacher/HandwrittenUpload';
import { AnalysisResultView } from './components/teacher/AnalysisResultView';
import { ClassInsightsView } from './components/teacher/ClassInsightsView';
import { StudentGroupingView } from './components/teacher/StudentGroupingView';
import { NextBestActionView } from './components/teacher/NextBestActionView';
import { StudentProfileView } from './components/teacher/StudentProfileView';
import { TeachingSimulatorView } from './components/teacher/TeachingSimulatorView';
import { ClassroomDigitalTwinView } from './components/teacher/ClassroomDigitalTwinView';
import { PracticeGeneratorView } from './components/teacher/PracticeGeneratorView';
import { Dataset1ExplorerView } from './components/teacher/Dataset1ExplorerView';
import { TeacherReportsView } from './components/teacher/TeacherReportsView';
import { TeacherSettingsView } from './components/teacher/TeacherSettingsView';
import { EvaluationReviewWorkspace } from './components/teacher/EvaluationReviewWorkspace';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentResultsView } from './components/student/StudentResultsView';
import { StudentPerformanceView } from './components/student/StudentPerformanceView';
import { StudentMistakesView } from './components/student/StudentMistakesView';
import { PersonalizedPracticeView } from './components/student/PersonalizedPracticeView';
import { StudentProfileDetailsView } from './components/student/StudentProfileDetailsView';

const MainContent: React.FC = () => {
  const { userSession, role, activeView } = useApp();

  if (activeView === 'landing') {
    return <LandingPage />;
  }

  if (activeView === 'login' || !userSession) {
    return <LoginView />;
  }

  const renderView = () => {
    // STUDENT ROLE ROUTING & ACCESS CONTROL
    if (role === 'STUDENT') {
      switch (activeView) {
        case 'student_dashboard':
          return <StudentDashboard />;
        case 'student_results':
        case 'my_grades':
          return <StudentResultsView />;
        case 'student_performance':
        case 'my_progress':
          return <StudentPerformanceView />;
        case 'student_mistakes':
          return <StudentMistakesView />;
        case 'student_practice':
        case 'personalized_practice':
          return <PersonalizedPracticeView />;
        case 'student_profile_view':
          return <StudentProfileDetailsView />;
        default:
          return <StudentDashboard />;
      }
    }

    // TEACHER ROLE ROUTING
    switch (activeView) {
      case 'dashboard':
        return <TeacherDashboard />;
      case 'curriculum':
        return <CurriculumView />;
      case 'assessments':
        return <AssessmentsView />;
      case 'question_papers':
        return <QuestionPapersView />;
      case 'upload':
        return <HandwrittenUpload />;
      case 'analysis':
        return <AnalysisResultView />;
      case 'evaluation_review':
        return <EvaluationReviewWorkspace />;
      case 'dataset1':
        return <Dataset1ExplorerView />;
      case 'students':
      case 'grouping':
      case 'student_profile':
        return <StudentProfileView />;
      case 'analytics':
      case 'insights':
      case 'digital_twin':
        return <ClassInsightsView />;
      case 'reports':
        return <TeacherReportsView />;
      case 'settings':
        return <TeacherSettingsView />;
      case 'next_actions':
        return <NextBestActionView />;
      case 'simulator':
        return <TeachingSimulatorView />;
      case 'practice_generator':
        return <PracticeGeneratorView />;
      default:
        return <TeacherDashboard />;
    }
  };

  return (
    <div className="flex flex-1 min-h-[calc(100vh-4rem)] bg-[#FDFCF8] text-[#222521]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FDFCF8]">
        {renderView()}
      </main>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-[#FDFCF8] text-[#222521] font-sans selection:bg-[#2D4A3E] selection:text-white">
        <Header />
        <MainContent />
      </div>
    </AppProvider>
  );
}

export default App;
