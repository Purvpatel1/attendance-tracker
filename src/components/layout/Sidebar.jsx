import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Calendar,
  BookOpen,
  PieChart,
  History,
  UserCheck,
  GraduationCap,
  LogOut,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, profile, signOut } = useAuth();

  const studentName = profile?.full_name || user?.email?.split('@')[0] || 'Student';
  const branch = profile?.branch || 'CE';
  const batch = profile?.batch || 'CE1';

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'today', label: 'Schedule', icon: Calendar },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <GraduationCap size={22} color="#fff" />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-title">Attendance Hub</span>
          <span className="sidebar-subtitle">Student Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
            >
              <Icon size={20} className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <span className="sidebar-user-name" title={studentName}>
            {studentName}
          </span>
          <span className="sidebar-user-meta">
            {branch} • Batch {batch}
          </span>
        </div>
        <button
          type="button"
          className="sidebar-logout-btn"
          onClick={signOut}
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
