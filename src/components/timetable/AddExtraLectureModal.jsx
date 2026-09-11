import React, { useState, useEffect } from 'react';
import { validateExtraLectureDuration } from '../../services/extraLectureService';
import { getKolkataTodayDateString } from '../../services/attendanceService';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { X, Clock, Calendar, BookOpen, AlertTriangle } from 'lucide-react';

export const AddExtraLectureModal = ({
  isOpen,
  onClose,
  onSave,
  eligibleSubjects = [],
  editingLecture = null,
  existingLogs = [],
}) => {
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(getKolkataTodayDateString());
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Confirmation dialog state for edits affecting marked attendance
  const [showConfirmWarning, setShowConfirmWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    if (editingLecture) {
      setSubjectId(editingLecture.subject_id || '');
      setDate(editingLecture.date || getKolkataTodayDateString());
      setStartTime(editingLecture.start_time?.slice(0, 5) || '14:00');
      setEndTime(editingLecture.end_time?.slice(0, 5) || '16:00');
    } else {
      setSubjectId(eligibleSubjects[0]?.id || '');
      setDate(getKolkataTodayDateString());
      setStartTime('14:00');
      setEndTime('16:00');
    }
    setErrorMsg('');
    setShowConfirmWarning(false);
  }, [editingLecture, eligibleSubjects, isOpen]);

  if (!isOpen) return null;

  const durationCheck = validateExtraLectureDuration(startTime, endTime);

  const checkEditImpact = () => {
    if (!editingLecture) return null;

    const lectureLogs = existingLogs.filter(
      (l) => l.extra_lecture_id === editingLecture.id && l.status !== 'UNMARKED'
    );
    if (lectureLogs.length === 0) return null;

    // Check if date or subject changed
    const dateChanged = date !== editingLecture.date;
    const subjectChanged = subjectId !== editingLecture.subject_id;

    // Check if duration reduced
    const oldVal = validateExtraLectureDuration(editingLecture.start_time, editingLecture.end_time);
    const newDuration = durationCheck.durationHours;
    const durationReduced = oldVal.isValid && newDuration < oldVal.durationHours;

    const affectedHours = lectureLogs.filter((l) => Number(l.hour_index || 1) > newDuration);

    if (durationReduced && affectedHours.length > 0) {
      const statuses = affectedHours.map((l) => `Hour ${l.hour_index} (${l.status})`).join(', ');
      return `Reducing duration to ${newDuration}h will delete recorded attendance for: ${statuses}.`;
    }

    if (dateChanged || subjectChanged) {
      return `Changing the ${dateChanged ? 'date' : ''}${dateChanged && subjectChanged ? ' and ' : ''}${
        subjectChanged ? 'subject' : ''
      } will reassign ${lectureLogs.length} marked attendance log(s).`;
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!subjectId) {
      setErrorMsg('Please select an eligible subject from your curriculum');
      return;
    }

    if (!durationCheck.isValid) {
      setErrorMsg(durationCheck.error);
      return;
    }

    // Check for edit impact warning if not already confirmed
    const impactWarning = checkEditImpact();
    if (impactWarning && !showConfirmWarning) {
      setWarningMessage(impactWarning);
      setShowConfirmWarning(true);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: editingLecture?.id,
        subjectId,
        date,
        startTime,
        endTime,
      };

      const res = await onSave(payload);
      if (res && !res.success) {
        setErrorMsg(res.error || 'Failed to save extra lecture');
      } else {
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while saving');
    } finally {
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
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <Card
          title={editingLecture ? 'Edit Extra Class' : 'Schedule Extra Class'}
          subtitle="Add a date-specific lecture outside recurring timetable"
          headerAction={
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          }
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            {/* Subject Select (Filtered by Branch & Batch Scope) */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                <BookOpen size={14} color="var(--primary-500)" />
                <span>Subject (Your Curriculum):</span>
              </label>
              <select
                className="input-field"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
              >
                {eligibleSubjects.length === 0 ? (
                  <option value="">No subjects found for your branch/batch</option>
                ) : (
                  eligibleSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code}) • {sub.type}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Date Input */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                <Calendar size={14} color="var(--primary-500)" />
                <span>Date:</span>
              </label>
              <input
                type="date"
                className="input-field"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Start Time and End Time Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  <Clock size={14} color="var(--primary-500)" />
                  <span>Start Time:</span>
                </label>
                <input
                  type="time"
                  className="input-field"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  <Clock size={14} color="var(--primary-500)" />
                  <span>End Time:</span>
                </label>
                <input
                  type="time"
                  className="input-field"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Live Duration Indicator / Whole-Hour Error */}
            <div>
              {durationCheck.isValid ? (
                <Badge variant="success">
                  Duration: {durationCheck.durationHours} {durationCheck.durationHours === 1 ? 'Hour' : 'Hours'} (Hourly Units: {durationCheck.durationHours})
                </Badge>
              ) : (
                <Badge variant="danger">
                  {durationCheck.error || 'Invalid Time Duration'}
                </Badge>
              )}
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--color-absent)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Confirmation Dialog for Edit Impacting Marked Attendance */}
            {showConfirmWarning && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  color: '#fde047',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <AlertTriangle size={18} color="#facc15" />
                  <span>Attendance Record Confirmation Warning</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.8rem' }}>{warningMessage}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    className="btn btn-warning"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    onClick={handleSubmit}
                  >
                    Confirm & Update
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    onClick={() => setShowConfirmWarning(false)}
                  >
                    Cancel Edit
                  </button>
                </div>
              </div>
            )}

            {/* Form Actions */}
            {!showConfirmWarning && (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !durationCheck.isValid}
                >
                  {submitting ? 'Saving...' : editingLecture ? 'Update Extra Class' : 'Add Extra Class'}
                </button>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};
