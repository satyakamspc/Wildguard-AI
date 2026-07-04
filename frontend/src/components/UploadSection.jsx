import React, { useState, useRef } from 'react';

export default function UploadSection({ onStartAnalysis, isAnalyzing }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [description, setDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearImage = (e) => {
    e.stopPropagation();
    setImage(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!image) return;
    
    onStartAnalysis({
      imageFile: image,
      previewUrl: preview,
      user_description: description
    });
  };

  return (
    <section className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Analyze Creature
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Drag & Drop File Container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          style={{
            border: `2px dashed ${isDragOver ? 'var(--primary)' : 'rgba(82, 183, 136, 0.25)'}`,
            borderRadius: '12px',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragOver ? 'rgba(82, 183, 136, 0.05)' : 'rgba(14, 28, 22, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '220px'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {preview ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img
                src={preview}
                alt="Upload preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '180px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid rgba(82, 183, 136, 0.2)'
                }}
              />
              <button
                type="button"
                onClick={clearImage}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-danger)',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}
                title="Remove image"
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div className="animate-pulse-glow" style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(82, 183, 136, 0.08)',
                border: '1px solid rgba(82, 183, 136, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>Drag & drop image here</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  or <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>browse files</span>
                </p>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Supports PNG, JPG, WEBP</p>
            </div>
          )}
        </div>

        {/* Text Description Box */}
        <div className="input-group" style={{ marginBottom: '0.5rem' }}>
          <label className="input-label">Describe Encounter (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            placeholder="e.g. 'I was stung on my hand' or 'Spotted this on the hiking trail, looks like a viper.'"
            className="text-input"
            style={{ resize: 'vertical', minHeight: '80px' }}
            disabled={isAnalyzing}
          />
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          className={`btn ${image ? 'btn-primary' : 'btn-disabled'}`}
          disabled={!image || isAnalyzing}
          style={{ width: '100%', padding: '0.85rem' }}
        >
          {isAnalyzing ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '6px' }} className="animate-spin">
                <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              Analyze Creature
            </>
          )}
        </button>
      </form>
      
      {/* CSS Spin Helper */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </section>
  );
}
