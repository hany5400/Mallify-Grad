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

  return (
    <div className="auth-container auth-bg-animated">
      <div className="auth-card animate-fade">
        <div className="pending-success-container">
          <div className="pending-icon-circle">
            <Check size={40} color="white" />
          </div>
          <h2 className="pending-title">Request Submitted!</h2>
          <p className="pending-text">
            Your {pendingType === 'mall' ? 'Mall Admin' : 'Store Admin'} registration is <strong className="pending-highlight">under review</strong>.
          </p>
          <p className="pending-desc">
            {pendingType === 'mall'
              ? 'The System Admin will review your documents and approve your request. You\'ll receive an email with your invite code.'
              : 'The Mall Admin will review your request. You\'ll receive an email with your invite code once approved.'}
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="pending-back-btn"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default PendingPage;
