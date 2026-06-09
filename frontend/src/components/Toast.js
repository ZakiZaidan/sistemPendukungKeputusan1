'use client';

import useStore from '@/lib/store';

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;

  return (
    <div className={`toast ${toast.type}`}>
      <span className={`toast-icon ${toast.type}`}>
        {toast.type === 'success' ? <IconCheck /> : <IconX />}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}
