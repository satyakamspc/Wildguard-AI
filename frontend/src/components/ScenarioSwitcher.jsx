import React, { useState } from 'react';
import { mockScenarios } from '../utils/mockData';

export default function ScenarioSwitcher({ onSelectScenario, activeScenarioId }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 100,
      fontFamily: 'var(--font-heading)'
    }}>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: 'var(--bg-main-start)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(82, 183, 136, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        title="Toggle Demo Scenario Switcher"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 2 7 12 12 22 7 12 2Z"/>
            <polyline points="2 17 12 22 22 17"/>
            <polyline points="2 12 12 17 22 12"/>
          </svg>
        )}
      </button>

      {/* Scenarios Panel */}
      {isOpen && (
        <div className="glass-panel" style={{
          position: 'absolute',
          bottom: '60px',
          right: '0',
          width: '280px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          border: '1px solid rgba(82, 183, 136, 0.25)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
        }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>Demo Scenario Switcher</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Simulate coordinator outputs for testing the frontend details
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
            {Object.values(mockScenarios).map((scenario) => {
              const isActive = activeScenarioId === scenario.id;
              
              return (
                <button
                  key={scenario.id}
                  onClick={() => {
                    onSelectScenario(scenario);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '0.6rem 0.85rem',
                    textAlign: 'left',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? '700' : '500',
                    border: `1px solid ${isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}`,
                    backgroundColor: isActive ? 'rgba(82, 183, 136, 0.12)' : 'rgba(255,255,255,0.02)',
                    color: isActive ? 'var(--primary)' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{scenario.name.split(' (')[0]}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    color: scenario.payload.card_risk.risk_rating === 'Critical' || scenario.payload.card_risk.risk_rating === 'High'
                      ? 'var(--color-danger)'
                      : scenario.payload.card_risk.risk_rating === 'Medium'
                        ? 'var(--color-warning)'
                        : 'var(--color-success)',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}>
                    {scenario.payload.card_risk.risk_rating}
                  </span>
                </button>
              );
            })}

            {/* Simulated Error/Timeout Button */}
            <button
              onClick={() => {
                onSelectScenario({ id: 'error', name: 'API Server Timeout Error' });
                setIsOpen(false);
              }}
              style={{
                padding: '0.6rem 0.85rem',
                textAlign: 'left',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '500',
                border: '1px solid rgba(255,255,255,0.05)',
                backgroundColor: 'rgba(230, 57, 70, 0.04)',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>API Gateway Error</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>504</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
