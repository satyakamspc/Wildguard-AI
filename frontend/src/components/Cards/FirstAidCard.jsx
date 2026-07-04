import React, { useState } from 'react';

export default function FirstAidCard({ data }) {
  const { disclaimer, immediate_steps, critical_warnings, paramedic_checklist } = data;
  
  // State to track completed steps in high-stress situation checklist
  const [checkedSteps, setCheckedSteps] = useState({});

  const toggleStep = (index) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="glass-panel animate-fade-in-up" style={{
      padding: '1.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      borderLeft: '4px solid var(--color-danger)',
      boxShadow: 'var(--shadow-glow), 0 0 25px rgba(230, 57, 70, 0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
          Emergency First Aid Procedures
        </h3>
      </div>

      {/* Medical Disclaimer */}
      <p style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        lineHeight: 1.4,
        paddingBottom: '0.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        {disclaimer}
      </p>

      {/* Interactive Step-by-Step Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Immediate Action Steps</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>Check items off in real-time</span>
        </span>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {immediate_steps.map((step, idx) => {
            const isCallEmergency = step.toUpperCase().includes("CALL EMERGENCY") || step.toUpperCase().includes("911") || step.toUpperCase().includes("112");
            const isChecked = !!checkedSteps[idx];

            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: isCallEmergency 
                    ? 'rgba(230, 57, 70, 0.08)' 
                    : isChecked 
                      ? 'rgba(82, 183, 136, 0.04)' 
                      : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${
                    isCallEmergency 
                      ? 'rgba(230, 57, 70, 0.25)' 
                      : isChecked 
                        ? 'rgba(82, 183, 136, 0.25)' 
                        : 'rgba(255,255,255,0.04)'
                  }`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isChecked ? 0.65 : 1
                }}
              >
                {/* Custom Styled Checkbox */}
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: `2px solid ${
                    isCallEmergency 
                      ? 'var(--color-danger)' 
                      : isChecked 
                        ? 'var(--primary)' 
                        : 'var(--text-muted)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isChecked ? 'var(--primary)' : 'transparent',
                  flexShrink: 0,
                  marginTop: '2px',
                  transition: 'all 0.2s'
                }}>
                  {isChecked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bg-main-start)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                
                <span style={{
                  fontSize: '0.85rem',
                  lineHeight: 1.4,
                  fontWeight: isCallEmergency ? '700' : '400',
                  color: isCallEmergency ? 'var(--color-danger)' : 'var(--text-main)',
                  textDecoration: isChecked ? 'line-through' : 'none',
                  transition: 'color 0.2s'
                }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Warnings (What NOT to do) */}
      {critical_warnings && critical_warnings.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(230, 57, 70, 0.05)',
          border: '1px solid rgba(230, 57, 70, 0.15)',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <h4 style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: 'var(--color-danger)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            Critical Warnings (Do Not Do)
          </h4>
          <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '0.25rem' }}>
            {critical_warnings.map((warning, idx) => (
              <li key={idx} style={{
                fontSize: '0.8rem',
                color: 'var(--text-main)',
                lineHeight: 1.35,
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start'
              }}>
                <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>✕</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paramedic Checklist */}
      {paramedic_checklist && paramedic_checklist.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Paramedic Information Checklist
          </span>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {paramedic_checklist.map((item, idx) => (
              <div key={idx} style={{
                fontSize: '0.8rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
                color: 'var(--text-muted)',
                lineHeight: 1.45
              }}>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
