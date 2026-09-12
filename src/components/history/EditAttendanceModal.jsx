import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { saveAttendanceLog } from '../../services/attendanceService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Spinner } from '../common/Spinner';
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const EditAttendanceModal = ({
  isOpen,
  onClose,
  log,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('PRESENT');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (log) {
      setSelectedStatus(log.status || 'PRESENT');
      setError(null);
      setShowDeleteConfirm(false);
      setSubmitting(false);
    }
  }, [log]);

  if (!isOpen || !log) return null;

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

  const handleSaveStatus = async () => {
    if (!user?.id || !log) return;
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await saveAttendanceLog({
        id: log.id,
        studentId: user.id,
        subjectId: log.subject_id,
        slotId: log.slot_id,
        extraLectureId: log.extra_lecture_id,
        date: log.date,
        hourIndex: log.hour_index || 1,
        status: selectedStatus,
      });

      if (!res.success) {
        setError(res.error || 'Failed to update attendance status.');
        setSubmitting(false);
        return;
      }

      onSuccess(
        {
          ...log,
          status: selectedStatus,
          marked_at: res.data?.marked_at || new Date().toISOString(),
        },
        'UPDATE'
      );
      onClose();
    } catch (err) {
      console.error('Error saving attendance status update:', err);
      setError(err.message || 'An unexpected error occurred while saving.');
      setSubmitting(false);
    }
  };

  const handleConfirmUnmark = async () => {
    if (!user?.id || !log) return;
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await saveAttendanceLog({
        id: log.id,
        studentId: user.id,
        subjectId: log.subject_id,
        slotId: log.slot_id,
        extraLectureId: log.extra_lecture_id,
        date: log.date,
        hourIndex: log.hour_index || 1,
        status: 'UNMARKED',
      });

      if (!res.success) {
        setError(res.error || 'Failed to delete attendance record.');
        setSubmitting(false);
        return;
      }

      onSuccess(log.id, 'DELETE');
      onClose();
    } catch (err) {
      console.error('Error unmarking attendance record:', err);
      setError(err.message || 'An unexpected error occurred while deleting.');
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          width: '100%',
          maxWidth: '480px',
          padding: '24px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Edit Attendance Record
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Update class status or unmark attendance
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={submitting}
            style={{ padding: '8px', minWidth: '44px', minHeight: '44px' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="alert alert-danger" role="alert" style={{ fontSize: '0.86rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Record Overview Card */}
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {formatDateDisplay(log.date)}
            </span>
            {log.isExtra && (
              <Badge variant="info" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                <Sparkles size={10} style={{ marginRight: '3px' }} /> Extra Lecture
              </Badge>
            )}
          </div>

          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {log.subjectName}
          </div>

          <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{log.subjectCode}</span>
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

        {/* Delete Confirmation Prompt overlay inside modal */}
        {showDeleteConfirm ? (
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-absent)' }}>
              <AlertTriangle size={20} />
              <strong style={{ fontSize: '0.95rem' }}>Confirm Unmarking Attendance</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0 }}>
              Are you sure you want to unmark this attendance record? This will delete the entry permanently from your history and update all metrics.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={submitting}
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmUnmark}
                disabled={submitting}
                style={{ minHeight: '44px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {submitting ? <Spinner size="sm" /> : <Trash2 size={16} />}
                <span>{submitting ? 'Unmarking...' : 'Yes, Delete Record'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Status Selector */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Select New Attendance Status
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
              }}
            >
              {/* PRESENT Option */}
              <button
                type="button"
                onClick={() => setSelectedStatus('PRESENT')}
                disabled={submitting}
                style={{
                  padding: '14px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedStatus === 'PRESENT'
                    ? '2px solid var(--color-present)'
                    : '1px solid var(--border-subtle)',
                  background: selectedStatus === 'PRESENT'
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'var(--bg-elevated)',
                  color: selectedStatus === 'PRESENT'
                    ? 'var(--color-present)'
                    : 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  minHeight: '64px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <CheckCircle size={20} />
                <span>PRESENT</span>
              </button>

              {/* ABSENT Option */}
              <button
                type="button"
                onClick={() => setSelectedStatus('ABSENT')}
                disabled={submitting}
                style={{
                  padding: '14px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedStatus === 'ABSENT'
                    ? '2px solid var(--color-absent)'
                    : '1px solid var(--border-subtle)',
                  background: selectedStatus === 'ABSENT'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'var(--bg-elevated)',
                  color: selectedStatus === 'ABSENT'
                    ? 'var(--color-absent)'
                    : 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  minHeight: '64px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <XCircle size={20} />
                <span>ABSENT</span>
              </button>

              {/* CANCELLED Option */}
              <button
                type="button"
                onClick={() => setSelectedStatus('CANCELLED')}
                disabled={submitting}
                style={{
                  padding: '14px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedStatus === 'CANCELLED'
                    ? '2px solid var(--color-cancelled)'
                    : '1px solid var(--border-subtle)',
                  background: selectedStatus === 'CANCELLED'
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'var(--bg-elevated)',
                  color: selectedStatus === 'CANCELLED'
                    ? 'var(--color-cancelled)'
                    : 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  minHeight: '64px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <AlertTriangle size={20} />
                <span>CANCELLED</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Action Buttons Footer */}
        {!showDeleteConfirm && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginTop: '10px',
              flexWrap: 'wrap',
            }}
          >
            {/* Unmark / Delete Button */}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={submitting}
              style={{
                color: 'var(--color-absent)',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                minHeight: '44px',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.86rem',
              }}
            >
              <Trash2 size={16} />
              <span>Unmark Record</span>
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={submitting}
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
              <Button
                variant="primary"
                onClick={handleSaveStatus}
                disabled={submitting || selectedStatus === log.status}
                style={{ minHeight: '44px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {submitting ? <Spinner size="sm" /> : null}
                <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
