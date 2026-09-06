import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { AppHeader } from './components/layout/AppHeader';
import { Navigation } from './components/layout/Navigation';
import { TimetableScheduleView } from './components/timetable/TimetableScheduleView';
import { SubjectsDirectoryView } from './components/subjects/SubjectsDirectoryView';
import { AttendanceAnalyticsView } from './components/attendance/AttendanceAnalyticsView';
import { Card } from './components/common/Card';
import { Spinner } from './components/common/Spinner';

const DashboardContent = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('today');

  return (
    <div className="app-container">
      <AppHeader />

      <main className="main-content">
        {activeTab === 'today' && <TimetableScheduleView />}

        {activeTab === 'subjects' && <SubjectsDirectoryView />}

        {activeTab === 'analytics' && <AttendanceAnalyticsView />}

        {activeTab === 'profile' && (
          <Card title="Student Profile Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-muted">Full Name:</span>
                <strong>{profile?.full_name || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-muted">Roll Number / ID:</span>
                <strong>{profile?.roll_number || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-muted">College Branch:</span>
                <strong>{profile?.branch || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-muted">Practical Batch:</span>
                <strong>Batch {profile?.batch || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Email Address:</span>
                <strong>{user?.email}</strong>
              </div>
            </div>
          </Card>
        )}
      </main>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const AppMain = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner label="Loading Student Session..." />
      </div>
    );
  }

  return user ? <DashboardContent /> : <AuthPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppMain />
    </AuthProvider>
  );
}
