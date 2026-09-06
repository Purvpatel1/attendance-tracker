import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  interactive = false,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`glass-card ${interactive ? 'interactive' : ''} ${className}`}
      style={style}
    >
      {(title || headerAction) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            {title && <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
