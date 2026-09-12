import React from 'react';
import { Check, X, Ban } from 'lucide-react';

const STATUS_CONFIG = {
  PRESENT: {
    label: 'Present',
    shortLabel: 'P',
    icon: Check,
    activeClass: 'segment-present-active',
  },
  ABSENT: {
    label: 'Absent',
    shortLabel: 'A',
    icon: X,
    activeClass: 'segment-absent-active',
  },
  CANCELLED: {
    label: 'Cancelled',
    shortLabel: 'C',
    icon: Ban,
    activeClass: 'segment-cancelled-active',
  },
};

export const AttendanceSegmentedControl = ({
  hourIndex = 1,
  hourLabel = '',
  status = null,
  isMarking = false,
  onMarkStatus,
  showHourLabel = true,
}) => {
  const options = ['PRESENT', 'ABSENT', 'CANCELLED'];

  return (
    <div className="editorial-segment-control">
      {showHourLabel && (
        <div className="editorial-hour-label">
          <span className="hour-title">{hourLabel || `Hour ${hourIndex}`}</span>
          {status && STATUS_CONFIG[status] ? (
            <span className={`editorial-status-badge status-${status.toLowerCase()}`}>
              {STATUS_CONFIG[status].label}
            </span>
          ) : (
            <span className="editorial-status-badge status-unmarked">Unmarked</span>
          )}
        </div>
      )}

      <div className="editorial-btn-group" role="group" aria-label="Attendance Status">
        {options.map((optKey) => {
          const cfg = STATUS_CONFIG[optKey];
          const Icon = cfg.icon;
          const isSelected = status === optKey;

          return (
            <button
              key={optKey}
              type="button"
              className={`editorial-segment-btn btn-${optKey.toLowerCase()} ${isSelected ? 'selected' : ''}`}
              disabled={isMarking}
              onClick={() => onMarkStatus(optKey)}
              aria-pressed={isSelected}
              title={isSelected ? `${cfg.label} (Tap again to reset to Unmarked)` : cfg.label}
            >
              <Icon size={13} className="btn-icon" />
              <span className="btn-text-full">{cfg.label}</span>
              <span className="btn-text-short">{cfg.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

