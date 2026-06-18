import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Key, Check, X } from 'lucide-react';
import { verifyCode, verifyMallCode } from '../services/api';
import './ActivatePage.css';

function ActivatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [verifyEmail, setVerifyEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [verifyType, setVerifyType] = useState('mall'); // 'mall' or 'store'
  const [isActivated, setIsActivated] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type');
    if (emailParam) setVerifyEmail(emailParam);
    if (typeParam && (typeParam === 'mall' || typeParam === 'store')) {
      setVerifyType(typeParam);
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      if (verifyType === 'mall') {
        await verifyMallCode(verifyEmail, inviteCode);
      } else {
        await verifyCode(verifyEmail, inviteCode);
      }

      setIsActivated(true);
      setErr('');
      setTimeout(() => {
        setIsActivated(false);
        navigate(`/login?email=${encodeURIComponent(verifyEmail)}`);
      }, 3000);
    } catch (err) {
      setErr(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-bg-animated">
      <div className="auth-card animate-fade">
        {isActivated ? (
          <div className="activation-success-container animate-fade">
            <div className="activation-success-icon-box">
              <Check size={48} />
            </div>
            <h2 className="activation-success-title">Account Activated!</h2>
            <p className="activation-success-desc">Your admin access is now active. We are redirecting you to the login screen...</p>
          </div>
        ) : (
          <>
            <button 
              type="button" 
              onClick={() => navigate('/login')} 
              className="auth-back-link"
            >
              ← Back to Login
            </button>
            <div className="activation-header">
              <div className="activation-icon-circle">
                <Key size={32} color="#0ea5e9" />
              </div>
              <h2 className="activation-header-title">Activate Account</h2>
              <p className="activation-header-desc">Enter the code sent to your email to activate your admin access.</p>
            </div>

            <div className="activation-type-toggle">
              <button 
                type="button" 
                onClick={() => setVerifyType('mall')}
                className={`activation-type-btn ${verifyType === 'mall' ? 'active' : ''}`}
              >
                Mall Admin
              </button>
              <button 
                type="button" 
                onClick={() => setVerifyType('store')}
                className={`activation-type-btn ${verifyType === 'store' ? 'active' : ''}`}
              >
                Store Admin
              </button>
            </div>

            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label className="auth-label">Email Address</label>
                <input 
                  className="auth-input" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={verifyEmail} 
                  onChange={e => setVerifyEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group-spaced">
                <label className="auth-label">Invite Code</label>
                <input 
                  className="auth-input invite-code-input" 
                  placeholder="_ _ _ _ _ _" 
                  value={inviteCode} 
                  onChange={e => setInviteCode(e.target.value.toUpperCase())} 
                  required 
                />
              </div>
              {err && (
                <div className="auth-error-box">
                  {err}
                </div>
              )}
              <button 
                type="submit" 
                disabled={loading} 
                className="auth-btn-submit"
              >
                {loading ? 'Activating...' : 'Verify & Activate'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ActivatePage;
