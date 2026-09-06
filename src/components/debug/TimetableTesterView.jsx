import React, { useState } from 'react';
import {
  getValidBranchBatchCombinations,
  getTimetableForStudent,
  DAYS_OF_WEEK,
} from '../../services/timetableService';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { CheckCircle, Clock, MapPin, User, BookOpen, Layers, Sparkles } from 'lucide-react';

export const TimetableTesterView = () => {
  const validCombinations = getValidBranchBatchCombinations();
  const [selectedKey, setSelectedKey] = useState(validCombinations[0].key);
  const [selectedDay, setSelectedDay] = useState(1);

  const activeCombo = validCombinations.find((c) => c.key === selectedKey) || validCombinations[0];
  const timetable = getTimetableForStudent(activeCombo.branch, activeCombo.batch);
  const daySchedule = timetable.scheduleByDay[selectedDay] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Alert */}
      <Card
        title="Phase 2 Verification & Debug Inspector"
        subtitle="Test all 8 valid Branch + Batch combinations against actual T.Y.B.Tech Semester V timetables"
        headerAction={<Badge variant="warning">Verification Mode</Badge>}
      >
        {/* Selector Buttons for the 8 valid combinations */}
        <div style={{ marginTop: '14px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            Select Branch + Practical Batch Combination:
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '8px',
            }}
          >
            {validCombinations.map((combo) => {
              const isSelected = combo.key === selectedKey;
              return (
                <button
                  key={combo.key}
                  onClick={() => setSelectedKey(combo.key)}
                  type="button"
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid ' + (isSelected ? 'var(--primary-500)' : 'var(--border-subtle)'),
                    background: isSelected ? 'var(--primary-gradient)' : 'rgba(15, 23, 42, 0.6)',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{combo.key}</span>
                  {isSelected && <CheckCircle size={14} color="#fff" />}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Active Combination Summary */}
      <Card
        title={`Inspect: ${activeCombo.branch}`}
        subtitle={`Practical Batch: ${activeCombo.batch}`}
        headerAction={<Badge variant="success">Validated Schedule</Badge>}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginTop: '8px',
          }}
        >
          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Registered Subjects</span>
            <strong style={{ fontSize: '1.2rem', display: 'block', marginTop: '2px' }}>{timetable.subjects.length} Courses</strong>
          </div>
          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Weekly Slots</span>
            <strong style={{ fontSize: '1.2rem', display: 'block', marginTop: '2px' }}>{timetable.totalSlotsCount} Slots</strong>
          </div>
          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Branch Common Lectures</span>
            <strong style={{ fontSize: '1.2rem', display: 'block', marginTop: '2px', color: 'var(--color-info)' }}>{timetable.commonLecturesCount} Lectures</strong>
          </div>
          <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Batch {activeCombo.batch} Labs</span>
            <strong style={{ fontSize: '1.2rem', display: 'block', marginTop: '2px', color: 'var(--color-cancelled)' }}>{timetable.batchLabsCount} Labs</strong>
          </div>
        </div>
      </Card>

      {/* Day Selector */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day.id;
          const slotsCount = (timetable.scheduleByDay[day.id] || []).length;
          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              style={{
                flex: 1,
                minWidth: '70px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid ' + (isSelected ? 'var(--primary-500)' : 'var(--border-subtle)'),
                background: isSelected ? 'var(--primary-gradient)' : 'rgba(17, 24, 39, 0.6)',
                color: isSelected ? '#fff' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div>{day.short}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{slotsCount} slots</div>
            </button>
          );
        })}
      </div>

      {/* Day Schedule Inspection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {daySchedule.length === 0 ? (
          <Card>
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No classes for {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name}
            </div>
          </Card>
        ) : (
          daySchedule.map((slot) => (
            <Card key={slot.id} interactive>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <Clock size={16} color="var(--primary-500)" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Badge variant={slot.type === 'Lab' ? 'warning' : 'success'}>
                      {slot.type}
                    </Badge>
                    {slot.isBatchSpecific ? (
                      <Badge variant="danger">
                        Batch {slot.batchScope} Lab
                      </Badge>
                    ) : (
                      <Badge variant="info">
                        Branch Common
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '1.05rem' }}>{slot.subjectName}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {slot.code}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span><MapPin size={12} /> Location: <strong>{slot.room}</strong></span>
                  <span><User size={12} /> Faculty: <strong>{slot.teacher}</strong></span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
