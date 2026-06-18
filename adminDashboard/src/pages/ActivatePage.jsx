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

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1.5px solid rgba(0,0,0,0.1)',
    background: '#f8fafc',
    color: '#0f172a',
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'Outfit, sans-serif',
    transition: 'border-color 0.2s',
    fontWeight: '500'
  };

  const labelStyle = {
    display: 'block',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <div className="auth-bg-animated" style={bgStyle}>
      <div className="animate-fade" style={cardStyle}>
        {isActivated ? (
          <div className="animate-fade" style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={48} />
            </div>
            <h2 style={{ color: '#0f172a', fontSize: '26px', fontWeight: '800', marginBottom: '12px' }}>Account Activated!</h2>
            <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.6 }}>Your admin access is now active. We are redirecting you to the login screen...</p>
          </div>
        ) : (
          <>
            <button 
              type="button" 
              onClick={() => navigate('/login')} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#64748b', 
                cursor: 'pointer', 
                fontSize: '13px', 
                fontWeight: '600', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                marginBottom: '24px', 
                padding: 0 
              }}
            >
              ← Back to Login
            </button>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Key size={32} color="#0ea5e9" />
              </div>
              <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '800' }}>Activate Account</h2>
              <p style={{ color: '#475569', fontSize: '14px', marginTop: '8px' }}>Enter the code sent to your email to activate your admin access.</p>
            </div>

            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
              <button 
                type="button" 
                onClick={() => setVerifyType('mall')}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  borderRadius: '10px', 
                  border: 'none', 
                  background: verifyType === 'mall' ? 'white' : 'transparent', 
                  color: verifyType === 'mall' ? '#0f172a' : '#64748b', 
                  fontSize: '13px', 
                  fontWeight: '700', 
                  cursor: 'pointer', 
                  boxShadow: verifyType === 'mall' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', 
                  transition: 'all 0.2s' 
                }}
              >
                Mall Admin
              </button>
              <button 
                type="button" 
                onClick={() => setVerifyType('store')}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  borderRadius: '10px', 
                  border: 'none', 
                  background: verifyType === 'store' ? 'white' : 'transparent', 
                  color: verifyType === 'store' ? '#0f172a' : '#64748b', 
                  fontSize: '13px', 
                  fontWeight: '700', 
                  cursor: 'pointer', 
                  boxShadow: verifyType === 'store' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', 
                  transition: 'all 0.2s' 
                }}
              >
                Store Admin
              </button>
            </div>

            <form onSubmit={handleVerify}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email Address</label>
                <input 
                  style={inputStyle} 
                  type="email" 
                  placeholder="your@email.com" 
                  value={verifyEmail} 
                  onChange={e => setVerifyEmail(e.target.value)} 
                  required 
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Invite Code</label>
                <input 
                  style={{ 
                    ...inputStyle, 
                    textAlign: 'center', 
                    letterSpacing: '8px', 
                    fontSize: '24px', 
                    fontWeight: '900' 
                  }} 
                  placeholder="_ _ _ _ _ _" 
                  value={inviteCode} 
                  onChange={e => setInviteCode(e.target.value.toUpperCase())} 
                  required 
                />
              </div>
              {err && (
                <div style={{ 
                  background: 'rgba(239,68,68,0.1)', 
                  border: '1px solid rgba(239,68,68,0.3)', 
                  borderRadius: '10px', 
                  padding: '12px 16px', 
                  color: '#ef4444', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  marginBottom: '20px' 
                }}>
                  {err}
                </div>
              )}
              <button 
                type="submit" 
                disabled={loading} 
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  borderRadius: '14px', 
                  border: 'none', 
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', 
                  color: 'white', 
                  fontSize: '16px', 
                  fontWeight: '800', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  opacity: loading ? 0.7 : 1 
                }}
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
