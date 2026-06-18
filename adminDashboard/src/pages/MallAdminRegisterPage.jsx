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

  return (
    <div className="auth-container auth-bg-animated">
      <form className="auth-card-wide animate-fade" onSubmit={handleSubmit}>
        <button 
          type="button" 
          onClick={() => navigate('/login')} 
          className="auth-back-link"
        >
          ← Back to Login
        </button>

        <div className="register-header">
          <div className="register-badge-wrapper">
            <span className="register-badge">
              <Building2 size={14} /> Mall Admin Registration
            </span>
          </div>
          <h2 className="register-title">Apply for Mall Admin Access</h2>
          <p className="register-desc">Fill in your details and upload the required documents.</p>
        </div>

        <div className="form-grid-2col">
          <div>
            <label className="auth-label">Mall Name</label>
            <input 
              className="auth-input" 
              placeholder="e.g. Mall of Arabia" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="auth-label">Email Address</label>
            <input 
              className="auth-input" 
              type="email" 
              placeholder="admin@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="auth-label">Password</label>
            <input 
              className="auth-input" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="auth-label">Confirm Password</label>
            <input 
              className="auth-input" 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="file-upload-grid">
          <div>
            <label className="auth-label file-upload-label"><FileText size={16} /> Commercial License</label>
            <input 
              type="file" 
              ref={licenseRef} 
              style={{ display: 'none' }} 
              accept="image/*,.pdf" 
              onChange={handleFileChange(setCommercialLicense, setLicensePrev)} 
            />
            <div className={`file-box ${licensePrev ? 'has-file' : ''}`} onClick={() => licenseRef.current?.click()}>
              {licensePrev ? (
                <img src={licensePrev} alt="License" className="file-preview-img" />
              ) : (
                <>
                  <div className="file-upload-prompt-icon license-icon">
                    <FileText size={20} color="#2563eb" />
                  </div>
                  <p className="file-upload-prompt-text">Click to upload<br />Commercial License</p>
                </>
              )}
            </div>
          </div>
          <div>
            <label className="auth-label file-upload-label"><CreditCard size={16} /> ID Document</label>
            <input 
              type="file" 
              ref={idDocRef} 
              style={{ display: 'none' }} 
              accept="image/*,.pdf" 
              onChange={handleFileChange(setIdentificationDoc, setIdDocPrev)} 
            />
            <div className={`file-box ${idDocPrev ? 'has-file' : ''}`} onClick={() => idDocRef.current?.click()}>
              {idDocPrev ? (
                <img src={idDocPrev} alt="ID" className="file-preview-img" />
              ) : (
                <>
                  <div className="file-upload-prompt-icon id-icon">
                    <CreditCard size={20} color="#0ea5e9" />
                  </div>
                  <p className="file-upload-prompt-text">Click to upload<br />Identification Document</p>
                </>
              )}
            </div>
          </div>
        </div>

        {err && (
          <div className="auth-error-box">
            <X size={18} /> {err}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="mall-btn-submit"
        >
          {loading ? 'Submitting...' : 'Submit Mall Admin Application'}
        </button>
      </form>
    </div>
  );
}

export default MallAdminRegisterPage;
