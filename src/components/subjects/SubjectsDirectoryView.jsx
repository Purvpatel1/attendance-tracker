import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSubjectsForBranch } from '../../services/timetableService';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { BookOpen, User, Target, Layers } from 'lucide-react';

export const SubjectsDirectoryView = () => {
  const { profile } = useAuth();
  const branch = profile?.branch || 'Computer Engineering (CE)';
  const batch = profile?.batch || 'CE1';

  const subjects = getSubjectsForBranch(branch);
  const [filterType, setFilterType] = useState('ALL');

  const filteredSubjects = subjects.filter((s) => {
    if (filterType === 'ALL') return true;
    return s.type === filterType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card
        title="Subjects Directory"
        subtitle={`Branch: ${branch} • ${subjects.length} Total Registered Courses`}
        headerAction={<Badge variant="info">AY 2026-27 Sem V</Badge>}
      >
        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '12px' }}>
          {['ALL', 'Lecture', 'Lab', 'Seminar', 'Project'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid ' + (filterType === type ? 'var(--primary-500)' : 'var(--border-subtle)'),
                background: filterType === type ? 'var(--primary-gradient)' : 'rgba(15, 23, 42, 0.6)',
                color: filterType === type ? '#fff' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {type === 'ALL' ? 'All Subjects' : type + 's'}
            </button>
          ))}
        </div>
      </Card>

      {/* Subjects Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredSubjects.map((subject) => {
          const isLab = subject.type === 'Lab';
          const isSeminar = subject.type === 'Seminar';

          return (
            <Card key={subject.code} interactive>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {subject.code}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginTop: '2px' }}>
                      {subject.name}
                    </h4>
                  </div>
                  <Badge variant={isLab ? 'warning' : isSeminar ? 'info' : 'success'}>
                    {subject.type}
                  </Badge>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} color="var(--primary-500)" />
                    <span>Faculty: <strong>{subject.teacher}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} color="var(--color-info)" />
                    <span>Credits (L+P): <strong>{subject.credits}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Target size={14} color="var(--color-present)" />
                    <span>Target: <strong>75% Attendance</strong></span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
