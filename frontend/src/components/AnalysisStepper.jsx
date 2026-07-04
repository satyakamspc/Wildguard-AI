import React from 'react';

export default function AnalysisStepper({ currentStep }) {
  const steps = [
    {
      id: 1,
      name: "Species Identification",
      agent: "species-agent",
      desc: "Preprocessing image and predicting taxonomic family..."
    },
    {
      id: 2,
      name: "Geographic Verification",
      agent: "verification-agent",
      desc: "Cross-referencing species native ranges with coordinates..."
    },
    {
      id: 3,
      name: "Risk Assessment",
      agent: "risk-agent",
      desc: "Analyzing defense mechanisms, venom toxicity, and aggression..."
    },
    {
      id: 4,
      name: "Emergency First Aid",
      agent: "first-aid-agent",
      desc: "Retrieving verified WHO / Red Cross medical guidelines..."
    },
    {
      id: 5,
      name: "Report Compilation",
      agent: "report-agent",
      desc: "Structuring agent responses into UI-ready payload..."
    }
  ];

  return (
    <div className="glass-panel animate-fade-in-up" style={{
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      minHeight: '400px',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Analyzing Wildlife Threat</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Orchestrating agent workflows sequentially &amp; in parallel
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
        {steps.map((s, idx) => {
          const isCompleted = currentStep > idx;
          const isActive = currentStep === idx;
          const isPending = currentStep < idx;

          return (
            <div
              key={s.id}
              style={{
                display: 'flex',
                gap: '1.25rem',
                opacity: isPending ? 0.35 : 1,
                transform: isActive ? 'scale(1.02)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative'
              }}
            >
              {/* Stepper Line connection */}
              {idx < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '17px',
                  top: '32px',
                  width: '2px',
                  height: 'calc(100% - 14px)',
                  background: isCompleted ? 'var(--primary)' : 'rgba(82, 183, 136, 0.15)',
                  transition: 'background-color 0.4s'
                }} />
              )}

              {/* Status Circle */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isCompleted 
                  ? 'var(--primary)' 
                  : isActive 
                    ? 'rgba(82, 183, 136, 0.1)' 
                    : 'rgba(255, 255, 255, 0.03)',
                border: `2px solid ${
                  isCompleted 
                    ? 'var(--primary)' 
                    : isActive 
                      ? 'var(--primary)' 
                      : 'rgba(255,255,255,0.08)'
                }`,
                boxShadow: isCompleted 
                  ? '0 0 10px rgba(82, 183, 136, 0.4)' 
                  : isActive 
                    ? '0 0 15px rgba(82, 183, 136, 0.2)' 
                    : 'none',
                color: isCompleted ? 'var(--bg-main-start)' : 'var(--text-main)',
                flexShrink: 0,
                fontWeight: 'bold',
                fontSize: '0.85rem',
                position: 'relative',
                zIndex: 2,
                transition: 'all 0.4s'
              }}>
                {isCompleted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : isActive ? (
                  <span className="stepper-ping"></span>
                ) : (
                  s.id
                )}
              </div>

              {/* Text Area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: isActive ? 'var(--primary)' : 'var(--text-main)'
                  }}>
                    {s.name}
                  </h3>
                  <code style={{
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(82, 183, 136, 0.08)',
                    color: 'var(--primary)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(82, 183, 136, 0.15)',
                    fontFamily: 'monospace'
                  }}>
                    {s.agent}
                  </code>
                </div>
                <p style={{
                  fontSize: '0.75rem',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)'
                }}>
                  {isActive ? s.desc : isCompleted ? "Task finished successfully" : "Awaiting orchestrator trigger..."}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* stepper loading glows styling */}
      <style>{`
        .stepper-ping {
          width: 8px;
          height: 8px;
          background-color: var(--primary);
          border-radius: 50%;
          display: inline-block;
          animation: scalePing 1.5s infinite ease-in-out;
        }
        @keyframes scalePing {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
