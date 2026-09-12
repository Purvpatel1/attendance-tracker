import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Spinner } from '../common/Spinner';
import {
  User,
  Mail,
  Hash,
  GitBranch,
  Users,
  KeyRound,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const StudentProfileView = () => {
  const { user, profile, loading: authLoading, updatePassword, signOut } = useAuth();

  // Change Password state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [logoutError, setLogoutError] = useState('');

  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // Helper to safely format string fields; returns 'Not available' if missing or empty
  const formatVal = (val) => {
    if (val === null || val === undefined) return 'Not available';
    if (typeof val === 'string' && !val.trim()) return 'Not available';
    return String(val).trim();
  };

  const fullName = formatVal(profile?.full_name || user?.user_metadata?.full_name);
  const email = formatVal(user?.email);
  const rollNumber = formatVal(profile?.roll_number || user?.user_metadata?.roll_number);
  const branch = formatVal(profile?.branch || user?.user_metadata?.branch);
  const rawBatch = profile?.batch || user?.user_metadata?.batch;
  const batch = rawBatch && String(rawBatch).trim() ? `Batch ${String(rawBatch).trim()}` : 'Not available';

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setPasswordSuccess('');
    setPasswordError('');
    setFieldErrors({});

    const errors = {};
    const pass = passwordData.newPassword || '';
    const confirm = passwordData.confirmPassword || '';

    if (!pass) {
      errors.newPassword = 'Please enter a new password.';
    } else if (pass.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters.';
    }

    if (!confirm) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (pass && confirm && pass !== confirm) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (errors.newPassword) {
        newPasswordRef.current?.focus();
      } else if (errors.confirmPassword) {
        confirmPasswordRef.current?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updatePassword(pass);
      if (res && res.success) {
        setPasswordSuccess('Password updated successfully!');
        setPasswordData({ newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(res?.error || 'Could not update password. Please check requirements and try again.');
      }
    } catch (err) {
      console.error('Profile password update error:', err);
      setPasswordError('Something went wrong while updating your password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setLogoutError('');
    setIsLoggingOut(true);
    try {
      const res = await signOut();
      if (res && res.success === false) {
        setLogoutError(res.error || 'Failed to log out. Please try again.');
      }
    } catch (err) {
      console.error('Logout error:', err);
      setLogoutError('An unexpected error occurred while logging out.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (authLoading) {
    return <Spinner label="Loading Student Profile..." />;
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Student Profile</h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          View your academic record and manage account security
        </p>
      </div>

      {/* Logout error banner if any */}
      {logoutError && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} />
          <span>{logoutError}</span>
        </div>
      )}

      {/* Card 1: Academic & Personal Details */}
      <Card
        title="Academic & Personal Details"
        subtitle="Academic mapping details are read-only and control your timetable view"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
            }}
          >
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="var(--primary)" /> Full Name
              </label>
              <div
                className="input-field"
                style={{
                  background: 'var(--bg-subtle)',
                  cursor: 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 600,
                }}
              >
                {fullName}
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} color="var(--primary)" /> Student Email
              </label>
              <div
                className="input-field"
                style={{
                  background: 'var(--bg-subtle)',
                  cursor: 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {email}
              </div>
            </div>

            {/* Student ID / Roll Number (Read-only) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Hash size={14} color="var(--primary)" /> Student ID / Roll Number
                </label>
                <Badge variant="info" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                  <Lock size={10} style={{ marginRight: '3px' }} /> Read-only
                </Badge>
              </div>
              <div
                className="input-field"
                style={{
                  background: 'var(--bg-subtle)',
                  borderColor: 'var(--border-subtle)',
                  color: rollNumber === 'Not available' ? 'var(--text-muted)' : 'var(--text-main)',
                }}
              >
                {rollNumber}
              </div>
            </div>

            {/* Branch (Read-only) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GitBranch size={14} color="var(--primary)" /> Branch
                </label>
                <Badge variant="info" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                  <Lock size={10} style={{ marginRight: '3px' }} /> Read-only
                </Badge>
              </div>
              <div
                className="input-field"
                style={{
                  background: 'var(--bg-subtle)',
                  borderColor: 'var(--border-subtle)',
                  color: branch === 'Not available' ? 'var(--text-muted)' : 'var(--text-main)',
                }}
              >
                {branch}
              </div>
            </div>

            {/* Practical Batch (Read-only) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} color="var(--primary)" /> Batch
                </label>
                <Badge variant="info" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                  <Lock size={10} style={{ marginRight: '3px' }} /> Read-only
                </Badge>
              </div>
              <div
                className="input-field"
                style={{
                  background: 'var(--bg-subtle)',
                  borderColor: 'var(--border-subtle)',
                  color: batch === 'Not available' ? 'var(--text-muted)' : 'var(--text-main)',
                }}
              >
                {batch}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Card 2: Security & Password */}
      <Card
        title="Security & Password"
        subtitle="Update your account password securely using Supabase Auth"
      >
        {passwordError && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={18} />
            <span>{passwordError}</span>
          </div>
        )}
        {passwordSuccess && (
          <div className="alert alert-success" role="status">
            <CheckCircle2 size={18} />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form noValidate onSubmit={handlePasswordSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* New Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="profile-newPassword">New Password *</label>
              <input
                id="profile-newPassword"
                ref={newPasswordRef}
                type="password"
                name="newPassword"
                className={`input-field ${fieldErrors.newPassword ? 'input-error' : ''}`}
                placeholder="At least 8 characters"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.newPassword)}
                aria-describedby={fieldErrors.newPassword ? 'newPassword-error' : undefined}
              />
              {fieldErrors.newPassword && (
                <span id="newPassword-error" role="alert" className="form-field-error">
                  <AlertCircle size={14} />
                  {fieldErrors.newPassword}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="profile-confirmPassword">Confirm New Password *</label>
              <input
                id="profile-confirmPassword"
                ref={confirmPasswordRef}
                type="password"
                name="confirmPassword"
                className={`input-field ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Re-enter new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
              />
              {fieldErrors.confirmPassword && (
                <span id="confirmPassword-error" role="alert" className="form-field-error">
                  <AlertCircle size={14} />
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              icon={KeyRound}
              style={{ alignSelf: 'flex-start', marginTop: '4px' }}
            >
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Card 3: Account Session & Logout */}
      <Card title="Account Session">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Sign Out of Attendance Hub</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Safely log out of your current session on this device.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={handleLogout}
            loading={isLoggingOut}
            disabled={isLoggingOut}
            icon={LogOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
