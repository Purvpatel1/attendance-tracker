import React from 'react';
import { AttendanceSegmentedControl } from './AttendanceSegmentedControl';
import { Edit2, Trash2 } from 'lucide-react';

export const ScheduleClassItem = ({
  classData,
  isExtra = false,
  isOngoing = false,
  subjectMeta = {},
  subjectMetric = null,
  hoursList = [],
  slotUuids = {},
  markingSlotKey = null,
  getLogForSlotHourLocal,
  getLogForExtraHourLocal,
  onMarkStatus,
  onMarkExtraStatus,
  onEditExtra,
  onDeleteExtra,
}) => {
  const startTime = isExtra ? classData.start_time?.slice(0, 5) : classData.startTime;
  const endTime = isExtra ? classData.end_time?.slice(0, 5) : classData.endTime;
  const subjectName = isExtra
    ? subjectMeta.name || 'Extra Class'
    : classData.subjectName || classData.name || 'Lecture';
  const subjectCode = isExtra
    ? subjectMeta.code || null
    : classData.code;
  const type = isExtra ? 'Extra Class' : classData.type || 'Lecture';
  const teacher = isExtra ? null : classData.teacher;
  const roomNo = isExtra ? null : classData.room || classData.roomNo;
  const batchScope = isExtra ? null : classData.batchScope;
  const isBatchSpecific = isExtra ? false : classData.isBatchSpecific;

  return (
    <div className={`editorial-class-row ${isOngoing ? 'is-ongoing' : ''} ${isExtra ? 'is-extra-class' : ''}`}>
      {/* Visual left accent bar for ongoing class */}
      {isOngoing && <div className="ongoing-accent-bar" />}

      {/* Column 1: Time & Duration */}
      <div className="class-col-time">
        <div className="time-range-tabular">{startTime} – {endTime}</div>
        <div className="time-meta-sub">
          <span>{hoursList.length} {hoursList.length === 1 ? 'hr' : 'hrs'}</span>
          {isOngoing && <span className="active-now-tag">NOW</span>}
        </div>
      </div>

      {/* Column 2: Subject, Context Meta, & Live Subject Standing Metric */}
      <div className="class-col-content">
        <div className="subject-header-group">
          <h3 className="subject-title">{subjectName}</h3>
          {isExtra && <span className="extra-class-tag">EXTRA CLASS</span>}
        </div>

        {/* Metadata Details Row */}
        <div className="subject-meta-line">
          {subjectCode && <span className="meta-code">{subjectCode}</span>}
          {roomNo && <span className="meta-detail">• Room: <strong>{roomNo}</strong></span>}
          {teacher && <span className="meta-detail">• <strong>{teacher}</strong></span>}
          {isBatchSpecific && <span className="meta-tag tag-batch">Batch {batchScope}</span>}
          {!isExtra && (type === 'Lab' || type === 'Seminar') && (
            <span className="meta-tag tag-type">{type}</span>
          )}
        </div>

        {/* Live Contextual Subject Standing Metric */}
        {subjectMetric && subjectMetric.conductedCount > 0 && (
          <div className={`subject-standing-line ${subjectMetric.status === 'SAFE' ? 'standing-safe' : 'standing-risk'}`}>
            <span className="standing-pct">Standing: {subjectMetric.percentage}%</span>
            <span className="standing-bullet">•</span>
            <span className="standing-guidance">{subjectMetric.guidanceText}</span>
          </div>
        )}

        {/* Extra Class Action Buttons */}
        {isExtra && (
          <div className="extra-actions-inline">
            <button
              type="button"
              className="action-btn-text"
              onClick={() => onEditExtra(classData)}
            >
              <Edit2 size={12} /> Edit
            </button>
            <button
              type="button"
              className="action-btn-text btn-delete-text"
              onClick={() => onDeleteExtra(classData)}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Column 3: Hourly Attendance Controls */}
      <div className="class-col-controls">
        {hoursList.map((hObj) => {
          const hourIdx = hObj.hourIndex;
          const existingLog = isExtra
            ? getLogForExtraHourLocal(classData.id, hourIdx)
            : getLogForSlotHourLocal(classData, hourIdx);

          const slotKey = isExtra
            ? `extra_${classData.id}_h${hourIdx}`
            : `${classData.id}_h${hourIdx}`;

          const isMarking = markingSlotKey === slotKey;

          return (
            <AttendanceSegmentedControl
              key={hourIdx}
              hourIndex={hourIdx}
              hourLabel={hoursList.length > 1 ? `Hour ${hourIdx} (${hObj.startTime}–${hObj.endTime})` : `Hour 1 (${startTime}–${endTime})`}
              status={existingLog?.status || null}
              isMarking={isMarking}
              onMarkStatus={(targetStatus) => {
                if (isExtra) {
                  onMarkExtraStatus(classData, hourIdx, targetStatus);
                } else {
                  onMarkStatus(classData, hourIdx, targetStatus);
                }
              }}
              showHourLabel={hoursList.length > 1}
            />
          );
        })}
      </div>
    </div>
  );
};


