import React, { useState, useEffect, useRef } from 'react';
import { X, Shield, Plus, Store, Package, Tag, Search, CheckCircle, Shirt } from 'lucide-react';
import api, { API_BASE } from '../services/api.js';

function Modal({ tab, item, onClose, refresh, user }) {
  const [formData, setFormData] = useState(item || {});
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(item?.image_url ? `${API_BASE}/${item.image_url}` : null);
  const [ownedStores, setOwnedStores] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if ((tab === 'products' || tab === 'discounts') && user?.role === 'store_admin') {
      const fetchOwnedStores = async () => {
        try {
          const res = await api.get('/store');
          setOwnedStores(res.data);
          if (res.data.length > 0 && !formData.store_id) {
            setFormData(prev => ({ ...prev, store_id: res.data[0].id }));
          }
        } catch (err) {
          console.error("Failed to fetch stores:", err);
        }
      };
      fetchOwnedStores();
    }
  }, [tab, user]);

  const [productList, setProductList] = useState([]);
  const [targetCategories, setTargetCategories] = useState([]);
  const [selectedTargets, setSelectedTargets] = useState(item?.targets || []);
  const [currentTarget, setCurrentTarget] = useState({ product_id: '', product_category_id: '' });
  const [productSearch, setProductSearch] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [tierSearch, setTierSearch] = useState('');
  const [showTierList, setShowTierList] = useState(false);
  const [sizeSearch, setSizeSearch] = useState('');
  const [showSizeList, setShowSizeList] = useState(false);
  const [parentSearch, setParentSearch] = useState('');
  const [showParentList, setShowParentList] = useState(false);
  const modalContentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close lists if clicking anywhere that isn't an input or a dropdown item
      if (!event.target.closest('.form-group') && !event.target.closest('.dropdown-search-list')) {
        setShowProductList(false);
        setShowCategoryList(false);
        setShowTierList(false);
        setShowSizeList(false);
        setShowParentList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (tab === 'discounts' || tab === 'product-categories') {
      api.get('/product')
        .then(res => setProductList(res.data))
        .catch(err => console.error(err));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'discounts' && currentTarget.product_id) {
      api.get(`/productCategory?product_id=${currentTarget.product_id}&skipDiscounted=true`)
        .then(res => setTargetCategories(res.data))
        .catch(err => console.error(err));
    } else {
      setTargetCategories([]);
    }
  }, [currentTarget.product_id, tab]);

  const addTarget = () => {
    if (!currentTarget.product_id) return;
    const prod = productList.find(p => String(p.id) === String(currentTarget.product_id));
    const cat = targetCategories.find(c => String(c.id) === String(currentTarget.product_category_id));
    
    const newTarget = {
      product_id: currentTarget.product_id,
      product_category_id: currentTarget.product_category_id || null,
      product_name: prod?.product_name || 'Selected Product',
      category_name: cat ? `${cat.product_category_name} (${cat.size})` : 'All Types/Sizes'
    };
    
    setSelectedTargets([...selectedTargets, newTarget]);
    setCurrentTarget({ product_id: '', product_category_id: '' });
  };

  const removeTarget = (idx) => {
    setSelectedTargets(selectedTargets.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (tab === 'malls') {
        const data = new FormData();
        if (formData.mall_name) data.append('mall_name', formData.mall_name);
        if (file) data.append('image_url', file);
        if (item) await api.put(`/mall/${item.id}`, data);
        else await api.post('/mall', data);
      }
      else if (tab === 'stores') {
        const data = new FormData();
        if (formData.store_name) data.append('store_name', formData.store_name);

        const loc = formData.store_location || formData.location;
        if (loc) data.append('location', loc);

        if (formData.brand_tier) data.append('brand_tier', formData.brand_tier);
        else if (!item) data.append('brand_tier', 'Local'); // Only default for NEW stores

        if (file) {
          data.append('image_url', file);
        }

        if (item) await api.put(`/store/${item.id}`, data);
        else await api.post('/store', data);
      }

      else if (tab === 'products') {
        const data = new FormData();
        if (formData.product_name) data.append('product_name', formData.product_name);
        if (file) data.append('image_url', file);
        if (formData.store_id) data.append('store_id', formData.store_id);

        if (item) await api.put(`/product/${item.id}`, data);
        else await api.post('/product', data);
      }
      else if (tab === 'product-categories') {
        const data = new FormData();
        if (formData.product_category_name) data.append('product_category_name', formData.product_category_name);
        if (formData.size) data.append('size', formData.size);
        if (formData.price) data.append('price', formData.price);
        if (formData.product_id) data.append('product_id', formData.product_id);
        if (file) data.append('image_url', file);

        if (item) await api.put(`/productCategory/${item.id}`, data);
        else await api.post('/productCategory', data);
      }

      else if (tab === 'discounts') {
        const payload = {
          title: formData.title,
          amount: formData.amount,
          expiry_date: formData.expiry_date,
          store_id: formData.store_id || (ownedStores.length > 0 ? ownedStores[0].id : 1),
          targets: selectedTargets.map(t => ({ 
            product_id: t.product_id, 
            product_category_id: t.product_category_id 
          }))
        };
        
        if (item) await api.put(`/discount/${item.id}`, payload);
        else await api.post('/discount', payload);
      }
      else if (['mall-admins', 'store-admins', 'mall-overview', 'store-overview'].includes(tab)) {
        const adminType = (tab === 'mall-admins' || tab === 'mall-overview') ? 'mall' : 'store';
        await api.post('/admins', { ...formData, admin_type: adminType });
      }
      refresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <div className="modal-overlay">
      <form ref={modalContentRef} className="modal-content animate-fade" onSubmit={handleSubmit} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="panel-header" style={{ marginBottom: '24px' }}>
          <h2>{item ? 'Manage' : 'Create'} {tab.replace('-', ' ')}</h2>
        </div>

        {tab === 'discounts' && !item && (
          <div className="animate-fade" style={{ 
            background: 'linear-gradient(to right, #fffbeb, #fef3c7)', 
            padding: '16px 20px', 
            borderRadius: '16px', 
            border: '1px solid #fde68a', 
            marginBottom: '28px',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '12px', border: '1px solid #fde68a' }}>
              <Shield size={22} style={{ color: '#d97706', display: 'block' }} />
            </div>
            <div style={{ fontSize: '14px', color: '#92400e', lineHeight: '1.6' }}>
              <strong style={{ display: 'block', marginBottom: '2px', fontSize: '15px' }}>Immutability Policy</strong>
              Once this discount is saved, its details <strong>cannot be modified</strong>. Please verify the amount and targets carefully.
            </div>
          </div>
        )}

        {error && (
          <div className="modal-error animate-fade">
            <X size={18} onClick={() => setError(null)} style={{ cursor: 'pointer' }} />
            <span>{error}</span>
          </div>
        )}


        {tab === 'malls' && (
          <>
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label>Mall Visual Identity</label>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*"
              />
              <div className="file-upload-box" onClick={() => fileInputRef.current?.click()}>
                {previewUrl ? (
                  <>
                    <img src={previewUrl} className="image-preview" alt="Preview" />
                    <div className="preview-overlay">Change Image</div>
                  </>
                ) : (
                  <>
                    <div className="plus-icon"><Plus size={24} /></div>
                    <p>Click to upload mall logo or photo</p>
                  </>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Mall Official Name</label>
              <input
                type="text"
                placeholder="e.g. Grand Mall Plaza"
                value={formData.mall_name || ''}
                onChange={(e) => setFormData({ ...formData, mall_name: e.target.value })}
                required
              />
            </div>
          </>
        )}

        {['stores', 'products'].includes(tab) && (
          <>
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label>{tab === 'stores' ? 'Store Visual Identity' : 'Product Photo'}</label>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
              <div className="file-upload-box" onClick={() => fileInputRef.current?.click()}>
                {previewUrl ? (
                  <>
                    <img src={previewUrl} className="image-preview" alt="Preview" />
                    <div className="preview-overlay">Change Image</div>
                  </>
                ) : (
                  <>
                    <div className="plus-icon"><Plus size={24} /></div>
                    <p>Click to upload {tab === 'stores' ? 'store logo' : 'product image'}</p>
                  </>
                )}
              </div>
            </div>

            {tab === 'stores' && (
              <>
                <div className="form-group">
                  <label>Store Official Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Nike Flagship Store"
                    value={formData.store_name || ''}
                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Store Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Floor 1, Unit 102"
                    value={formData.store_location || formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, store_location: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Brand Tier</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      placeholder="Search or select tier..." 
                      value={tierSearch || formData.brand_tier || ''}
                      onFocus={() => setShowTierList(true)}
                      onChange={(e) => {
                        setTierSearch(e.target.value);
                        setShowTierList(true);
                      }}
                      style={{ paddingLeft: '35px' }}
                    />
                  </div>
                  {showTierList && (
                    <div className="dropdown-search-list animate-fade">
                      {['High-end', 'Mid-tier', 'Local'].filter(t => t.toLowerCase().includes((tierSearch || '').toLowerCase())).map(t => (
                        <div 
                          key={t} 
                          className={`dropdown-item ${formData.brand_tier === t ? 'selected' : ''}`}
                          onClick={() => {
                            setFormData({ ...formData, brand_tier: t });
                            setTierSearch(t);
                            setShowTierList(false);
                          }}
                        >
                          <Shield size={14} />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'products' && (
          <>
            {user?.role === 'store_admin' && (
              <div className="form-group">
                <label>Assigned Store</label>
                {ownedStores.length === 1 ? (
                  <div className="info-card" style={{
                    padding: '14px',
                    background: 'linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%)',
                    borderRadius: '12px',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)',
                      color: 'white',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                    }}>
                      <Store size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', opacity: 0.6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Store</div>
                      <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '15px' }}>{ownedStores[0].store_name}</div>
                    </div>
                  </div>
                ) : (
                  <select
                    value={formData.store_id || ''}
                    onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select a store</option>
                    {ownedStores.map(s => (
                      <option key={s.id} value={s.id}>{s.store_name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                placeholder="e.g. Air Jordan 1 Retro"
                value={formData.product_name || ''}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                required
              />
            </div>
          </>
        )}



        {tab === 'product-categories' && (
          <>
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label>Category Visual Identity</label>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
              <div className="file-upload-box" onClick={() => fileInputRef.current?.click()}>
                {previewUrl ? (
                  <>
                    <img src={previewUrl} className="image-preview" alt="Preview" />
                    <div className="preview-overlay">Change Image</div>
                  </>
                ) : (
                  <>
                    <div className="plus-icon"><Plus size={24} /></div>
                    <p>Click to upload category photo</p>
                  </>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Category Name (e.g. Slim Jeans)</label>
              <input type="text" value={formData.product_category_name || ''} onChange={(e) => setFormData({ ...formData, product_category_name: e.target.value })} required />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label>Size</label>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Select size..." 
                  value={sizeSearch || formData.size || ''}
                  onFocus={() => setShowSizeList(true)}
                  onChange={(e) => {
                    setSizeSearch(e.target.value);
                    setShowSizeList(true);
                  }}
                  style={{ paddingLeft: '35px' }}
                />
              </div>
              {showSizeList && (
                <div className="dropdown-search-list animate-fade">
                  {['small', 'medium', 'large', 'x-large'].filter(s => s.toLowerCase().includes((sizeSearch || '').toLowerCase())).map(s => (
                    <div 
                      key={s} 
                      className={`dropdown-item ${formData.size === s ? 'selected' : ''}`}
                      onClick={() => {
                        setFormData({ ...formData, size: s });
                        setSizeSearch(s);
                        setShowSizeList(false);
                      }}
                    >
                      <Shirt size={14} />
                      <span style={{ textTransform: 'capitalize' }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input type="number" value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label>Parent Product</label>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search parent product..." 
                  value={parentSearch || (productList.find(p => String(p.id) === String(formData.product_id))?.product_name || '')}
                  onFocus={() => setShowParentList(true)}
                  onChange={(e) => {
                    setParentSearch(e.target.value);
                    setShowParentList(true);
                  }}
                  style={{ paddingLeft: '35px' }}
                />
              </div>
              {showParentList && (
                <div className="dropdown-search-list animate-fade">
                  {productList.filter(p => (p.product_name || '').toLowerCase().includes((parentSearch || '').toLowerCase())).map(p => (
                    <div 
                      key={p.id} 
                      className={`dropdown-item ${String(formData.product_id) === String(p.id) ? 'selected' : ''}`}
                      onClick={() => {
                        setFormData({ ...formData, product_id: p.id });
                        setParentSearch(p.product_name);
                        setShowParentList(false);
                      }}
                    >
                      <Package size={14} />
                      <span>{p.product_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}



        {tab === 'discounts' && (
          <>
            <div className="form-group">
              <label>Discount Title</label>
              <input 
                type="text" 
                placeholder="e.g. Summer Flash Sale" 
                value={formData.title || ''} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                required 
                disabled={!!item}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Discount Amount (%)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    min="1" 
                    max="100" 
                    placeholder="20"
                    value={formData.amount || ''} 
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                    required 
                    disabled={!!item}
                    style={{ paddingRight: '40px' }}
                  />
                  <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: 'var(--text-muted)' }}>%</div>
                </div>
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input 
                  type="date" 
                  value={formData.expiry_date || ''} 
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} 
                  required 
                  disabled={!!item}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '20px', padding: '24px', background: '#fcfcfd', borderRadius: '20px', border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--primary)', fontSize: '15px', fontWeight: '700' }}>
                <Tag size={18} /> Discount Targets
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ fontSize: '12px', marginBottom: '6px', display: 'block', fontWeight: '600', color: '#64748b' }}>Search Product</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      placeholder="Type product name..." 
                      value={productSearch}
                      onFocus={() => setShowProductList(true)}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowProductList(true);
                      }}
                      style={{ paddingLeft: '35px' }}
                    />
                  </div>
                  
                  {showProductList && (
                    <div className="dropdown-search-list animate-fade">
                      {productList.filter(p => (p.product_name || '').toLowerCase().includes((productSearch || '').toLowerCase())).map(p => (
                        <div 
                          key={p.id} 
                          className={`dropdown-item ${currentTarget.product_id === String(p.id) ? 'selected' : ''}`}
                          onClick={() => {
                            setCurrentTarget({ ...currentTarget, product_id: String(p.id), product_category_id: '' });
                            setProductSearch(p.product_name);
                            setShowProductList(false);
                          }}
                        >
                          <Package size={14} />
                          <span>{p.product_name}</span>
                        </div>
                      ))}
                      {productList.filter(p => (p.product_name || '').toLowerCase().includes((productSearch || '').toLowerCase())).length === 0 && (
                        <div style={{ padding: '12px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>No products found</div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <label style={{ fontSize: '12px', marginBottom: '6px', display: 'block', fontWeight: '600', color: '#64748b' }}>Specific Type (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      placeholder={currentTarget.product_id ? "Search types/sizes..." : "Select product first"}
                      value={categorySearch}
                      onFocus={() => setShowCategoryList(true)}
                      onChange={(e) => {
                        setCategorySearch(e.target.value);
                        setShowCategoryList(true);
                      }}
                      disabled={!currentTarget.product_id}
                      style={{ paddingLeft: '35px' }}
                    />
                  </div>

                  {showCategoryList && currentTarget.product_id && (
                    <div className="dropdown-search-list animate-fade">
                      {selectedTargets.some(st => String(st.product_id) === String(currentTarget.product_id) && !st.product_category_id) ? (
                        <div style={{ padding: '12px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>All types already selected for this product</div>
                      ) : (
                        <>
                          <div 
                            className={`dropdown-item ${!currentTarget.product_category_id ? 'selected' : ''}`}
                            onClick={() => {
                              setCurrentTarget({ ...currentTarget, product_category_id: '' });
                              setCategorySearch('Apply to all types');
                              setShowCategoryList(false);
                            }}
                          >
                            <CheckCircle size={14} />
                            <span>Apply to all types</span>
                          </div>
                          {targetCategories
                            .filter(c => (c.product_category_name || '').toLowerCase().includes((categorySearch || '').toLowerCase()))
                            .filter(c => !selectedTargets.some(st => String(st.product_category_id) === String(c.id)))
                            .map(c => (
                            <div 
                              key={c.id} 
                              className={`dropdown-item ${currentTarget.product_category_id === String(c.id) ? 'selected' : ''}`}
                              onClick={() => {
                                setCurrentTarget({ ...currentTarget, product_category_id: String(c.id) });
                                setCategorySearch(`${c.product_category_name} (${c.size})`);
                                setShowCategoryList(false);
                              }}
                            >
                              <Plus size={14} />
                              <span>{c.product_category_name} <small style={{ opacity: 0.6 }}>({c.size})</small></span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {!item && (
                <>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    style={{ 
                      width: '100%', 
                      marginTop: '16px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px',
                      opacity: selectedTargets.length >= 3 ? 0.5 : 1,
                      cursor: selectedTargets.length >= 3 ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => {
                      if (selectedTargets.length >= 3) return;
                      addTarget();
                      setProductSearch('');
                      setCategorySearch('');
                    }} 
                    disabled={!currentTarget.product_id || selectedTargets.length >= 3}
                  >
                    <Plus size={20} /> Add to Selection
                  </button>
                  {selectedTargets.length >= 3 && (
                    <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '8px', textAlign: 'center', fontWeight: '600' }}>
                      Maximum 3 items allowed per discount.
                    </div>
                  )}
                </>
              )}

              {selectedTargets.length > 0 && (
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px', letterSpacing: '0.5px' }}>Selected Items ({selectedTargets.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedTargets.map((t, i) => (
                      <div key={i} className="target-selection-card animate-fade">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={18} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', lineHeight: '1.2' }}>{t.product_name}</span>
                            <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{t.category_name}</span>
                          </div>
                        </div>
                        {(!item || tab !== 'discounts') && (
                          <button type="button" className="btn btn-reject" style={{ padding: '8px', minHeight: 'auto', borderRadius: '8px' }} onClick={() => removeTarget(i)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {['mall-admins', 'store-admins', 'mall-overview', 'store-overview'].includes(tab) && (
          <>
            <div className="form-group"><label>Full Name</label><input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="form-group"><label>Email Address</label><input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
            {!item && <div className="form-group"><label>Password</label><input type="password" value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required /></div>}
          </>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
            {tab === 'discounts' && item ? 'Close Details' : 'Cancel'}
          </button>
          {!(tab === 'discounts' && item) && (
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{item ? 'Save Updates' : 'Create'}</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default Modal;
