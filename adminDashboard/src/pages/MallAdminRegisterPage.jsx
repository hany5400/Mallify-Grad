import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CreditCard, X, Building2 } from 'lucide-react';
import { registerMall } from '../services/api';
import './MallAdminRegisterPage.css';

function MallAdminRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [commercialLicense, setCommercialLicense] = useState(null);
  const [identificationDoc, setIdentificationDoc] = useState(null);
  const [licensePrev, setLicensePrev] = useState(null);
  const [idDocPrev, setIdDocPrev] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const licenseRef = useRef(null);
  const idDocRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (setter, prevSetter) => (e) => {
    const f = e.target.files[0];
    if (f) {
      setter(f);
      prevSetter(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }
    if (!commercialLicense || !identificationDoc) {
      setErr("Please upload both documents.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      fd.append('password', password);
      fd.append('commercial_license', commercialLicense);
      fd.append('identification_document', identificationDoc);
      fd.append('mall_name', name);

      await registerMall(fd);
      navigate('/pending?type=mall');
    } catch (err) {
      setErr(err.response?.data?.message || 'Registration failed. Please try again.');
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
    maxWidth: '620px',
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

  const fileBoxStyle = (hasFile) => ({
    width: '100%',
    aspectRatio: '3/2',
    border: `2px dashed ${hasFile ? '#0ea5e9' : 'rgba(0,0,0,0.15)'}`,
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: hasFile ? 'rgba(14,165,233,0.08)' : 'rgba(0,0,0,0.02)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    position: 'relative',
    gap: '8px'
  });

  return (
    <div className="auth-bg-animated" style={bgStyle}>
      <form className="animate-fade" style={cardStyle} onSubmit={handleSubmit}>
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

        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(37,99,235,0.15)', 
            border: '1px solid rgba(37,99,235,0.3)', 
            borderRadius: '20px', 
            padding: '6px 14px', 
            marginBottom: '16px' 
          }}>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '800', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              color: '#2563eb', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}>
              <Building2 size={14} /> Mall Admin Registration
            </span>
          </div>
          <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '800', lineHeight: 1.2 }}>
            Apply for Mall Admin Access
          </h2>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '8px' }}>Fill in your details and upload the required documents.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Mall Name</label>
            <input 
              style={inputStyle} 
              placeholder="e.g. Mall of Arabia" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input 
              style={inputStyle} 
              type="email" 
              placeholder="admin@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input 
              style={inputStyle} 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input 
              style={inputStyle} 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Commercial License</label>
            <input 
              type="file" 
              ref={licenseRef} 
              style={{ display: 'none' }} 
              accept="image/*,.pdf" 
              onChange={handleFileChange(setCommercialLicense, setLicensePrev)} 
            />
            <div style={fileBoxStyle(!!licensePrev)} onClick={() => licenseRef.current?.click()}>
              {licensePrev ? (
                <img src={licensePrev} alt="License" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px', opacity: 0.85 }} />
              ) : (
                <>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={20} color="#2563eb" /></div>
                  <p style={{ color: '#475569', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>Click to upload<br />Commercial License</p>
                </>
              )}
            </div>
          </div>
          <div>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}><CreditCard size={16} /> ID Document</label>
            <input 
              type="file" 
              ref={idDocRef} 
              style={{ display: 'none' }} 
              accept="image/*,.pdf" 
              onChange={handleFileChange(setIdentificationDoc, setIdDocPrev)} 
            />
            <div style={fileBoxStyle(!!idDocPrev)} onClick={() => idDocRef.current?.click()}>
              {idDocPrev ? (
                <img src={idDocPrev} alt="ID" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px', opacity: 0.85 }} />
              ) : (
                <>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CreditCard size={20} color="#0ea5e9" /></div>
                  <p style={{ color: '#475569', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>Click to upload<br />Identification Document</p>
                </>
              )}
            </div>
          </div>
        </div>

        {err && (
          <div style={{ 
            background: 'rgba(239,68,68,0.1)', 
            border: '1px solid rgba(239,68,68,0.3)', 
            borderRadius: '12px', 
            padding: '14px 18px', 
            color: '#ef4444', 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <X size={18} /> {err}
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
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
            color: 'white', 
            fontSize: '16px', 
            fontWeight: '800', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            opacity: loading ? 0.7 : 1, 
            boxShadow: 'rgba(37,99,235,0.35) 0px 8px 24px', 
            transition: 'all 0.3s' 
          }}
        >
          {loading ? 'Submitting...' : 'Submit Mall Admin Application'}
        </button>
      </form>
    </div>
  );
}

export default MallAdminRegisterPage;
