import React, { useRef } from 'react';
import { DAYS_OF_WEEK } from '../../services/timetableService';
import { getDayOfWeekFromDateString } from '../../services/attendanceService';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export const ScheduleHeader = ({
  selectedDate,
  selectedDay,
  onSelectDate,
  onSelectDay,
  onOpenExtraModal,
  timetableData,
}) => {
  const dateInputRef = useRef(null);

  // Format YYYY-MM-DD string to "Weekday, DD MMM YYYY"
  const formatDateDisplay = (dateStr) => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekdayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
    return `${weekdayName}, ${day} ${monthName} ${year}`;
  };

  // Step target date forward or backward by N days
  const stepDate = (deltaDays) => {
    if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) return;
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day + deltaDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const nextDateStr = `${yyyy}-${mm}-${dd}`;
    onSelectDate(nextDateStr);
    onSelectDay(getDayOfWeekFromDateString(nextDateStr));
  };

  return (
    <div className="editorial-schedule-header">
      {/* Top Bar: Date Title, Navigation Chevrons, Date Picker, Add Extra Class */}
      <div className="editorial-header-top">
        <div className="editorial-date-group">
          <button
            type="button"
            className="editorial-step-btn"
            onClick={() => stepDate(-1)}
            title="Previous Day"
            aria-label="Previous Day"
          >
            <ChevronLeft size={16} />
          </button>

          <div
            className="editorial-date-trigger"
            onClick={() => {
              try {
                dateInputRef.current?.showPicker?.();
              } catch (e) {
                dateInputRef.current?.focus?.();
              }
            }}
            title="Click to select date"
          >
            <Calendar size={16} className="editorial-calendar-icon" />
            <h2 className="editorial-date-title">{formatDateDisplay(selectedDate)}</h2>
            <input
              ref={dateInputRef}
              type="date"
              className="editorial-hidden-date-input"
              value={selectedDate || ''}
              onChange={(e) => {
                const dateVal = e.target.value;
                if (dateVal) {
                  onSelectDate(dateVal);
                  onSelectDay(getDayOfWeekFromDateString(dateVal));
                }
              }}
              aria-label="Select Date"
            />
          </div>

          <button
            type="button"
            className="editorial-step-btn"
            onClick={() => stepDate(1)}
            title="Next Day"
            aria-label="Next Day"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          type="button"
          className="editorial-extra-btn"
          onClick={onOpenExtraModal}
        >
          <Plus size={14} />
          <span>Extra Class</span>
        </button>
      </div>

      {/* 6-Day Selector Strip (Mon-Sat) */}
      <div className="editorial-day-strip">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day.id;
          const slotCount = (timetableData?.scheduleByDay?.[day.id] || []).length;
          return (
            <button
              key={day.id}
              type="button"
              className={`editorial-day-pill ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDay(day.id)}
            >
              <span className="day-name">{day.short}</span>
              <span className="day-count">{slotCount}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

