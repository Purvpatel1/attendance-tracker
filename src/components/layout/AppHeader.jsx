import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ThemeToggle } from '../common/ThemeToggle';
import { GraduationCap, LogOut, User } from 'lucide-react';

export const AppHeader = ({ activeTab = 'home' }) => {
  const { profile, user, signOut } = useAuth();

  const studentName = profile?.full_name || user?.email?.split('@')[0] || 'Student';
  const branch = profile?.branch || 'Computer Engineering (CE)';
  const batch = profile?.batch || 'CE1';

  const titlesMap = {
    home: { title: 'Dashboard', subtitle: "Here's your attendance overview" },
    today: { title: 'Schedule', subtitle: 'View and mark daily timetable slots' },
    subjects: { title: 'Subjects', subtitle: 'Curriculum course directory' },
    analytics: { title: 'Analytics', subtitle: 'Detailed attendance statistics & targets' },
    history: { title: 'History', subtitle: 'Complete log timeline and filters' },
    profile: { title: 'Profile', subtitle: 'Academic info and account settings' },
  };

  const currentMeta = titlesMap[activeTab] || titlesMap.home;

  return (
    <header className="app-header">
      <div className="header-titles">
        {/* Mobile-only brand badge */}
        <div className="mobile-brand-row">
          <div className="brand-icon">
            <GraduationCap size={18} color="#fff" />
          </div>
          <span className="mobile-brand-title">Attendance Hub</span>
        </div>

        <h1 className="header-page-title">{currentMeta.title}</h1>
        <p className="header-page-subtitle">{currentMeta.subtitle}</p>
      </div>

      <div className="header-controls">
        <div className="student-chip">
          <User size={15} color="var(--primary)" />
          <div className="student-info">
            <span className="student-name">{studentName}</span>
            <div className="student-badges">
              <Badge variant="info" className="student-badge">
                {branch}
              </Badge>
              <Badge variant="warning" className="student-badge">
                Batch {batch}
              </Badge>
            </div>
          </div>
        </div>

        <ThemeToggle />

        <Button
          variant="ghost"
          onClick={signOut}
          title="Sign Out"
          className="header-logout-btn"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
};
