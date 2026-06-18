import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Key, Building2, Store, X } from 'lucide-react';
import { login } from '../services/api';
import mallifyLogo from '../assets/mallify-logo.png';
import './LoginPage.css';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const res = await login(email, password);

      if (res.data.requiresActivation) {
        navigate(`/activate?email=${encodeURIComponent(res.data.email)}&type=${encodeURIComponent(res.data.type)}`);
        return;
      }

      if (res.data.requiresWait) {
        navigate(`/pending?type=${encodeURIComponent(res.data.type)}`);
        return;
      }

      if (res.data.token) {
        localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
        localStorage.setItem('admin_token', res.data.token);
        
        if (onLoginSuccess) {
          onLoginSuccess(res.data.token, res.data.admin);
        }

        // Navigate based on role
        const role = res.data.admin.role || (res.data.admin.admin_type === 'system' ? 'system_admin' : (res.data.admin.admin_type === 'mall' ? 'mall_admin' : 'store_admin'));
        if (role === 'system_admin') {
          navigate('/system-admin');
        } else if (role === 'mall_admin') {
          navigate('/mall-admin');
        } else {
          navigate('/store-admin');
        }
      }
    } catch (err) {
      setErr(err.response?.data?.message || 'Login failed. Check your credentials.');
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
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '3px', color: '#0ea5e9', textTransform: 'uppercase', marginBottom: '12px' }}>Command Center</div>
          <img src={mallifyLogo} alt="Mallify" style={{ height: '100px', width: '310px', objectFit: 'contain', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Admin Dashboard — Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email Address</label>
            <input 
              id="login-email" 
              style={inputStyle} 
              type="email" 
              placeholder="admin@mallify.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <input 
              id="login-password" 
              style={inputStyle} 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
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
              marginBottom: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <X size={16} /> {err}
            </div>
          )}
          <button 
            id="login-btn" 
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
              opacity: loading ? 0.7 : 1, 
              boxShadow: '0 8px 24px rgba(14,165,233,0.35)', 
              transition: 'all 0.3s', 
              marginBottom: '24px' 
            }}
          >
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '24px' }}>
          <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', marginBottom: '16px' }}>New to Mallify? Apply for access</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Link 
              id="register-mall-btn" 
              to="/register-mall"
              style={{ 
                padding: '14px', 
                borderRadius: '12px', 
                border: '1.5px solid rgba(37,99,235,0.4)', 
                background: 'rgba(37,99,235,0.04)', 
                color: '#2563eb', 
                cursor: 'pointer', 
                fontSize: '13px', 
                fontWeight: '700', 
                transition: 'all 0.3s',
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Building2 size={22} />
                <span>Register as<br /><strong>Mall Admin</strong></span>
              </div>
            </Link>
            <Link 
              id="register-store-btn" 
              to="/register-store"
              style={{ 
                padding: '14px', 
                borderRadius: '12px', 
                border: '1.5px solid rgba(14,165,233,0.4)', 
                background: 'rgba(14,165,233,0.04)', 
                color: '#0ea5e9', 
                cursor: 'pointer', 
                fontSize: '13px', 
                fontWeight: '700', 
                transition: 'all 0.3s',
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Store size={22} />
                <span>Register as<br /><strong>Store Admin</strong></span>
              </div>
            </Link>
          </div>
          <Link 
            to="/activate" 
            style={{ 
              display: 'block',
              width: '100%', 
              marginTop: '12px', 
              padding: '12px', 
              borderRadius: '12px', 
              border: '1.5px solid rgba(0,0,0,0.1)', 
              background: 'white', 
              color: '#64748b', 
              cursor: 'pointer', 
              fontSize: '13px', 
              fontWeight: '700', 
              transition: 'all 0.3s',
              textDecoration: 'none',
              textAlign: 'center'
            }}
          >
            Received a code? <strong>Activate Account</strong>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
