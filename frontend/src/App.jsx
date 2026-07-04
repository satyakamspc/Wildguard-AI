import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import AnalysisStepper from './components/AnalysisStepper';
import ReportDashboard from './components/ReportDashboard';
import ScenarioSwitcher from './components/ScenarioSwitcher';
import { mockScenarios } from './utils/mockData';
import axios from 'axios';

export default function App() {
  const [activeScenarioId, setActiveScenarioId] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [reportPayload, setReportPayload] = useState(null);
  const [error, setError] = useState('');
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);

  // Handle running the simulated multi-agent pipeline
  const runAnalysisPipeline = (targetPayload, imageUrl) => {
    setError('');
    setIsQuotaExhausted(false);
    setReportPayload(null);
    setUploadedImageUrl(imageUrl);
    setIsAnalyzing(true);
    setAnalysisStep(0);
  };

  // Simulate progression of agent checks (SLA simulation)
  useEffect(() => {
    if (!isAnalyzing) return;
    if (!activeScenarioId) return; // Do not run mock simulation for custom uploads

    const interval = setInterval(() => {
      setAnalysisStep((prevStep) => {
        if (prevStep < 4) {
          return prevStep + 1;
        } else {
          clearInterval(interval);
          
          // Complete analysis
          setTimeout(() => {
            setIsAnalyzing(false);
            if (activeScenarioId === 'error') {
              setError("API Gateway Timeout: The orchestrator-agent did not receive a response from the sub-agents within the 3.5-second threshold. Please try uploading again.");
            } else {
              const selectedScenario = mockScenarios[activeScenarioId] || mockScenarios.turtle;
              setReportPayload(selectedScenario.payload);
            }
          }, 400);
          
          return prevStep + 1;
        }
      });
    }, 550); // Takes ~2.7 seconds total to cycle through 5 steps, meeting the 3.5s SLA check

    return () => clearInterval(interval);
  }, [isAnalyzing, activeScenarioId]);

  // Handle custom upload submissions
  const handleCustomUpload = async (data) => {
    setActiveScenarioId('');
    setError('');
    setIsQuotaExhausted(false);
    setReportPayload(null);
    setUploadedImageUrl(data.previewUrl);
    setIsAnalyzing(true);
    setAnalysisStep(0);

    const formData = new FormData();
    formData.append('image', data.imageFile);
    formData.append('user_description', data.user_description || '');

    // Increment analysis steps during the network request lifecycle
    const stepsInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 600);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/analyze/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(stepsInterval);
      setAnalysisStep(5); // Complete progress

      setTimeout(() => {
        setIsAnalyzing(false);
        if (response.data && response.data.status === 'success') {
          setReportPayload(response.data.data);
          if (response.data.data.image_url) {
            setUploadedImageUrl(`http://127.0.0.1:8000${response.data.data.image_url}`);
          }
        } else {
          setError(response.data.message || 'Workflow orchestration failed.');
        }
      }, 400);

    } catch (err) {
      clearInterval(stepsInterval);
      setIsAnalyzing(false);
      const errMsg = err.response?.data?.message || err.message || 'API request failed';
      const isQuota =
        err.response?.status === 429 ||
        err.response?.status === 402 ||
        /quota|rate.?limit|resource.?exhausted|too.?many.?requests/i.test(errMsg);
      if (isQuota) {
        setIsQuotaExhausted(true);
      } else {
        setError(errMsg);
      }
    }
  };

  // Handle floating switcher selections
  const handleScenarioSelect = (scenario) => {
    setActiveScenarioId(scenario.id);
    if (scenario.id === 'error') {
      runAnalysisPipeline(null, "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=600");
    } else {
      runAnalysisPipeline(scenario.payload, scenario.imageUrl);
    }
  };

  const handleReset = () => {
    setActiveScenarioId('');
    setUploadedImageUrl('');
    setReportPayload(null);
    setError('');
    setIsQuotaExhausted(false);
  };

  return (
    <div className="container">
      <Header />

      <main className="main-grid">
        {/* Left Hand: Controller & Input Form */}
        <UploadSection onStartAnalysis={handleCustomUpload} isAnalyzing={isAnalyzing} />

        {/* Right Hand: Dynamic Output Panel */}
        <div style={{ minHeight: '400px' }}>
          {isAnalyzing ? (
            <AnalysisStepper currentStep={analysisStep} />
          ) : isQuotaExhausted ? (
            /* Quota Exhausted Panel */
            <div className="glass-panel animate-fade-in-up" style={{
              padding: '2.5rem 2rem',
              borderLeft: '4px solid var(--color-warning)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              textAlign: 'center',
              backgroundColor: 'rgba(244, 162, 97, 0.04)',
              boxShadow: 'var(--shadow-glow), 0 0 20px rgba(244, 162, 97, 0.08)'
            }}>
              {/* Icon */}
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: 'rgba(244, 162, 97, 0.1)',
                border: '1px solid rgba(244, 162, 97, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 18px rgba(244, 162, 97, 0.15)'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                </svg>
              </div>

              {/* Title & Badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  backgroundColor: 'rgba(244, 162, 97, 0.12)',
                  border: '1px solid rgba(244, 162, 97, 0.25)',
                  color: 'var(--color-warning)',
                  padding: '3px 10px',
                  borderRadius: '20px'
                }}>
                  API Quota Exhausted
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  AI Analysis Unavailable
                </h3>
              </div>

              {/* Details */}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '420px' }}>
                The AI model API quota for this session has been exhausted. The system has consumed its allocated request budget and cannot process new analyses at this time.
              </p>

              {/* Info Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                width: '100%',
                maxWidth: '400px'
              }}>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  textAlign: 'left'
                }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-warning)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>What happened?</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>The AI provider returned a rate-limit or quota error (HTTP 429). Daily or per-minute limits have been reached.</p>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  textAlign: 'left'
                }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>What to do?</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>Wait a few minutes and try again, or use the demo scenario switcher below.</p>
                </div>
              </div>

              {/* Demo Mode Notice */}
              <div style={{
                backgroundColor: 'rgba(82, 183, 136, 0.04)',
                border: '1px solid rgba(82, 183, 136, 0.12)',
                borderRadius: '10px',
                padding: '0.85rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                maxWidth: '400px',
                textAlign: 'left'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="8"/>
                  <line x1="12" y1="12" x2="12" y2="16"/>
                </svg>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--primary)' }}>Tip:</strong> Use the <strong style={{ color: 'var(--text-main)' }}>Demo Scenario Switcher</strong> (floating button, bottom-right) to explore animal analyses without API calls.
                </p>
              </div>

              <button
                onClick={handleReset}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                Try Again
              </button>
            </div>
          ) : error ? (
            <div className="glass-panel animate-fade-in-up" style={{
              padding: '2.5rem 2rem',
              borderLeft: '4px solid var(--color-danger)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(230, 57, 70, 0.08)',
                border: '1px solid rgba(230, 57, 70, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2.5">
                  <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-danger)' }}>Pipeline Processing Error</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.5, maxWidth: '460px' }}>
                  {error}
                </p>
              </div>
              <button onClick={handleReset} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Reset Pipeline
              </button>
            </div>
          ) : reportPayload ? (
            <ReportDashboard
              payload={reportPayload}
              uploadedImageUrl={uploadedImageUrl}
              onReset={handleReset}
            />
          ) : (
            /* Empty State: Awaiting Input */
            <div className="glass-panel" style={{
              height: '100%',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 2rem',
              textAlign: 'center',
              gap: '1.5rem'
            }}>
              <div className="animate-radar" style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '1px dashed rgba(82, 183, 136, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {/* Secondary radar ring */}
                <div style={{
                  position: 'absolute',
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  border: '1px dashed rgba(82, 183, 136, 0.15)'
                }} />
                
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                </svg>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '360px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Awaiting Creature Analysis</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Upload a photo of an animal, reptile, or insect. Our multi-agent system will identify the species, evaluate risk ratings, and compile medical precautions.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Scenario Switcher */}
      <ScenarioSwitcher
        onSelectScenario={handleScenarioSelect}
        activeScenarioId={activeScenarioId}
      />
    </div>
  );
}
