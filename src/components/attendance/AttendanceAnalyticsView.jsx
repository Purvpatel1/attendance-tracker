import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTimetableForStudent } from '../../services/timetableService';
import {
  fetchStudentLogs,
  calculateAttendanceMetrics,
  getSubjectUuid,
} from '../../services/attendanceService';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  Calendar,
  Layers,
  Percent,
} from 'lucide-react';

export const AttendanceAnalyticsView = () => {
  const { user, profile } = useAuth();
  const branch = profile?.branch || 'Computer Engineering (CE)';
  const batch = profile?.batch || 'CE1';

  const timetableData = getTimetableForStudent(branch, batch);

  const [logs, setLogs] = useState([]);
  const [subjectsWithIds, setSubjectsWithIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      if (!user?.id) return;
      setLoading(true);

      // Resolve deterministic UUIDs for preset subjects
      const resolvedSubjects = await Promise.all(
        timetableData.subjects.map(async (sub) => {
          const id = await getSubjectUuid(branch, sub.code);
          return {
            ...sub,
            id,
            target_percentage: 75,
          };
        })
      );
      setSubjectsWithIds(resolvedSubjects);

      const fetchedLogs = await fetchStudentLogs(user.id);
      setLogs(fetchedLogs);
      setLoading(false);
    };

    initData();
  }, [user?.id, branch, batch]);

  const { overall, subjectMetrics } = calculateAttendanceMetrics(
    subjectsWithIds,
    logs
  );

  const getStatusBadge = (percentage, target = 75, conducted = 0) => {
    if (conducted === 0) {
      return <Badge variant="info">No Classes Yet</Badge>;
    }
    if (percentage >= target) {
      return <Badge variant="success">SAFE ({percentage}%)</Badge>;
    }
    return <Badge variant="danger">AT RISK ({percentage}%)</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <BarChart3 size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <p>Loading attendance metrics & history...</p>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Overall Metrics Summary Card */}
      <Card
        title="Attendance Analytics & Performance"
        subtitle={`${profile?.full_name || 'Student'} • ${branch} (${batch})`}
        headerAction={
          overall.totalConducted === 0 ? (
            <Badge variant="info">New Semester</Badge>
          ) : overall.overallPercentage >= 75 ? (
            <Badge variant="success">Overall Safe</Badge>
          ) : (
            <Badge variant="danger">Attention Needed</Badge>
          )
        }
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          {/* Overall Percentage Card */}
          <div
            style={{
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <Percent size={18} color="var(--primary-500)" />
              <span>Overall Attendance</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>
              {overall.overallPercentage}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Target: 75.0%
            </div>
          </div>

          {/* Conducted Classes */}
          <div
            style={{
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <BookOpen size={18} color="var(--color-info)" />
              <span>Conducted Sessions</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>
              {overall.totalConducted}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {overall.totalCancelled} Cancelled Excluded
            </div>
          </div>

          {/* Attended (PRESENT) */}
          <div
            style={{
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <CheckCircle size={18} color="var(--color-present)" />
              <span>Attended (Present)</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-present)', marginTop: '6px' }}>
              {overall.totalPresent}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {overall.totalConducted > 0 ? Math.round((overall.totalPresent / overall.totalConducted) * 100) : 0}% of conducted
            </div>
          </div>

          {/* Missed (ABSENT) */}
          <div
            style={{
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <XCircle size={18} color="var(--color-absent)" />
              <span>Missed (Absent)</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-absent)', marginTop: '6px' }}>
              {overall.totalAbsent}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {overall.totalConducted > 0 ? Math.round((overall.totalAbsent / overall.totalConducted) * 100) : 0}% missed
            </div>
          </div>
        </div>

        {/* Overall Bunk / Recovery Calculator Action Guidance Banner */}
        {overall.totalConducted > 0 && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: overall.status === 'SAFE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: '1px solid ' + (overall.status === 'SAFE' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {overall.status === 'SAFE' ? (
                <CheckCircle size={18} color="var(--color-present)" />
              ) : (
                <AlertTriangle size={18} color="var(--color-absent)" />
              )}
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Overall Guidance: {overall.guidanceText}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Based on overall 75.0% target
            </span>
          </div>
        )}
      </Card>

      {/* Subject-wise Breakdown Grid */}
      <Card title="Subject-wise Breakdown" subtitle="Detailed attendance tracking per course subject">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
          {subjectMetrics.map((sub) => {
            const isSafe = sub.conductedCount === 0 || sub.percentage >= (sub.target_percentage || 75);

            return (
              <div
                key={sub.code}
                style={{
                  padding: '16px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>
                      {sub.name}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      Code: {sub.code} • Type: {sub.type}
                    </span>
                  </div>
                  <div>{getStatusBadge(sub.percentage, sub.target_percentage || 75, sub.conductedCount)}</div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Progress: {sub.percentage}%</span>
                    <span>{sub.presentCount} / {sub.conductedCount} Conducted</span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(sub.percentage, 100)}%`,
                        background: sub.conductedCount === 0 ? 'var(--text-muted)' : isSafe ? 'var(--color-present)' : 'var(--color-absent)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Bunk / Recovery Guidance Pill */}
                {sub.conductedCount > 0 && (
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: sub.status === 'SAFE' ? 'var(--color-present)' : 'var(--color-absent)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: sub.status === 'SAFE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid ' + (sub.status === 'SAFE' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                      width: 'fit-content',
                    }}
                  >
                    {sub.guidanceText}
                  </div>
                )}

                {/* Detailed Counts Footer */}
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Present: <strong style={{ color: 'var(--color-present)' }}>{sub.presentCount}</strong></span>
                  <span>Absent: <strong style={{ color: 'var(--color-absent)' }}>{sub.absentCount}</strong></span>
                  <span>Cancelled: <strong style={{ color: 'var(--color-cancelled)' }}>{sub.cancelledCount}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Attendance History Table */}
      <Card title="Marked Logs History" subtitle="Recent attendance entries saved in Supabase">
        {logs.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No attendance logs marked yet. Mark classes in today's schedule to start building history.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                  <th style={{ padding: '10px 12px' }}>Subject ID</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Marked At</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{log.date}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.78rem' }}>{log.subject_id.slice(0, 13)}...</td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge
                        variant={
                          log.status === 'PRESENT'
                            ? 'success'
                            : log.status === 'ABSENT'
                            ? 'danger'
                            : 'info'
                        }
                      >
                        {log.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {log.marked_at ? new Date(log.marked_at).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
