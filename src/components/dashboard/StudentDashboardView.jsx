import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTimetableForStudent } from '../../services/timetableService';
import {
  fetchStudentLogs,
  getSubjectUuid,
  getSlotUuid,
  getLogForSlotHour,
  getLogForExtraLectureHour,
  getKolkataTodayDateString,
  getDayOfWeekFromDateString,
  calculateAttendanceMetrics,
} from '../../services/attendanceService';
import {
  fetchExtraLecturesForStudent,
  fetchEligibleSubjects,
} from '../../services/extraLectureService';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import {
  Calendar,
  PieChart,
  History,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Award,
} from 'lucide-react';

export const StudentDashboardView = ({ setActiveTab }) => {
  const { user, profile } = useAuth();
  const branch = profile?.branch || '';
  const batch = profile?.batch || '';
  const studentName = profile?.full_name || user?.email?.split('@')[0] || 'Student';

  const timetableData = getTimetableForStudent(branch, batch);

  // Kolkata today date & day of week
  const todayStr = getKolkataTodayDateString();
  const todayDayId = getDayOfWeekFromDateString(todayStr);

  const [logs, setLogs] = useState([]);
  const [extraLectures, setExtraLectures] = useState([]);
  const [eligibleSubjects, setEligibleSubjects] = useState([]);
  const [subjectsWithIds, setSubjectsWithIds] = useState([]);
  const [slotUuids, setSlotUuids] = useState({});
  const [loading, setLoading] = useState(true);
  const [queryError, setQueryError] = useState(null);

  // Dynamic greeting based on Asia/Kolkata hour
  const getKolkataGreeting = () => {
    try {
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        hour12: false,
      });
      const hour = parseInt(formatter.format(new Date()), 10);
      if (hour < 12) return 'Good morning';
      if (hour < 17) return 'Good afternoon';
      return 'Good evening';
    } catch (e) {
      return 'Welcome back';
    }
  };

  // Formatted date string for Asia/Kolkata
  const getKolkataFormattedDate = () => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return formatter.format(new Date());
    } catch (e) {
      return new Date().toLocaleDateString();
    }
  };

  // Today's regular schedule for authenticated student
  const daySchedule = timetableData.scheduleByDay[todayDayId] || [];

  // Filter extra lectures for today
  const dailyExtraLectures = extraLectures.filter((el) => el.date === todayStr);

  // Resolve subject UUIDs for metrics matching Subject Analytics
  useEffect(() => {
    let isMounted = true;
    const resolveSubjectUuids = async () => {
      const resolved = await Promise.all(
        (timetableData.subjects || []).map(async (sub) => {
          const id = await getSubjectUuid(branch, sub.code);
          return { ...sub, id, target_percentage: 75 };
        })
      );
      if (isMounted) {
        setSubjectsWithIds(resolved);
      }
    };
    resolveSubjectUuids();
    return () => {
      isMounted = false;
    };
  }, [branch, batch]);

  // Resolve eligible curriculum subjects
  useEffect(() => {
    let isMounted = true;
    const resolveCurriculum = async () => {
      const resolved = await fetchEligibleSubjects(branch, batch);
      if (isMounted) {
        setEligibleSubjects(resolved);
      }
    };
    resolveCurriculum();
    return () => {
      isMounted = false;
    };
  }, [branch, batch]);

  // Resolve slot UUIDs for today's schedule
  useEffect(() => {
    let isMounted = true;
    const resolveDayUuids = async () => {
      const map = {};
      for (const slot of daySchedule) {
        const uuid = await getSlotUuid(
          branch,
          slot.batchScope,
          slot.dayOfWeek,
          slot.startTime,
          slot.endTime,
          slot.code
        );
        map[slot.id] = uuid;
      }
      if (isMounted) {
        setSlotUuids(map);
      }
    };
    resolveDayUuids();
    return () => {
      isMounted = false;
    };
  }, [todayDayId, branch, batch]);

  // Load student logs & extra lectures from Supabase
  useEffect(() => {
    let isMounted = true;
    const loadData = async (showLoading = true) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      if (showLoading) setLoading(true);
      setQueryError(null);
      try {
        const [fetchedLogs, fetchedExtra] = await Promise.all([
          fetchStudentLogs(user.id),
          fetchExtraLecturesForStudent(user.id),
        ]);
        if (isMounted) {
          setLogs(fetchedLogs);
          setExtraLectures(fetchedExtra);
        }
      } catch (err) {
        if (isMounted) {
          setQueryError(err.message || 'Failed to fetch dashboard data');
        }
      } finally {
        if (isMounted && showLoading) {
          setLoading(false);
        }
      }
    };

    loadData(true);

    const handleGlobalUpdate = () => {
      loadData(false);
    };

    window.addEventListener('attendance-updated', handleGlobalUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('attendance-updated', handleGlobalUpdate);
    };
  }, [user?.id]);

  // Calculate live attendance metrics exactly like Subject Analytics
  const { overall, subjectMetrics } = calculateAttendanceMetrics(subjectsWithIds, logs);

  // Filter subjects needing attention (conducted > 0 and percentage < targetPercentage)
  const attentionSubjects = subjectMetrics.filter(
    (sub) => sub.conductedCount > 0 && sub.percentage < sub.targetPercentage
  );

  // Helper to determine status for a slot/extra lecture today
  const getSlotStatusToday = (slot, isExtra = false) => {
    if (isExtra) {
      const extraLog = getLogForExtraLectureHour(logs, todayStr, slot.id, 1);
      return extraLog?.status || 'UNMARKED';
    } else {
      const uuid = slotUuids[slot.id];
      if (!uuid) return 'UNMARKED';
      const slotLog = getLogForSlotHour(logs, todayStr, uuid, 1);
      return slotLog?.status || 'UNMARKED';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spinner label="Loading Dashboard Overview..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="editorial-empty-state">
          <AlertCircle size={36} color="var(--color-absent)" />
          <p className="empty-title">Session Expired</p>
          <p className="empty-sub">Please sign in to view your attendance dashboard.</p>
        </div>
      </div>
    );
  }

  const isOverallOnTrack = overall.overallPercentage >= 75 || overall.totalConducted === 0;

  return (
    <div className="dashboard-container">
      {queryError && (
        <div className="alert-banner danger">
          <AlertTriangle size={18} />
          <span>{queryError}</span>
        </div>
      )}

      {/* WELCOME BANNER BAR */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <div className="greeting-badge">
            <Sparkles size={15} color="var(--primary)" />
            <span>{getKolkataGreeting()}</span>
          </div>
          <h2 className="welcome-name">{studentName}</h2>
          <p className="welcome-date">{getKolkataFormattedDate()}</p>
        </div>

        <div className="welcome-meta-badges">
          <Badge variant="info">{branch}</Badge>
          <Badge variant="warning">Batch {batch}</Badge>
        </div>
      </div>

      {/* 5 STAT CARDS GRID */}
      <section className="dashboard-section">
        <div className="section-title-row">
          <h3 className="section-title">Attendance Overview</h3>
          <span className="section-hint">Cancelled classes excluded from % calculation</span>
        </div>

        <div className="stats-grid-5">
          {/* Card 1: Overall Percentage */}
          <div className={`stat-card overall-card ${isOverallOnTrack ? 'safe' : 'risk'}`}>
            <span className="stat-card-label">Overall Attendance</span>
            <div className="stat-card-main">
              <span className="stat-card-value">
                {overall.totalConducted > 0 ? `${overall.overallPercentage}%` : 'N/A'}
              </span>
            </div>
            {/* Simple progress bar */}
            <div className="stat-progress-track">
              <div
                className="stat-progress-fill"
                style={{
                  width: `${Math.min(overall.overallPercentage, 100)}%`,
                  backgroundColor: isOverallOnTrack ? 'var(--color-present)' : 'var(--color-absent)',
                }}
              />
            </div>
            <span className="stat-card-subtext">
              {overall.totalConducted === 0
                ? 'No classes conducted'
                : isOverallOnTrack
                ? 'Target 75% met'
                : 'Below 75% target'}
            </span>
          </div>

          {/* Card 2: Present */}
          <div className="stat-card">
            <div className="stat-card-header present">
              <CheckCircle2 size={16} />
              <span>Present</span>
            </div>
            <div className="stat-card-value">{overall.totalPresent}</div>
            <span className="stat-card-subtext">Class hours attended</span>
          </div>

          {/* Card 3: Absent */}
          <div className="stat-card">
            <div className="stat-card-header absent">
              <XCircle size={16} />
              <span>Absent</span>
            </div>
            <div className="stat-card-value">{overall.totalAbsent}</div>
            <span className="stat-card-subtext">Class hours missed</span>
          </div>

          {/* Card 4: Total Conducted */}
          <div className="stat-card">
            <div className="stat-card-header info">
              <TrendingUp size={16} />
              <span>Total Conducted</span>
            </div>
            <div className="stat-card-value">{overall.totalConducted}</div>
            <span className="stat-card-subtext">Present + Absent hours</span>
          </div>

          {/* Card 5: Cancelled */}
          <div className="stat-card">
            <div className="stat-card-header cancelled">
              <AlertTriangle size={16} />
              <span>Cancelled</span>
            </div>
            <div className="stat-card-value">{overall.totalCancelled}</div>
            <span className="stat-card-subtext">Excluded from %</span>
          </div>
        </div>
      </section>

      {/* TODAY'S CLASSES */}
      <section className="dashboard-section">
        <div className="section-title-row">
          <h3 className="section-title">Today's Classes</h3>
          <button
            type="button"
            className="link-btn"
            onClick={() => setActiveTab('today')}
          >
            View full schedule <ArrowRight size={14} />
          </button>
        </div>

        {daySchedule.length === 0 && dailyExtraLectures.length === 0 ? (
          <div className="dashboard-empty-card">
            <Calendar size={32} className="empty-icon" />
            <p className="empty-title">No classes scheduled for today.</p>
            <p className="empty-sub">Enjoy your free time or review upcoming topics!</p>
          </div>
        ) : (
          <div className="schedule-rows-list">
            {/* Extra Lectures Today */}
            {dailyExtraLectures.map((lecture) => {
              const subjectMeta =
                lecture.subjects || eligibleSubjects.find((s) => s.id === lecture.subject_id) || {};
              const status = getSlotStatusToday(lecture, true);

              return (
                <div key={`extra_${lecture.id}`} className="class-row-card extra">
                  <div className="class-row-info">
                    <div className="class-row-header">
                      <Badge variant="purple">Extra Lecture</Badge>
                      <span className="class-code">{subjectMeta.code || 'EXTRA'}</span>
                    </div>
                    <h4 className="class-title">{subjectMeta.name || 'Extra Lecture'}</h4>
                    <div className="class-meta-line">
                      <span className="meta-item">
                        <Clock size={13} /> {lecture.start_time} - {lecture.end_time}
                      </span>
                    </div>
                  </div>

                  <div className="class-row-action">
                    {status === 'PRESENT' && (
                      <Badge variant="success" className="status-badge">
                        <CheckCircle2 size={14} /> PRESENT
                      </Badge>
                    )}
                    {status === 'ABSENT' && (
                      <Badge variant="danger" className="status-badge">
                        <XCircle size={14} /> ABSENT
                      </Badge>
                    )}
                    {status === 'CANCELLED' && (
                      <Badge variant="warning" className="status-badge">
                        <AlertTriangle size={14} /> CANCELLED
                      </Badge>
                    )}
                    {status === 'UNMARKED' && (
                      <div className="unmarked-action-group">
                        <span className="unmarked-text">Not marked</span>
                        <Button
                          variant="secondary"
                          onClick={() => setActiveTab('today')}
                          className="mark-schedule-btn"
                        >
                          Mark in Schedule
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Regular Slots Today */}
            {daySchedule.map((slot, idx) => {
              const status = getSlotStatusToday(slot, false);

              return (
                <div key={`slot_${slot.id}_${idx}`} className="class-row-card">
                  <div className="class-row-info">
                    <div className="class-row-header">
                      <span className="class-code">{slot.code}</span>
                      {slot.type && <Badge variant="info">{slot.type}</Badge>}
                    </div>
                    <h4 className="class-title">{slot.name}</h4>
                    <div className="class-meta-line">
                      <span className="meta-item">
                        <Clock size={13} /> {slot.startTime} - {slot.endTime}
                      </span>
                      {slot.room && (
                        <span className="meta-item">
                          <MapPin size={13} /> {slot.room}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="class-row-action">
                    {status === 'PRESENT' && (
                      <Badge variant="success" className="status-badge">
                        <CheckCircle2 size={14} /> PRESENT
                      </Badge>
                    )}
                    {status === 'ABSENT' && (
                      <Badge variant="danger" className="status-badge">
                        <XCircle size={14} /> ABSENT
                      </Badge>
                    )}
                    {status === 'CANCELLED' && (
                      <Badge variant="warning" className="status-badge">
                        <AlertTriangle size={14} /> CANCELLED
                      </Badge>
                    )}
                    {status === 'UNMARKED' && (
                      <div className="unmarked-action-group">
                        <span className="unmarked-text">Not marked</span>
                        <Button
                          variant="secondary"
                          onClick={() => setActiveTab('today')}
                          className="mark-schedule-btn"
                        >
                          Mark in Schedule
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SUBJECTS NEEDING ATTENTION */}
      <section className="dashboard-section">
        <div className="section-title-row">
          <h3 className="section-title">Subjects Needing Attention</h3>
          <button
            type="button"
            className="link-btn"
            onClick={() => setActiveTab('analytics')}
          >
            Full Analytics <ArrowRight size={14} />
          </button>
        </div>

        {attentionSubjects.length === 0 ? (
          <div className="positive-status-card">
            <Award size={24} className="positive-icon" />
            <div>
              <p className="positive-title">All subjects are on track! 🎉</p>
              <p className="positive-sub">
                Your attendance meets or exceeds the 75% target across all conducted subjects.
              </p>
            </div>
          </div>
        ) : (
          <div className="attention-grid">
            {attentionSubjects.map((sub) => (
              <div key={sub.id} className="attention-card">
                <div className="attention-card-body">
                  <div className="attention-header">
                    <span className="attention-code">{sub.code}</span>
                    <Badge variant="danger">AT RISK</Badge>
                  </div>
                  <h4 className="attention-name">{sub.name}</h4>
                  <p className="attention-guidance">{sub.guidanceText}</p>
                </div>

                <div className="attention-card-stats">
                  <div className="attention-pct">{sub.percentage}%</div>
                  <span className="attention-target">Target: {sub.targetPercentage}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MOBILE QUICK NAVIGATION */}
      <section className="mobile-quick-nav">
        <h3 className="section-title">Quick Navigation</h3>
        <div className="quick-nav-grid">
          <button
            type="button"
            className="quick-nav-card"
            onClick={() => setActiveTab('today')}
          >
            <Calendar size={20} color="var(--primary)" />
            <span>Schedule</span>
          </button>
          <button
            type="button"
            className="quick-nav-card"
            onClick={() => setActiveTab('analytics')}
          >
            <PieChart size={20} color="var(--primary)" />
            <span>Analytics</span>
          </button>
          <button
            type="button"
            className="quick-nav-card"
            onClick={() => setActiveTab('history')}
          >
            <History size={20} color="var(--primary)" />
            <span>History</span>
          </button>
          <button
            type="button"
            className="quick-nav-card"
            onClick={() => setActiveTab('profile')}
          >
            <UserCheck size={20} color="var(--primary)" />
            <span>Profile</span>
          </button>
        </div>
      </section>
    </div>
  );
};
