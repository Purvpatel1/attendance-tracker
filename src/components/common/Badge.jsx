import React from 'react';

export const Badge = ({ children, variant = 'info', className = '' }) => {
  const variantClass = {
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
    info: 'badge-info',
  }[variant] || 'badge-info';

  return <span className={`badge ${variantClass} ${className}`}>{children}</span>;
};
