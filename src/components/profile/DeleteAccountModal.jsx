import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';

export const DeleteAccountModal = ({
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
      setIsDeleting(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = confirmationText === 'DELETE';

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!isConfirmed || isDeleting) return;

    setIsDeleting(true);
    setErrorMessage('');

    try {
      const res = await onConfirmDelete();
      if (!res || !res.success) {
        setErrorMessage(res?.error || 'Failed to delete account. Please try again.');
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('Delete account modal error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while deleting your account.');
      setIsDeleting(false);
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
        if (e.target === e.currentTarget && !isDeleting) {
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-absent)',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 id="delete-account-title" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Delete Account
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                This action is permanent and cannot be undone
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isDeleting}
            style={{ padding: '8px', minWidth: '40px', minHeight: '40px' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="alert alert-danger" role="alert" style={{ fontSize: '0.86rem' }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Warning Callout Box */}
        <div
          style={{
            padding: '14px 16px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.86rem',
            lineHeight: '1.5',
            color: 'var(--text-main)',
          }}
        >
          <strong style={{ color: 'var(--color-absent)', display: 'block', marginBottom: '6px' }}>
            Deleting your account will permanently erase:
          </strong>
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>Your Supabase Auth account credentials</li>
            <li>Your student profile, name, and roll number</li>
            <li>All recorded attendance history and logs</li>
            <li>All saved extra lectures and personal schedule data</li>
          </ul>
        </div>

        {/* Form Input for Confirmation */}
        <form onSubmit={handleDelete} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="delete-confirm-input" style={{ fontSize: '0.86rem' }}>
              To confirm deletion, type <strong style={{ color: 'var(--color-absent)' }}>DELETE</strong> below:
            </label>
            <input
              id="delete-confirm-input"
              type="text"
              className="input-field"
              placeholder="Type DELETE to confirm"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              disabled={isDeleting}
              autoComplete="off"
              style={{
                borderColor: confirmationText === 'DELETE' ? 'var(--color-absent)' : undefined,
                fontWeight: confirmationText === 'DELETE' ? 700 : 400,
              }}
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '8px',
            }}
          >
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isDeleting}
              style={{ minHeight: '44px' }}
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="danger"
              disabled={!isConfirmed || isDeleting}
              loading={isDeleting}
              icon={Trash2}
              style={{ minHeight: '44px' }}
            >
              {isDeleting ? 'Deleting Account...' : 'Permanently Delete My Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
