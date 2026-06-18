import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import './PendingPage.css';

function PendingPage() {
  const [searchParams] = useSearchParams();
  const [pendingType, setPendingType] = useState('mall');
  const navigate = useNavigate();

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      setPendingType(typeParam);
    }
  }, [searchParams]);

  const bgStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '28px',
    padding: '48px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 32px 64px -12px rgba(0,0,0,0.1)',
    position: 'relative',
    zIndex: 1
  };

  return (
    <div className="auth-bg-animated" style={bgStyle}>
      <div className="animate-fade" style={cardStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px', 
            boxShadow: '0 0 30px rgba(14,165,233,0.4)' 
          }}>
            <Check size={40} color="white" />
          </div>
          <h2 style={{ color: '#0f172a', fontSize: '26px', fontWeight: '800', marginBottom: '12px' }}>Request Submitted!</h2>
          <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.7, marginBottom: '8px' }}>
            Your {pendingType === 'mall' ? 'Mall Admin' : 'Store Admin'} registration is <strong style={{ color: '#0ea5e9' }}>under review</strong>.
          </p>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7, marginBottom: '32px' }}>
            {pendingType === 'mall'
              ? 'The System Admin will review your documents and approve your request. You\'ll receive an email with your invite code.'
              : 'The Mall Admin will review your request. You\'ll receive an email with your invite code once approved.'}
          </p>
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', 
              color: 'white', 
              border: 'none', 
              padding: '14px 32px', 
              borderRadius: '12px', 
              fontSize: '15px', 
              fontWeight: '700', 
              cursor: 'pointer', 
              width: '100%', 
              boxShadow: '0 8px 24px rgba(14,165,233,0.35)' 
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default PendingPage;
