import React from 'react';

export default function RiskCard({ data }) {
  const { risk_rating, primary_hazard, proactive_precautions, color_code } = data;

  // Map color code to status styles
  const getThemeStyles = () => {
    switch (risk_rating.toLowerCase()) {
      case 'critical':
        return {
          bgGlow: 'rgba(230, 57, 70, 0.08)',
          border: 'rgba(230, 57, 70, 0.3)',
          text: 'var(--color-danger)',
          tagBg: 'rgba(230, 57, 70, 0.15)',
          shadow: '0 0 15px rgba(230, 57, 70, 0.15)'
        };
      case 'high':
        return {
          bgGlow: 'rgba(244, 162, 97, 0.08)',
          border: 'rgba(244, 162, 97, 0.3)',
          text: 'var(--color-warning)',
          tagBg: 'rgba(244, 162, 97, 0.15)',
          shadow: '0 0 15px rgba(244, 162, 97, 0.15)'
        };
      case 'medium':
        return {
          bgGlow: 'rgba(244, 162, 97, 0.05)',
          border: 'rgba(244, 162, 97, 0.25)',
          text: 'var(--color-warning)',
          tagBg: 'rgba(244, 162, 97, 0.12)',
          shadow: 'none'
        };
      case 'low':
      default:
        return {
          bgGlow: 'rgba(42, 157, 143, 0.08)',
          border: 'rgba(42, 157, 143, 0.25)',
          text: 'var(--color-success)',
          tagBg: 'rgba(42, 157, 143, 0.15)',
          shadow: 'none'
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div
      className="glass-panel animate-fade-in-up"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        backgroundColor: theme.bgGlow,
        borderColor: theme.border,
        boxShadow: `var(--shadow-glow), ${theme.shadow}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme.text }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Threat Assessment
        </h3>

        <span style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: '800',
          fontSize: '0.8rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: theme.tagBg,
          color: theme.text,
          border: `1px solid ${theme.border}`
        }}>
          {risk_rating} Risk
        </span>
      </div>

      {/* Primary Hazard description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          Primary Hazard
        </span>
        <p style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-main)' }}>
          {primary_hazard}
        </p>
      </div>

      {/* Proactive precautions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          Proactive Precautions
        </span>
        <ul style={{
          listStyleType: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          {proactive_precautions.map((item, idx) => (
            <li key={idx} style={{
              fontSize: '0.85rem',
              display: 'flex',
              gap: '0.6rem',
              color: 'var(--text-main)',
              lineHeight: 1.4
            }}>
              <span style={{
                color: theme.text,
                fontWeight: 'bold',
                flexShrink: 0,
                fontSize: '1rem',
                marginTop: '-2px'
              }}>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
