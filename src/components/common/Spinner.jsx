import React from 'react';

export const Spinner = ({ label = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      {label && <p className="text-muted">{label}</p>}
    </div>
  );
};
