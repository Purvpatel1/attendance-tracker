import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTimetableForStudent } from '../../services/timetableService';
import {
  fetchStudentLogs,
  calculateAttendanceMetrics,
  getSubjectUuid,
} from '../../services/attendanceService';
import { supabase } from '../../lib/supabaseClient';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Spinner } from '../common/Spinner';
import {
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  Percent,
  AlertCircle,
  User,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export const AttendanceAnalyticsView = () => {
  const { user, profile } = useAuth();
  const branch = profile?.branch || 'Computer Engineering (CE)';
  const batch = profile?.batch || 'CE1';

  const timetableData = getTimetableForStudent(branch, batch);

  const [logs, setLogs] = useState([]);
  const [subjectsWithIds, setSubjectsWithIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initData = async (showSpinner = true) => {
      if (!user?.id) {
        if (isMounted) setLoading(false);
        return;
      }

      if (isMounted && showSpinner) {
        setLoading(true);
        setError(null);
      }

      try {
        // Fetch subjects from Supabase DB 'subjects' table if available
        let dbSubjectsMap = new Map();
        try {
          const { data: dbSubjects } = await supabase
            .from('subjects')
            .select('*')
            .eq('branch', branch);
          
          if (dbSubjects && dbSubjects.length > 0) {
            dbSubjects.forEach((sub) => {
              if (sub.code) dbSubjectsMap.set(sub.code, sub);
            });
          }
        } catch (dbErr) {
          console.warn('Notice querying Supabase subjects table:', dbErr.message);
        }

        // Resolve deterministic UUIDs & metadata for assigned subjects
        const resolvedSubjects = await Promise.all(
          (timetableData.subjects || []).map(async (sub) => {
            const id = await getSubjectUuid(branch, sub.code);
            const dbSub = dbSubjectsMap.get(sub.code);
            const target = dbSub?.target_percentage !== undefined && dbSub?.target_percentage !== null
              ? Number(dbSub.target_percentage)
              : 75;

            return {
              ...sub,
              id,
              teacher: dbSub?.teacher || sub.teacher || 'Faculty',
              type: dbSub?.type || sub.type || 'Lecture',
              target_percentage: target,
              isTargetFallback: !dbSub?.target_percentage,
            };
          })
        );

        if (isMounted) setSubjectsWithIds(resolvedSubjects);

        // Fetch attendance logs for student
        const fetchedLogs = await fetchStudentLogs(user.id);
        if (isMounted) setLogs(fetchedLogs);
      } catch (err) {
        console.error('Error initializing subject analytics view:', err);
        if (isMounted) setError('Failed to load attendance logs. Please check your network connection.');
      } finally {
        if (isMounted && showSpinner) setLoading(false);
      }
    };

    initData(true);

    const handleGlobalUpdate = () => {
      initData(false);
    };

    window.addEventListener('attendance-updated', handleGlobalUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('attendance-updated', handleGlobalUpdate);
    };
  }, [user?.id, branch, batch, timetableData.subjects]);

  const { overall, subjectMetrics } = calculateAttendanceMetrics(
    subjectsWithIds,
    logs
  );

  // Status Badge Logic:
  // - Safe: percentage >= target (or 0 conducted classes)
  // - Warning: target - 10 <= percentage < target
  // - Critical: percentage < target - 10
  const getStatusBadge = (percentage, target = 75, conductedCount = 0) => {
    if (conductedCount === 0) {
      return <Badge variant="info">No Classes Yet</Badge>;
    }
    if (percentage >= target) {
      return <Badge variant="success">SAFE ({percentage}%)</Badge>;
    }
    if (percentage >= target - 10) {
      return <Badge variant="warning">WARNING ({percentage}%)</Badge>;
    }
    return <Badge variant="danger">CRITICAL ({percentage}%)</Badge>;
  };

  // State 1: Logged Out / Missing Session State
  if (!user) {
    return (
      <Card title="Subject Analytics">
        <div className="alert alert-info">
          <AlertCircle size={18} />
          <span>Please log in to view your subject attendance analytics.</span>
        </div>
      </Card>
    );
  }

  // State 2: Loading Analytics State
  if (loading) {
    return (
      <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner label="Loading Subject Analytics & History..." />
      </div>
    );
  }

  // State 3: Database / Network Error State
  if (error) {
    return (
      <Card title="Subject Analytics">
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Title & Subtitle */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Subject Analytics</h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Overview of present, absent, and target standing across all courses
        </p>
      </div>

      {/* 1. OVERALL SUMMARY SECTION */}
      <Card
        title="Overall Attendance Performance"
        subtitle={`${profile?.full_name || user?.email?.split('@')[0] || 'Student'} • ${branch} (${batch})`}
        headerAction={
          overall.totalConducted === 0 ? (
            <Badge variant="info">New Term</Badge>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          {/* Overall Attendance Percentage */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <Percent size={18} color="var(--primary)" />
              <span>Overall Attendance</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>
              {overall.totalConducted > 0 ? `${overall.overallPercentage}%` : 'N/A'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Formula: Present / (Present + Absent)
            </div>
          </div>

          {/* Total Conducted / Marked Classes */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <BookOpen size={18} color="var(--color-info)" />
              <span>Total Marked Classes</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>
              {overall.totalConducted}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {overall.totalCancelled} Cancelled Excluded
            </div>
          </div>

          {/* Total Present */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <CheckCircle size={18} color="var(--color-present)" />
              <span>Total Present</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-present)', marginTop: '6px' }}>
              {overall.totalPresent}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Attended Sessions
            </div>
          </div>

          {/* Total Absent */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <XCircle size={18} color="var(--color-absent)" />
              <span>Total Absent</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-absent)', marginTop: '6px' }}>
              {overall.totalAbsent}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Missed Sessions
            </div>
          </div>
        </div>

        {/* Overall Guidance Banner */}
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
                <CheckCircle2 size={18} color="var(--color-present)" />
              ) : (
                <AlertTriangle size={18} color="var(--color-absent)" />
              )}
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Overall Standing: {overall.guidanceText}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Based on overall 75.0% target
            </span>
          </div>
        )}
      </Card>

      {/* 2. SUBJECT-WISE ATTENDANCE CARDS */}
      <Card
        title="Subject Breakdown"
        subtitle="Detailed course-by-course attendance status and targets"
      >
        {subjectMetrics.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileSpreadsheet size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p>No subjects found for branch {branch} ({batch}).</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            {subjectMetrics.map((sub) => {
              const isZeroConducted = sub.conductedCount === 0;
              const target = sub.targetPercentage || 75;

              return (
                <div
                  key={sub.code}
                  style={{
                    padding: '16px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* Card Top Row: Name, Code, Type, Teacher & Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0, fontWeight: 700 }}>
                        {sub.name}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>Code: {sub.code}</span>
                        <span>•</span>
                        <span>Type: {sub.type || 'Lecture'}</span>
                        {sub.teacher && (
                          <>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <User size={12} color="var(--primary)" /> {sub.teacher}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      {getStatusBadge(sub.percentage, target, sub.conductedCount)}
                    </div>
                  </div>

                  {/* Attendance Percentage & Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      <span>
                        Attendance: <strong style={{ color: isZeroConducted ? 'var(--text-muted)' : sub.percentage >= target ? 'var(--color-present)' : 'var(--color-absent)' }}>
                          {isZeroConducted ? 'No attendance data' : `${sub.percentage}%`}
                        </strong>
                      </span>
                      <span>
                        Target: <strong>{target}%</strong>
                        {sub.isTargetFallback && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}> (default)</span>}
                      </span>
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
                          width: `${isZeroConducted ? 0 : Math.min(sub.percentage, 100)}%`,
                          background: isZeroConducted
                            ? 'var(--text-muted)'
                            : sub.percentage >= target
                            ? 'var(--color-present)'
                            : sub.percentage >= target - 10
                            ? 'var(--color-cancelled)'
                            : 'var(--color-absent)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Guidance Pill */}
                  {!isZeroConducted && (
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

                  {/* Detailed Class Counts Footer */}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span>Present: <strong style={{ color: 'var(--color-present)' }}>{sub.presentCount}</strong></span>
                    <span>Absent: <strong style={{ color: 'var(--color-absent)' }}>{sub.absentCount}</strong></span>
                    <span>Marked Classes: <strong style={{ color: 'var(--text-main)' }}>{sub.conductedCount}</strong></span>
                    <span>Cancelled: <strong style={{ color: 'var(--color-cancelled)' }}>{sub.cancelledCount}</strong> <span style={{ fontSize: '0.72rem' }}>(excluded)</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
