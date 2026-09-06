import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { GraduationCap, LogIn, UserPlus, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const BRANCH_BATCH_MAPPING = {
  'Computer Engineering (CE)': ['CE1', 'CE2'],
  'Computer Science & Engineering (CSE)': ['CSE1', 'CSE2'],
  'Computer Science Engineering-AIML (AIML)': ['AM1', 'AM2'],
  'Information Technology (IT)': ['IT1', 'IT2'],
};

export const BRANCHES = Object.keys(BRANCH_BATCH_MAPPING);

export const AuthPage = () => {
  const { signIn, signUp, loading, isConfigured } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    rollNumber: '',
    branch: BRANCHES[0],
    batch: BRANCH_BATCH_MAPPING[BRANCHES[0]][0],
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
    setErrorMessage('');
    setSuccessMessage('');

    if (isSignUp) {
      if (!formData.fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
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
          setIsSignUp(false);
        } else {
          setSuccessMessage('Student account created successfully! You are now logged in.');
        }
      } else {
        setErrorMessage(res.error || 'Registration failed.');
      }
    } else {
      const res = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (res.success) {
        setSuccessMessage('Welcome back!');
      } else {
        setErrorMessage(res.error || 'Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
            }}
          >
            <GraduationCap size={34} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Attendance Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
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
        {errorMessage && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Glass Card */}
        <Card>
          {/* Tab Switcher */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              className={`btn ${!isSignUp ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px', fontSize: '0.85rem' }}
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage('');
                setSuccessMessage('');
              }}
            >
              <LogIn size={16} />
              <span>Log In</span>
            </button>
            <button
              type="button"
              className={`btn ${isSignUp ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px', fontSize: '0.85rem' }}
              onClick={() => {
                setIsSignUp(true);
                setErrorMessage('');
                setSuccessMessage('');
              }}
            >
              <UserPlus size={16} />
              <span>Sign Up</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    className="input-field"
                    placeholder="e.g. Alex Vance"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Roll Number / Student ID</label>
                  <input
                    type="text"
                    name="rollNumber"
                    className="input-field"
                    placeholder="e.g. 21CS042"
                    value={formData.rollNumber}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Branch *</label>
                    <select
                      name="branch"
                      className="select-field"
                      value={formData.branch}
                      onChange={handleBranchChange}
                      required
                    >
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Batch *</label>
                    <select
                      name="batch"
                      className="select-field"
                      value={formData.batch}
                      onChange={handleChange}
                      required
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

            <div className="form-group">
              <label className="form-label">Student Email *</label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="student@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', marginTop: '12px' }}
              icon={isSignUp ? UserPlus : LogIn}
            >
              {isSignUp ? 'Create Student Account' : 'Sign In to Student Portal'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
