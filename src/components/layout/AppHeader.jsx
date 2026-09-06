import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { GraduationCap, LogOut, User } from 'lucide-react';

export const AppHeader = () => {
  const { profile, user, signOut } = useAuth();

  const studentName = profile?.full_name || user?.email?.split('@')[0] || 'Student';
  const branch = profile?.branch || 'Computer Engineering (CE)';
  const batch = profile?.batch || 'CE1';

  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <GraduationCap size={22} color="#fff" />
        </div>
        <div>
          <h1 className="brand-title">Attendance Hub</h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="student-chip">
          <User size={16} color="var(--primary-500)" />
          <div className="student-info">
            <span className="student-name">{studentName}</span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
              <Badge variant="info" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                {branch}
              </Badge>
              <Badge variant="warning" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                Batch {batch}
              </Badge>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={signOut}
          title="Sign Out"
          style={{ padding: '8px 12px' }}
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
};
