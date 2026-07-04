import React from 'react';

export default function Header() {
  return (
    <header className="glass-panel" style={{
      padding: '1.25rem 2rem',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'rgba(82, 183, 136, 0.15)',
          border: '1px solid rgba(82, 183, 136, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-emerald)'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#52b788" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
          </svg>
        </div>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            lineHeight: 1.1,
            color: 'var(--text-main)',
            fontWeight: 800
          }}>
            WildGuard <span style={{ color: 'var(--primary)' }}>AI</span>
          </h1>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600
          }}>
            Hazard Identification & First Aid
          </span>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#52b788',
          boxShadow: '0 0 8px #52b788'
        }}></span>
        <span>Secure Local Sandboxing</span>
      </div>
    </header>
  );
}
