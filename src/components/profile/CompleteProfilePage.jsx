import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ThemeToggle } from '../common/ThemeToggle';
import { BRANCH_BATCH_MAPPING, BRANCHES } from '../auth/AuthPage';
import {
  GraduationCap,
  UserCheck,
  AlertCircle,
  LogOut,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const CompleteProfilePage = () => {
  const { user, profile, updateProfile, signOut } = useAuth();

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    rollNumber: profile?.roll_number || '',
    branch: profile?.branch || BRANCHES[0],
    batch: profile?.batch || (BRANCH_BATCH_MAPPING[BRANCHES[0]] ? BRANCH_BATCH_MAPPING[BRANCHES[0]][0] : ''),
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fullNameRef = useRef(null);
  const rollNumberRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBranchChange = (e) => {
    const selectedBranch = e.target.value;
    const availableBatches = BRANCH_BATCH_MAPPING[selectedBranch] || [];
    setFormData((prev) => ({
      ...prev,
      branch: selectedBranch,
      batch: availableBatches[0] || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');
    setFieldErrors({});

    const errors = {};
    const nameTrim = (formData.fullName || '').trim();
    const rollTrim = (formData.rollNumber || '').trim();

    if (!nameTrim) {
      errors.fullName = 'Please enter your full name.';
    }
    if (!rollTrim) {
      errors.rollNumber = 'Please enter your roll number / student ID.';
    }
    if (!formData.branch) {
      errors.branch = 'Please select your branch.';
    }
    if (!formData.batch) {
      errors.batch = 'Please select your batch.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (errors.fullName) fullNameRef.current?.focus();
      else if (errors.rollNumber) rollNumberRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateProfile({
        fullName: nameTrim,
        rollNumber: rollTrim,
        branch: formData.branch,
        batch: formData.batch,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to complete profile. Please try again.');
      }
    } catch (err) {
      console.error('Complete profile error:', err);
      setErrorMessage('Something went wrong while saving your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Top Right Theme Toggle */}
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="auth-content-wrapper">
        {/* Brand Logo Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-icon">
            <GraduationCap size={34} color="#ffffff" />
          </div>
          <h1 className="auth-brand-title">Attendance Hub</h1>
          <p className="auth-brand-subtitle">
            Welcome! Complete your student profile to access your dashboard
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Onboarding Glass Card */}
        <Card className="auth-card">
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
              }}
            >
              <UserCheck size={26} />
            </div>
            <h2 className="auth-submode-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Complete Your Student Profile
            </h2>
            <p className="auth-submode-desc" style={{ fontSize: '0.86rem', marginTop: '4px' }}>
              Select your academic branch and batch so we can personalize your timetable and attendance analytics.
            </p>
          </div>

          <form noValidate onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="onboard-fullName">
                Full Name *
              </label>
              <input
                id="onboard-fullName"
                ref={fullNameRef}
                type="text"
                name="fullName"
                className={`input-field ${fieldErrors.fullName ? 'input-error' : ''}`}
                placeholder="e.g. Alex Vance"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isSubmitting || isLoggingOut}
                aria-invalid={Boolean(fieldErrors.fullName)}
              />
              {fieldErrors.fullName && (
                <span className="form-field-error">
                  <AlertCircle size={14} />
                  {fieldErrors.fullName}
                </span>
              )}
            </div>

            {/* Roll Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="onboard-rollNumber">
                Roll Number / Student ID *
              </label>
              <input
                id="onboard-rollNumber"
                ref={rollNumberRef}
                type="text"
                name="rollNumber"
                className={`input-field ${fieldErrors.rollNumber ? 'input-error' : ''}`}
                placeholder="e.g. 21CS042"
                value={formData.rollNumber}
                onChange={handleChange}
                disabled={isSubmitting || isLoggingOut}
                aria-invalid={Boolean(fieldErrors.rollNumber)}
              />
              {fieldErrors.rollNumber && (
                <span className="form-field-error">
                  <AlertCircle size={14} />
                  {fieldErrors.rollNumber}
                </span>
              )}
            </div>

            {/* Branch & Batch Grid */}
            <div className="auth-branch-batch-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="onboard-branch">
                  Branch *
                </label>
                <select
                  id="onboard-branch"
                  name="branch"
                  className="select-field"
                  value={formData.branch}
                  onChange={handleBranchChange}
                  disabled={isSubmitting || isLoggingOut}
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="onboard-batch">
                  Batch *
                </label>
                <select
                  id="onboard-batch"
                  name="batch"
                  className="select-field"
                  value={formData.batch}
                  onChange={handleChange}
                  disabled={isSubmitting || isLoggingOut}
                >
                  {(BRANCH_BATCH_MAPPING[formData.branch] || []).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting || isLoggingOut}
              style={{ width: '100%', marginTop: '16px', minHeight: '44px' }}
              icon={CheckCircle2}
            >
              {isSubmitting ? 'Saving Profile...' : 'Complete Profile & Continue'}
            </Button>
          </form>

          {/* Sign Out Option */}
          <div style={{ marginTop: '18px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleSignOut}
              disabled={isSubmitting || isLoggingOut}
              style={{ fontSize: '0.84rem', gap: '6px', color: 'var(--text-muted)' }}
            >
              <LogOut size={14} />
              <span>Signed in as {user?.email} • Sign Out</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
