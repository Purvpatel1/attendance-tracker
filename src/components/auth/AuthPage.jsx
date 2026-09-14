import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { ThemeToggle } from '../common/ThemeToggle';
import { GraduationCap, LogIn, UserPlus, AlertCircle, Sparkles, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';

const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const BRANCH_BATCH_MAPPING = {
  'Computer Engineering (CE)': ['CE1', 'CE2'],
  'Computer Science & Engineering (CSE)': ['CSE1', 'CSE2'],
  'Computer Science Engineering-AIML (AIML)': ['AM1', 'AM2'],
  'Information Technology (IT)': ['IT1', 'IT2'],
};

export const BRANCHES = Object.keys(BRANCH_BATCH_MAPPING);

export const AuthPage = ({ initialMode = 'login' }) => {
  const {
    signIn,
    signUp,
    signInWithGoogle,
    requestPasswordReset,
    updatePassword,
    clearRecoveryMode,
    deletionNotice,
    clearDeletionNotice,
    loading: authLoading,
    isConfigured,
  } = useAuth();

  // Mode state: 'login' | 'signup' | 'forgot' | 'reset'
  const [mode, setMode] = useState(initialMode);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Input Field References for Controlled Focus
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const fullNameRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    rollNumber: '',
    branch: BRANCHES[0],
    batch: BRANCH_BATCH_MAPPING[BRANCHES[0]][0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear inline error as the user types into the field
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

  // Switch form modes cleanly and clear validation errors
  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
    setFieldErrors({});
    if (newMode === 'login' || newMode === 'signup') {
      clearRecoveryMode?.();
    }
  };

  // Controlled Submit Handler with React Validation & Focus Management
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');
    setSuccessMessage('');
    setFieldErrors({});

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // --- MODE 1: LOG IN ---
    if (mode === 'login') {
      const errors = {};
      const emailTrim = (formData.email || '').trim();
      const pass = formData.password || '';

      if (!emailTrim) {
        errors.email = 'Please enter your student email.';
      } else if (!emailRegex.test(emailTrim)) {
        errors.email = 'Please enter a valid email address.';
      }
      if (!pass) {
        errors.password = 'Please enter your password.';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        if (errors.email) {
          emailRef.current?.focus();
        } else if (errors.password) {
          passwordRef.current?.focus();
        }
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await signIn({ email: emailTrim, password: formData.password });
        if (!res.success) {
          setErrorMessage(res.error || 'Invalid student ID or password.');
        } else {
          setSuccessMessage('Welcome back!');
        }
      } catch (err) {
        console.error('Login submit error:', err);
        setErrorMessage('Something went wrong while signing in. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // --- MODE 2: SIGN UP ---
    if (mode === 'signup') {
      const errors = {};
      const nameTrim = (formData.fullName || '').trim();
      const emailTrim = (formData.email || '').trim();
      const pass = formData.password || '';

      if (!nameTrim) {
        errors.fullName = 'Please enter your full name.';
      }
      if (!emailTrim || !emailRegex.test(emailTrim)) {
        errors.email = 'Please enter a valid email address.';
      }
      if (!pass) {
        errors.password = 'Please enter a password.';
      } else if (pass.length < 8) {
        errors.password = 'Password must be at least 8 characters.';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        if (errors.fullName) {
          fullNameRef.current?.focus();
        } else if (errors.email) {
          emailRef.current?.focus();
        } else if (errors.password) {
          passwordRef.current?.focus();
        }
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await signUp({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          rollNumber: formData.rollNumber,
          branch: formData.branch,
          batch: formData.batch,
        });

        if (res.success) {
          if (res.requiresConfirmation) {
            setSuccessMessage(res.message || 'Account created! Please confirm your email to sign in.');
            switchMode('login');
          } else {
            setSuccessMessage('Student account created successfully! You are now logged in.');
          }
        } else {
          setErrorMessage(res.error || 'Registration failed.');
        }
      } catch (err) {
        console.error('Signup submit error:', err);
        setErrorMessage('Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // --- MODE 3: FORGOT PASSWORD REQUEST ---
    if (mode === 'forgot') {
      const errors = {};
      const emailTrim = (formData.email || '').trim();

      if (!emailTrim || !emailRegex.test(emailTrim)) {
        errors.email = 'Please enter a valid email address.';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        emailRef.current?.focus();
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await requestPasswordReset(emailTrim);
        setSuccessMessage(res.message || 'If an account exists with this email, a password reset link has been sent.');
      } catch (err) {
        console.error('Forgot password submit error:', err);
        setSuccessMessage('If an account exists with this email, a password reset link has been sent.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // --- MODE 4: RESET PASSWORD (NEW PASSWORD UPDATE) ---
    if (mode === 'reset') {
      const errors = {};
      const pass = formData.password || '';
      const confirmPass = formData.confirmPassword || '';

      if (!pass) {
        errors.password = 'Please enter a new password.';
      } else if (pass.length < 8) {
        errors.password = 'Password must be at least 8 characters.';
      }

      if (!confirmPass) {
        errors.confirmPassword = 'Please confirm your new password.';
      } else if (pass && confirmPass && pass !== confirmPass) {
        errors.confirmPassword = 'Passwords do not match.';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        if (errors.password) {
          passwordRef.current?.focus();
        } else if (errors.confirmPassword) {
          confirmPasswordRef.current?.focus();
        }
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await updatePassword(formData.password);
        if (res.success) {
          setSuccessMessage(res.message || 'Password updated successfully!');
          setTimeout(() => {
            switchMode('login');
          }, 2000);
        } else {
          setErrorMessage(res.error || 'Could not update password. Link may be expired.');
        }
      } catch (err) {
        console.error('Reset password submit error:', err);
        setErrorMessage('Could not update password. Please try requesting a new reset link.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoadingState) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to initialize Google sign-in.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setErrorMessage('Failed to connect to Google sign-in. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isLoadingState = authLoading || isSubmitting;

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
            Smart student attendance & safe bunk tracker
          </p>
        </div>

        {/* Supabase Notice Banner */}
        {!isConfigured && (
          <div className="alert alert-info">
            <Sparkles size={18} />
            <div>
              <strong>Dev Preview Mode:</strong> Supabase API keys not set in <code>.env</code>. Local mock storage enabled.
            </div>
          </div>
        )}

        {/* Error / Success Toast Alerts */}
        {deletionNotice && (
          <div className="alert alert-success" role="status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <span>{deletionNotice}</span>
            </div>
            {clearDeletionNotice && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={clearDeletionNotice}
                style={{ padding: '4px', minWidth: 'auto', minHeight: 'auto', color: 'inherit' }}
                aria-label="Dismiss notice"
              >
                ✕
              </button>
            )}
          </div>
        )}
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success" role="status">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Glass Card */}
        <Card className="auth-card">
          {/* Top Mode Header / Tab Switcher */}
          {mode === 'login' || mode === 'signup' ? (
            <div className="auth-tab-container">
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
                disabled={isLoadingState}
                onClick={() => switchMode('login')}
              >
                <LogIn size={16} />
                <span>Log In</span>
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                disabled={isLoadingState}
                onClick={() => switchMode('signup')}
              >
                <UserPlus size={16} />
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            <div className="auth-submode-header">
              <button
                type="button"
                className="btn btn-ghost auth-back-btn"
                disabled={isLoadingState}
                onClick={() => switchMode('login')}
              >
                <ArrowLeft size={14} />
                <span>Back to Log In</span>
              </button>
              <h2 className="auth-submode-title">
                {mode === 'forgot' ? 'Reset Password' : 'Set New Password'}
              </h2>
              <p className="auth-submode-desc">
                {mode === 'forgot'
                  ? 'Enter your registered email to receive a password recovery link.'
                  : 'Enter and confirm your new password below.'}
              </p>
            </div>
          )}

          {/* Form with Native Validation Disabled */}
          <form noValidate onSubmit={handleSubmit}>
            {/* SIGN UP EXTRA FIELDS */}
            {mode === 'signup' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-fullName">Full Name *</label>
                  <input
                    id="auth-fullName"
                    ref={fullNameRef}
                    type="text"
                    name="fullName"
                    className={`input-field ${fieldErrors.fullName ? 'input-error' : ''}`}
                    placeholder="e.g. Alex Vance"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isLoadingState}
                    aria-invalid={Boolean(fieldErrors.fullName)}
                    aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
                  />
                  {fieldErrors.fullName && (
                    <span id="fullName-error" role="alert" className="form-field-error">
                      <AlertCircle size={14} />
                      {fieldErrors.fullName}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="auth-rollNumber">Roll Number / Student ID</label>
                  <input
                    id="auth-rollNumber"
                    type="text"
                    name="rollNumber"
                    className="input-field"
                    placeholder="e.g. 21CS042"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    disabled={isLoadingState}
                  />
                </div>

                <div className="auth-branch-batch-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="auth-branch">Branch *</label>
                    <select
                      id="auth-branch"
                      name="branch"
                      className="select-field"
                      value={formData.branch}
                      onChange={handleBranchChange}
                      disabled={isLoadingState}
                    >
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="auth-batch">Batch *</label>
                    <select
                      id="auth-batch"
                      name="batch"
                      className="select-field"
                      value={formData.batch}
                      onChange={handleChange}
                      disabled={isLoadingState}
                    >
                      {(BRANCH_BATCH_MAPPING[formData.branch] || []).map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* EMAIL FIELD (LOGIN, SIGNUP, FORGOT) */}
            {mode !== 'reset' && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-email">Student Email *</label>
                <input
                  id="auth-email"
                  ref={emailRef}
                  type="email"
                  name="email"
                  className={`input-field ${fieldErrors.email ? 'input-error' : ''}`}
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoadingState}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
                {fieldErrors.email && (
                  <span id="email-error" role="alert" className="form-field-error">
                    <AlertCircle size={14} />
                    {fieldErrors.email}
                  </span>
                )}
              </div>
            )}

            {/* PASSWORD FIELD (LOGIN, SIGNUP, RESET) */}
            {mode !== 'forgot' && (
              <div className="form-group">
                <div className="auth-label-row">
                  <label className="form-label" htmlFor="auth-password">
                    {mode === 'reset' ? 'New Password *' : 'Password *'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="forgot-password-link"
                      disabled={isLoadingState}
                      onClick={() => switchMode('forgot')}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="auth-password"
                  ref={passwordRef}
                  type="password"
                  name="password"
                  className={`input-field ${fieldErrors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoadingState}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                />
                {fieldErrors.password && (
                  <span id="password-error" role="alert" className="form-field-error">
                    <AlertCircle size={14} />
                    {fieldErrors.password}
                  </span>
                )}
              </div>
            )}

            {/* CONFIRM PASSWORD FIELD (RESET MODE ONLY) */}
            {mode === 'reset' && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-confirmPassword">Confirm New Password *</label>
                <input
                  id="auth-confirmPassword"
                  ref={confirmPasswordRef}
                  type="password"
                  name="confirmPassword"
                  className={`input-field ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoadingState}
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
            )}

            {/* SUBMIT BUTTON WITH LOADING STATES */}
            <Button
              type="submit"
              variant="primary"
              loading={isLoadingState}
              disabled={isLoadingState}
              style={{ width: '100%', marginTop: '16px', minHeight: '44px' }}
              icon={
                mode === 'signup'
                  ? UserPlus
                  : mode === 'forgot'
                  ? KeyRound
                  : mode === 'reset'
                  ? CheckCircle2
                  : LogIn
              }
            >
              {isLoadingState
                ? mode === 'signup'
                  ? 'Creating Student Account...'
                  : mode === 'forgot'
                  ? 'Sending Recovery Link...'
                  : mode === 'reset'
                  ? 'Updating Password...'
                  : 'Signing in...'
                : mode === 'signup'
                ? 'Create Student Account'
                : mode === 'forgot'
                ? 'Send Password Reset Link'
                : mode === 'reset'
                ? 'Update Password & Log In'
                : 'Sign In to Student Portal'}
            </Button>

            {/* GOOGLE OAUTH CONTINUATION BUTTON & DIVIDER */}
            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="auth-divider">
                  <span className="auth-divider-text">Or continue with</span>
                </div>

                <button
                  type="button"
                  className="btn-google"
                  onClick={handleGoogleSignIn}
                  disabled={isLoadingState}
                  aria-label="Continue with Google"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" />
                  ) : (
                    <GoogleIcon size={18} />
                  )}
                  <span>{isSubmitting ? 'Redirecting to Google...' : 'Continue with Google'}</span>
                </button>
              </>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};
