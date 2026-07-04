import React from 'react';

export default function SpeciesCard({ data, uploadedImageUrl }) {
  const { common_name, scientific_name, confidence, image_quality_check } = data;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className="glass-panel animate-fade-in-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"/>
            <path d="M12 10v4"/>
            <path d="M12 18h.01"/>
          </svg>
          Identification
        </h3>
        
        {image_quality_check.passes ? (
          <span style={{
            fontSize: '0.75rem',
            backgroundColor: 'rgba(42, 157, 143, 0.1)',
            border: '1px solid rgba(42, 157, 143, 0.25)',
            color: 'var(--color-success)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 600
          }}>
            ✓ Quality Check Passed
          </span>
        ) : (
          <span style={{
            fontSize: '0.75rem',
            backgroundColor: 'rgba(230, 57, 70, 0.1)',
            border: '1px solid rgba(230, 57, 70, 0.25)',
            color: 'var(--color-danger)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 600
          }}>
            ⚠ Quality Issue
          </span>
        )}
      </div>

      {/* Picture & Info Flex Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1.25rem',
        alignItems: 'center'
      }}>
        {uploadedImageUrl && (
          <div style={{
            position: 'relative',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            height: '160px',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={uploadedImageUrl}
              alt={common_name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {/* Visual overlay for dark theme consistency */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              background: 'linear-gradient(to top, rgba(11,19,15,0.85), transparent)',
              padding: '8px 12px'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#fff', opacity: 0.8 }}>Uploaded Image Target</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {common_name}
            </h4>
            <p style={{
              fontSize: '0.9rem',
              fontStyle: 'italic',
              color: 'var(--text-muted)',
              marginTop: '0.15rem'
            }}>
              {scientific_name}
            </p>
          </div>

          {/* Confidence Score Bar */}
          <div style={{ marginTop: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Identification Confidence</span>
              <span style={{ color: 'var(--primary)' }}>{confidencePercent}%</span>
            </div>
            
            <div style={{
              height: '8px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.02)'
            }}>
              <div style={{
                width: `${confidencePercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary), var(--primary-hover))',
                boxShadow: '0 0 8px rgba(82, 183, 136, 0.4)',
                borderRadius: '4px',
                transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
              }} />
            </div>
          </div>

          {!image_quality_check.passes && (
            <div style={{
              backgroundColor: 'rgba(230, 57, 70, 0.08)',
              border: '1px solid rgba(230, 57, 70, 0.15)',
              borderRadius: '8px',
              padding: '0.75rem',
              marginTop: '0.25rem',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <h5 style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-danger)' }}>Quality Warning</h5>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{image_quality_check.issue}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
