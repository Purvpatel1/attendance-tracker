import React from 'react';
import { Home, Calendar, BookOpen, PieChart, History, UserCheck } from 'lucide-react';

export const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'today', label: 'Schedule', icon: Calendar },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <Icon size={20} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
