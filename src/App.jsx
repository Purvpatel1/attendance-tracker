import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { CompleteProfilePage } from './components/profile/CompleteProfilePage';
import { isProfileComplete } from './utils/profileUtils';
import { AppHeader } from './components/layout/AppHeader';
import { Sidebar } from './components/layout/Sidebar';
import { Navigation } from './components/layout/Navigation';
import { StudentDashboardView } from './components/dashboard/StudentDashboardView';
import { TimetableScheduleView } from './components/timetable/TimetableScheduleView';
import { SubjectsDirectoryView } from './components/subjects/SubjectsDirectoryView';
import { AttendanceAnalyticsView } from './components/attendance/AttendanceAnalyticsView';
import { AttendanceHistoryView } from './components/history/AttendanceHistoryView';
import { StudentProfileView } from './components/profile/StudentProfileView';
import { Spinner } from './components/common/Spinner';

const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="app-shell">
      {/* Sticky Desktop Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Workspace */}
      <div className="app-main-area">
        <AppHeader activeTab={activeTab} />

        <main className="main-content">
          {activeTab === 'home' && <StudentDashboardView setActiveTab={setActiveTab} />}

          {activeTab === 'today' && <TimetableScheduleView />}

          {activeTab === 'subjects' && <SubjectsDirectoryView />}

          {activeTab === 'analytics' && <AttendanceAnalyticsView />}

          {activeTab === 'history' && <AttendanceHistoryView />}

          {activeTab === 'profile' && <StudentProfileView />}
        </main>
      </div>

      {/* Mobile Floating Bottom Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const AppMain = () => {
  const { user, profile, loading, isPasswordRecovery } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner label="Loading Student Session..." />
      </div>
    );
  }

  if (isPasswordRecovery) {
    return <AuthPage initialMode="reset" />;
  }

  if (!user) {
    return <AuthPage />;
  }

  if (!isProfileComplete(profile)) {
    return <CompleteProfilePage />;
  }

  return <DashboardContent />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppMain />
      </AuthProvider>
    </ThemeProvider>
  );
}
