import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = (status || '').toLowerCase().trim();

  let styleClass = 'submitted';
  let dotColor = '#3B82F6';

  if (norm.includes('under review') || norm.includes('assessment')) {
    styleClass = 'under-review';
    dotColor = '#7E22CE';
  } else if (norm.includes('approved') || norm.includes('settled') || norm === 'active' || norm === 'completed') {
    styleClass = 'approved';
    dotColor = '#10B981';
  } else if (norm.includes('document') || norm.includes('pending') || norm === 'medium') {
    styleClass = 'documents-required';
    dotColor = '#F59E0B';
  } else if (norm.includes('rejected') || norm.includes('cancel') || norm === 'expired' || norm === 'high') {
    styleClass = 'rejected';
    dotColor = '#EF4444';
  } else if (norm === 'low' || norm === 'new' || norm === 'submitted') {
    styleClass = 'submitted';
    dotColor = '#3B82F6';
  }

  return (
    <span className={`status-pill ${styleClass} ${className}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: dotColor }}></span>
      {status}
    </span>
  );
};
