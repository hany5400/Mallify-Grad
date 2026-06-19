import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CreditCard, X, Store, Search, Building2 } from 'lucide-react';
import { registerStore, getMalls } from '../services/api';
import './StoreAdminRegisterPage.css';
import '../components/Modal.css';

function StoreAdminRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mallId, setMallId] = useState('');
  const [malls, setMalls] = useState([]);
  const [mallSearch, setMallSearch] = useState('');
  const [showMallList, setShowMallList] = useState(false);
  const [commercialLicense, setCommercialLicense] = useState(null);
  const [identificationDoc, setIdentificationDoc] = useState(null);
  const [licensePrev, setLicensePrev] = useState(null);
  const [idDocPrev, setIdDocPrev] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const licenseRef = useRef(null);
  const idDocRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load malls list for selection
    getMalls()
      .then(res => {
        setMalls(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error("Failed to fetch malls list", err);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.target-mall-container') && !event.target.closest('.dropdown-search-list')) {
        setShowMallList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showMallList) {
      const selectedMall = malls.find(m => String(m.id) === String(mallId));
      if (selectedMall) {
        setMallSearch(selectedMall.mall_name);
      } else {
        setMallSearch('');
      }
    }
  }, [showMallList, mallId, malls]);

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
    if (!mallId) {
      setErr("Please select a valid target mall from the dropdown.");
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
      fd.append('store_name', name);
      fd.append('mall_id', mallId);

      await registerStore(fd);
      navigate('/pending?type=store');
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
              <Store size={14} /> Store Admin Registration
            </span>
          </div>
          <h2 className="register-title">
            Apply for Store Admin Access
          </h2>
          <p className="register-desc">Fill in your details and upload the required documents.</p>
        </div>

        <div className="form-grid-2col">
          <div>
            <label className="auth-label">Store Name</label>
            <input 
              className="auth-input" 
              placeholder="e.g. Nike Store" 
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

        <div className="target-mall-container">
          <label className="auth-label">Select Target Mall</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} className="search-icon-absolute" />
            <input 
              type="text" 
              placeholder="Choose a mall..." 
              value={mallSearch}
              onFocus={() => setShowMallList(true)}
              onChange={(e) => {
                setMallSearch(e.target.value);
                setShowMallList(true);
                const exactMatch = malls.find(m => m.mall_name.toLowerCase() === e.target.value.toLowerCase());
                setMallId(exactMatch ? exactMatch.id : '');
              }}
              className="auth-input input-search-padding"
            />
          </div>
          {showMallList && (
            <div className="dropdown-search-list animate-fade">
              {malls.filter(m => (m.mall_name || '').toLowerCase().includes((mallSearch || '').toLowerCase())).map(m => (
                <div 
                  key={m.id} 
                  className={`dropdown-item ${mallId === m.id ? 'selected' : ''}`}
                  onClick={() => {
                    setMallId(m.id);
                    setMallSearch(m.mall_name);
                    setShowMallList(false);
                  }}
                >
                  <Building2 size={14} />
                  <span>{m.mall_name}</span>
                </div>
              ))}
              {malls.filter(m => (m.mall_name || '').toLowerCase().includes((mallSearch || '').toLowerCase())).length === 0 && (
                <div style={{ padding: '12px 16px', color: '#64748b', fontSize: '14px' }}>No malls found</div>
              )}
            </div>
          )}
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
                  <div className="file-upload-prompt-icon license-icon"><FileText size={20} color="#2563eb" /></div>
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
                  <div className="file-upload-prompt-icon id-icon"><CreditCard size={20} color="#0ea5e9" /></div>
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
          className="store-btn-submit"
        >
          {loading ? 'Submitting...' : 'Submit Store Admin Application'}
        </button>
      </form>
    </div>
  );
}

export default StoreAdminRegisterPage;
