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

  return (
    <div className="auth-container auth-bg-animated">
      <div className="auth-card animate-fade">
        <div className="auth-header-wrapper">
          <div className="auth-subtitle">Command Center</div>
          <img src={mallifyLogo} className="auth-logo" alt="Mallify" />
          <p className="auth-desc">Admin Dashboard — Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="auth-label">Email Address</label>
            <input 
              id="login-email" 
              className="auth-input" 
              type="email" 
              placeholder="admin@mallify.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group-spaced">
            <label className="auth-label">Password</label>
            <input 
              id="login-password" 
              className="auth-input" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          {err && (
            <div className="auth-error-box">
              <X size={16} /> {err}
            </div>
          )}
          <button 
            id="login-btn" 
            type="submit" 
            disabled={loading} 
            className="auth-btn-submit"
          >
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="auth-footer-divider">
          <p className="auth-footer-title">New to Mallify? Apply for access</p>
          <div className="auth-grid-2col">
            <Link 
              id="register-mall-btn" 
              to="/register-mall"
              className="auth-register-card-link link-blue"
            >
              <div className="flex-col-center-gap4">
                <Building2 size={22} />
                <span>Register as<br /><strong>Mall Admin</strong></span>
              </div>
            </Link>
            <Link 
              id="register-store-btn" 
              to="/register-store"
              className="auth-register-card-link link-sky"
            >
              <div className="flex-col-center-gap4">
                <Store size={22} />
                <span>Register as<br /><strong>Store Admin</strong></span>
              </div>
            </Link>
          </div>
          <Link 
            to="/activate" 
            className="auth-activate-link"
          >
            Received a code? <strong>Activate Account</strong>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
