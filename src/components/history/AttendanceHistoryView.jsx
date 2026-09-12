import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTimetableForStudent } from '../../services/timetableService';
import { fetchStudentLogs, getSubjectUuid } from '../../services/attendanceService';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Spinner } from '../common/Spinner';
import { Button } from '../common/Button';
import { EditAttendanceModal } from './EditAttendanceModal';
import {
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
  SearchX,
  AlertCircle,
  Edit2,
  CheckCircle2,
} from 'lucide-react';

export const AttendanceHistoryView = () => {
  const { user, profile } = useAuth();
  const branch = profile?.branch || 'Computer Engineering (CE)';
  const batch = profile?.batch || 'CE1';

  const timetableData = getTimetableForStudent(branch, batch);

  const [enrichedLogs, setEnrichedLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Edit Modal State
  const [editingLog, setEditingLog] = useState(null);

  // Filters State
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState('ALL'); // 'ALL' | '7DAYS' | '30DAYS' | 'THIS_MONTH'
  const [customDate, setCustomDate] = useState('');
  const [sortOrder, setSortOrder] = useState('DESC'); // 'DESC' (Newest first) | 'ASC' (Oldest first)

  const loadHistoryData = useCallback(async (showLoadingSpinner = true) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    if (showLoadingSpinner) {
      setLoading(true);
    }
    setError(null);

    try {
      // 1. Fetch all raw logs from Supabase
      const fetchedLogs = await fetchStudentLogs(user.id);

      // 2. Build Subject UUID map for fast lookup
      const subjectMap = new Map();
      await Promise.all(
        (timetableData.subjects || []).map(async (sub) => {
          const uuid = await getSubjectUuid(branch, sub.code);
          subjectMap.set(uuid, sub);
        })
      );

      // 3. Enrich logs with subject details
      const enriched = (fetchedLogs || []).map((log) => {
        const sub = subjectMap.get(log.subject_id) || {
          code: 'PRESET',
          name: 'Subject',
          type: 'Lecture',
          teacher: 'Faculty',
        };

        return {
          ...log,
          subjectCode: sub.code,
          subjectName: sub.name,
          subjectType: sub.type,
          teacher: sub.teacher,
          isExtra: Boolean(log.extra_lecture_id),
        };
      });

      setEnrichedLogs(enriched);
    } catch (err) {
      console.error('Error loading attendance history:', err);
      setError('Failed to load attendance history. Please check your internet connection.');
    } finally {
      if (showLoadingSpinner) {
        setLoading(false);
      }
    }
  }, [user?.id, branch, batch, timetableData.subjects]);

  useEffect(() => {
    loadHistoryData(true);

    // Global event listener for attendance updates across components
    const handleGlobalUpdate = () => {
      loadHistoryData(false);
    };

    window.addEventListener('attendance-updated', handleGlobalUpdate);
    return () => {
      window.removeEventListener('attendance-updated', handleGlobalUpdate);
    };
  }, [loadHistoryData]);

  // Handle Edit/Unmark success from modal
  const handleModalSuccess = (resultPayload, actionType) => {
    if (actionType === 'UPDATE') {
      const updatedLog = resultPayload;
      setEnrichedLogs((prev) =>
        prev.map((item) => (item.id === updatedLog.id ? { ...item, ...updatedLog } : item))
      );
      setToastMessage('Attendance status updated successfully.');
    } else if (actionType === 'DELETE') {
      const deletedId = resultPayload;
      setEnrichedLogs((prev) => prev.filter((item) => item.id !== deletedId));
      setToastMessage('Attendance record unmarked successfully.');
    }

    // Auto dismiss toast after 4 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);

    // Refresh from Supabase to guarantee state consistency across pages
    loadHistoryData(false);
  };

  // Apply Filters and Sorting dynamically
  const filteredLogs = useMemo(() => {
    let result = [...enrichedLogs];

    // Subject Filter
    if (selectedSubject !== 'ALL') {
      result = result.filter((l) => l.subjectCode === selectedSubject || l.subject_id === selectedSubject);
    }

    // Status Filter
    if (selectedStatus !== 'ALL') {
      result = result.filter((l) => l.status === selectedStatus);
    }

    // Custom Date Filter
    if (customDate) {
      result = result.filter((l) => l.date === customDate);
    } else if (selectedDateRange !== 'ALL') {
      const today = new Date();

      if (selectedDateRange === '7DAYS') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        result = result.filter((l) => new Date(l.date) >= sevenDaysAgo);
      } else if (selectedDateRange === '30DAYS') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        result = result.filter((l) => new Date(l.date) >= thirtyDaysAgo);
      } else if (selectedDateRange === 'THIS_MONTH') {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        result = result.filter((l) => new Date(l.date) >= firstDayOfMonth);
      }
    }

    // Sorting (Newest First vs Oldest First)
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) {
        return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
      }
      // Secondary sort by hour_index
      const hourA = Number(a.hour_index || 1);
      const hourB = Number(b.hour_index || 1);
      return sortOrder === 'DESC' ? hourB - hourA : hourA - hourB;
    });

    return result;
  }, [enrichedLogs, selectedSubject, selectedStatus, selectedDateRange, customDate, sortOrder]);

  // Summary Metrics calculation for filtered logs
  const summaryCounts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let cancelled = 0;

    filteredLogs.forEach((l) => {
      if (l.status === 'PRESENT') present++;
      else if (l.status === 'ABSENT') absent++;
      else if (l.status === 'CANCELLED') cancelled++;
    });

    return {
      total: filteredLogs.length,
      present,
      absent,
      cancelled,
    };
  }, [filteredLogs]);

  const clearFilters = () => {
    setSelectedSubject('ALL');
    setSelectedStatus('ALL');
    setSelectedDateRange('ALL');
    setCustomDate('');
    setSortOrder('DESC');
  };

  const getStatusBadge = (status) => {
    if (status === 'PRESENT') {
      return <Badge variant="success">PRESENT</Badge>;
    }
    if (status === 'ABSENT') {
      return <Badge variant="danger">ABSENT</Badge>;
    }
    if (status === 'CANCELLED') {
      return <Badge variant="warning">CANCELLED</Badge>;
    }
    return <Badge variant="info">{status}</Badge>;
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (!user) {
    return (
      <Card title="Attendance History">
        <div className="alert alert-info">
          <AlertCircle size={18} />
          <span>Please log in to view your attendance history logs.</span>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner label="Loading Attendance History..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Title Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Attendance History</h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Complete timeline of marked classes, extra lectures, and status entries
        </p>
      </div>

      {toastMessage && (
        <div
          className="alert alert-success"
          role="alert"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 1. SUMMARY CARDS BAR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
        }}
      >
        <Card style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <History size={16} color="var(--primary)" />
            <span>Total Logged</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
            {summaryCounts.total}
          </div>
        </Card>

        <Card style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={16} color="var(--color-present)" />
            <span>Present</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-present)', marginTop: '4px' }}>
            {summaryCounts.present}
          </div>
        </Card>

        <Card style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <XCircle size={16} color="var(--color-absent)" />
            <span>Absent</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-absent)', marginTop: '4px' }}>
            {summaryCounts.absent}
          </div>
        </Card>

        <Card style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} color="var(--color-cancelled)" />
            <span>Cancelled</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-cancelled)', marginTop: '4px' }}>
            {summaryCounts.cancelled}
          </div>
        </Card>
      </div>

      {/* 2. FUNCTIONAL FILTERS BAR */}
      <Card title="Filter & Sort Records">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '12px' }}>
          {/* Filter by Subject */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="history-subject-filter">Filter by Subject</label>
            <select
              id="history-subject-filter"
              className="select-field"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="ALL">All Subjects</option>
              {(timetableData.subjects || []).map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.code} - {sub.shortName || sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="history-status-filter">Attendance Status</label>
            <select
              id="history-status-filter"
              className="select-field"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Filter by Date Range */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="history-range-filter">Time Range</label>
            <select
              id="history-range-filter"
              className="select-field"
              value={selectedDateRange}
              onChange={(e) => {
                setSelectedDateRange(e.target.value);
                setCustomDate('');
              }}
            >
              <option value="ALL">All Time</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
              <option value="THIS_MONTH">This Month</option>
            </select>
          </div>

          {/* Custom Date Input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="history-custom-date">Specific Date</label>
            <input
              id="history-custom-date"
              type="date"
              className="input-field"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setSelectedDateRange('ALL');
              }}
            />
          </div>

          {/* Sort Order Toggle */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sorting</label>
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'space-between' }}
              onClick={() => setSortOrder((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'))}
            >
              <span>{sortOrder === 'DESC' ? 'Newest First' : 'Oldest First'}</span>
              <ArrowUpDown size={16} />
            </button>
          </div>
        </div>

        {/* Clear Filters Button if any filter active */}
        {(selectedSubject !== 'ALL' || selectedStatus !== 'ALL' || selectedDateRange !== 'ALL' || customDate || sortOrder !== 'DESC') && (
          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '0.82rem', padding: '4px 8px' }}
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </Card>

      {/* 3. ATTENDANCE RECORD LIST */}
      <Card
        title="Marked Logs History"
        subtitle={`Showing ${filteredLogs.length} of ${enrichedLogs.length} marked attendance records`}
      >
        {enrichedLogs.length === 0 ? (
          /* Empty State: No logs in database */
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <History size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>No Attendance Marked Yet</h4>
            <p style={{ fontSize: '0.85rem' }}>
              Select classes in today's Schedule tab to mark your attendance and build your history.
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          /* Empty State: Filter produced 0 results */
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <SearchX size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>No Matching Records Found</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
              No attendance entries match your current filter criteria.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Reset Filters
            </Button>
          </div>
        ) : (
          /* List of Enriched Logs */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '14px 16px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                {/* Left Column: Date, Subject Code & Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {formatDateDisplay(log.date)}
                    </span>
                    {log.isExtra && (
                      <Badge variant="info" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        <Sparkles size={10} style={{ marginRight: '3px' }} /> Extra Lecture
                      </Badge>
                    )}
                  </div>

                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    {log.subjectName}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>Code: {log.subjectCode}</span>
                    <span>•</span>
                    <span>{log.subjectType || 'Lecture'}</span>
                    {log.hour_index && (
                      <>
                        <span>•</span>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Hour {log.hour_index}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column: Status Badge, Timestamp & Edit Action */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getStatusBadge(log.status)}
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setEditingLog(log)}
                      style={{
                        padding: '4px 10px',
                        minHeight: '44px',
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                      aria-label={`Edit attendance for ${log.subjectName} on ${log.date}`}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                  </div>

                  {log.marked_at && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Marked {new Date(log.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Attendance Record Modal */}
      <EditAttendanceModal
        isOpen={Boolean(editingLog)}
        onClose={() => setEditingLog(null)}
        log={editingLog}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};
