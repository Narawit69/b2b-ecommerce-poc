import React, { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div 
      className="animate-fade"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 200,
        minWidth: '320px',
        maxWidth: '460px',
        padding: '14px 18px',
        borderRadius: 'var(--radius-sm)',
        background: '#1f2937',
        border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.5)' : isError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(99, 102, 241, 0.5)'}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isSuccess ? 'var(--success)' : isError ? 'var(--danger)' : 'var(--primary)'
        }}></span>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
            {toast.title || (isSuccess ? 'สำเร็จ' : isError ? 'ข้อผิดพลาด' : 'แจ้งเตือน')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {toast.message}
          </div>
        </div>
      </div>

      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px'
        }}
      >
        ✕
      </button>
    </div>
  );
}
