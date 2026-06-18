import React, { useState } from 'react';
import { Store, Package, Trash2, Image as ImageIcon, Pencil, Eye, X, Check, CheckCircle, MapPin, Tag, Shield, UserCheck, FileText, UserPlus, Users } from 'lucide-react';
import api, { API_BASE } from '../services/api.js';

function DataRenderer({ tab, items, setItems, user, refresh, onEdit, onAssignmentRequest, setGlobalError }) {
  const userRole = user?.role || (user?.admin_type === 'mall' ? 'mall_admin' : (user?.admin_type === 'store' ? 'store_admin' : (user?.admin_type === 'system' ? 'system_admin' : 'user')));
  const [processingIds, setProcessingIds] = useState(new Set());

  if (items.length === 0) return <p style={{ color: 'var(--text-muted)' }}>No items found.</p>;

  const handleDelete = async (id, path) => {
    try {
      // Optimistic Update: Handle both flat and nested lists
      setItems(prevItems => {
        return prevItems.map(item => {
          if (item.stores) {
            return {
              ...item,
              stores: item.stores.filter(s => s.id !== id)
            };
          }
          return item;
        }).filter(item => {
          return (item.id || item.user_id) !== id;
        });
      });

      await api.delete(`/${path === 'discountCode' ? 'discount' : path}/${id}`);
      await refresh();
    } catch (err) {
      console.error(err);
      refresh(); // Re-sync if it failed
    }
  };

  const handleAction = async (id, action) => {
    if (processingIds.has(id)) return;
    try {
      setProcessingIds(prev => new Set(prev).add(id));
      await api.put(`/auth/admins/requests/${id}/${action}`, { user_id: user?.id });
      await refresh();
    } catch (err) {
      console.error(err);
      if (setGlobalError) {
        setGlobalError(err.response?.data?.error || err.response?.data?.message || "Action failed.");
      }
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleRoleRequestAction = async (id, type, action) => {
    if (processingIds.has(id)) return;
    try {
      setProcessingIds(prev => new Set(prev).add(id));
      
      if (userRole === 'mall_admin' && type === 'store') {
        await api.put(`/auth/admins/requests/${id}/${action}`, { user_id: user?.id });
      } else {
        await api.post(`/system-admin/${action}-${type}/${id}`);
      }
      await refresh();
    } catch (err) {
      console.error(err);
      if (setGlobalError) {
        setGlobalError(err.response?.data?.error || err.response?.data?.message || "Failed to process request. Please try again.");
      }
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {tab === 'requests' && <><th>Store Name</th><th>Applicant</th><th>Email</th><th>Documents</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></>}
            {['mall-admins', 'store-admins'].includes(tab) && <><th>Code</th><th>Name</th><th>Email</th><th style={{ textAlign: 'right' }}>Actions</th></>}
            {tab === 'stores' && (
              userRole === 'mall_admin'
                ? <><th>Store Owner</th><th colSpan="4">Stores & Products</th></>
                : <><th>Store Name</th><th>Tier</th><th>Location</th><th>Image</th>{userRole === 'mall_admin' && <th>Owner</th>}<th style={{ textAlign: 'right' }}>Actions</th></>
            )}
            {tab === 'products' && <><th>Product Name</th>{userRole !== 'store_admin' && <th>Store</th>}<th>Image</th>{userRole === 'mall_admin' && <th>Owner</th>}<th style={{ textAlign: 'right' }}>Actions</th></>}
            {tab === 'product-categories' && <><th>Category Name</th><th>Product</th><th>Size</th><th>Price</th><th>Image</th><th style={{ textAlign: 'right' }}>Actions</th></>}
            {tab === 'discounts' && <><th>Title</th><th>Amount</th><th>Expiry</th><th>Targets</th><th style={{ textAlign: 'right' }}>Actions</th></>}
            {tab === 'malls' && <><th>Mall Name</th><th>Image</th><th style={{ textAlign: 'right' }}>Actions</th></>}
            {tab === 'mall-assignment' && <><th>Mall Name</th><th>Image</th><th style={{ textAlign: 'right' }}>Actions</th></>}
            {tab === 'mall-requests' && <><th>Store Name</th><th>Owner</th><th>Requested Mall</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></>}
            {tab === 'role-requests' && <><th>User</th>{userRole !== 'mall_admin' && <><th>Type</th></>}<th>Docs</th><th>Invite Code</th><th>Status</th><th>Date</th><th style={{ textAlign: 'right' }}>Actions</th></>}
            {tab === 'users' && <><th>Code</th><th>Name</th><th>Email</th><th>Role</th><th style={{ textAlign: 'right' }}>Actions</th></>}
            {tab === 'system-admins' && <><th>Code</th><th>Name</th><th>Email</th><th>Role</th></>}
            {tab === 'mall-overview' && <><th>Mall Admin</th><th colSpan="3">Malls & Assigned Stores</th><th style={{ textAlign: 'right' }}>Actions</th></>}
            {tab === 'store-overview' && <><th>Store Admin</th><th colSpan="3">Stores & Products</th><th style={{ textAlign: 'right' }}>Actions</th></>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id || item.request_id || item.user_id || idx}>
              {tab === 'requests' && (
                <>
                  <td><div style={{ fontWeight: '700', fontSize: '15px' }}>{item?.admin_name || '---'}</div></td>
                  <td><div style={{ fontWeight: '500' }}>{item?.user_name || '---'}</div></td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item?.user_email || '---'}</td>
                  <td>
                    <div className="doc-thumbnails">
                      {item?.commercial_registration ? (
                        <a href={`${API_BASE}/${item.commercial_registration}`} target="_blank" rel="noreferrer" className="doc-link">
                          <img src={`${API_BASE}/${item.commercial_registration}`} alt="License" className="doc-thumb" />
                          <span className="doc-label">License</span>
                        </a>
                      ) : <span className="doc-label" style={{ color: 'var(--text-muted)' }}>No License</span>}
                      {item?.image_url ? (
                        <a href={`${API_BASE}/${item.image_url}`} target="_blank" rel="noreferrer" className="doc-link">
                          <img src={`${API_BASE}/${item.image_url}`} alt="ID" className="doc-thumb" />
                          <span className="doc-label">ID</span>
                        </a>
                      ) : <span className="doc-label" style={{ color: 'var(--text-muted)' }}>No ID</span>}
                    </div>
                  </td>
                  <td><span className={`status-badge status-${item?.status}`}>{item?.status || 'unknown'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {item?.status === 'pending' && (
                        <>
                          <button className="btn btn-reject"
                            disabled={processingIds.has(item.request_id)}
                            style={{ opacity: processingIds.has(item.request_id) ? 0.5 : 1 }}
                            onClick={() => handleAction(item.request_id, 'reject')}>
                            <X size={16} />
                          </button>
                          <button className="btn btn-approve"
                            disabled={processingIds.has(item.request_id)}
                            style={{ opacity: processingIds.has(item.request_id) ? 0.5 : 1 }}
                            onClick={() => handleAction(item.request_id, 'approve')}>
                            {processingIds.has(item.request_id) ? <span className="animate-pulse">...</span> : <Check size={16} />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </>
              )}
              {['mall-admins', 'store-admins'].includes(tab) && (
                <>
                  <td><span className="status-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '800' }}>{item?.user_code || '---'}</span></td>
                  <td>{item?.name || '---'}</td>
                  <td>{item?.email || '---'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-reject" onClick={() => handleDelete(item.id, 'admins')}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </>
              )}
              {tab === 'stores' && (
                <>
                  {userRole === 'mall_admin' ? (
                    <>
                      <td>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#64748b' }}>{item?.owner_email || '---'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>Store Owner</div>
                      </td>
                      <td colSpan="4">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {(item?.stores || []).map(s => (
                            <details key={s.id} className="mall-expandable-card" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                              <summary style={{ listStyle: 'none', cursor: 'pointer', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <Store size={20} style={{ color: 'var(--primary)' }} />
                                  <div>
                                    <div style={{ fontWeight: '700' }}>{s.store_name}</div>
                                    <div style={{ fontSize: '11px', opacity: 0.6 }}>{s.brand_tier} • {s.store_location || s.location}</div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ fontSize: '12px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>
                                    {s.products?.length || 0} Products
                                  </div>
                                  <button
                                    className="btn btn-reject"
                                    style={{ padding: '6px' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(s.id, 'store');
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </summary>
                              <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
                                <div style={{ paddingTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                                  {(s.products || []).length > 0 ? s.products.map(p => (
                                    <div key={p.product_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                      <Package size={14} style={{ opacity: 0.5 }} />
                                      <div style={{ fontSize: '12px', fontWeight: '600' }}>{p.product_name}</div>
                                    </div>
                                  )) : <div style={{ fontSize: '12px', opacity: 0.5 }}>No products listed for this store.</div>}
                                </div>
                              </div>
                            </details>
                          ))}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{item?.store_name || '---'}</td>
                      <td>{item?.brand_tier || '---'}</td>
                      <td>{item?.store_location || item?.location || '---'}</td>
                      <td>
                        <div className="table-img-container">
                          {item?.image_url ? (
                            <img src={`${API_BASE}/${item.image_url}`} alt={item.store_name} className="table-img" />
                          ) : (
                            <div className="img-placeholder"><ImageIcon size={18} /></div>
                          )}
                        </div>
                      </td>
                      {user?.role === 'mall_admin' && <td>{item?.owner_email || '---'}</td>}
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {user?.role === 'store_admin' && <button className="btn btn-outline" onClick={() => onEdit(item)}><Pencil size={16} /></button>}
                          <button className="btn btn-reject" onClick={() => handleDelete(item.id, 'store')}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </>
              )}

              {tab === 'products' && (
                <>
                  <td>{item?.product_name || '---'}</td>
                  {user?.role !== 'store_admin' && <td><span className="store-badge">{item?.store_name || '---'}</span></td>}
                  <td>
                    <div className="table-img-container">
                      {item?.image_url ? (
                        <img src={`${API_BASE}/${item.image_url}`} alt={item.product_name} className="table-img" />
                      ) : (
                        <div className="img-placeholder"><ImageIcon size={18} /></div>
                      )}
                    </div>
                  </td>
                  {user?.admin_type === 'mall' && <td>{item?.owner_name || '---'}</td>}
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {user?.admin_type === 'store' && <button className="btn btn-outline" onClick={() => onEdit(item)}><Pencil size={16} /></button>}
                      <button className="btn btn-reject" onClick={() => handleDelete(item.id, 'product')}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </>
              )}

              {tab === 'product-categories' && (
                <>
                  <td>{item?.product_category_name || '---'}</td>
                  <td><span className="store-badge">{item?.product_name || '---'}</span></td>
                  <td>{item?.size || '---'}</td>
                  <td>${item?.price || '0'}</td>
                  <td>
                    <div className="table-img-container">
                      {item?.image_url ? (
                        <img src={`${API_BASE}/${item.image_url}`} alt={item.product_category_name} className="table-img" />
                      ) : (
                        <div className="img-placeholder"><ImageIcon size={18} /></div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline" onClick={() => onEdit(item)}><Pencil size={16} /></button>
                      <button className="btn btn-reject" onClick={() => handleDelete(item.id, 'productCategory')}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </>
              )}

              {tab === 'discounts' && (
                <>
                  <td><div style={{ fontWeight: '700' }}>{item?.title || 'Untitled Discount'}</div></td>
                  <td><span className="status-badge" style={{ background: '#f0fdf4', color: '#10B981', fontWeight: '800' }}>{item?.amount || '0'}% OFF</span></td>
                  <td style={{ fontSize: '13px' }}>{item?.expiry_date || '---'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag size={14} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>{item?.targets?.length || 0} items</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline" title="View Details" onClick={() => onEdit(item)}><Eye size={16} /></button>
                      <button className="btn btn-reject" onClick={() => handleDelete(item.id, 'discount')}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </>
              )}
              {tab === 'malls' && (
                <>
                  <td>{item?.mall_name || '---'}</td>
                  <td>
                    <div className="table-img-container">
                      {item?.image_url ? (
                        <img src={`${API_BASE}/${item.image_url}`} alt={item.mall_name} className="table-img" />
                      ) : (
                        <div className="img-placeholder"><ImageIcon size={18} /></div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline" onClick={() => onEdit(item)}><Pencil size={16} /></button>
                      <button className="btn btn-reject" onClick={() => handleDelete(item.id, 'mall')}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </>
              )}
              {tab === 'mall-assignment' && (
                <>
                  <td>{item?.mall_name || '---'}</td>
                  <td>
                    <div className="table-img-container">
                      {item?.image_url ? (
                        <img src={`${API_BASE}/${item.image_url}`} alt={item.mall_name} className="table-img" />
                      ) : (
                        <div className="img-placeholder"><ImageIcon size={18} /></div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline" onClick={() => onAssignmentRequest(item.id)}>
                        Request Assignment
                      </button>
                    </div>
                  </td>
                </>
              )}

              {tab === 'role-requests' && (
                <>
                  <td><div style={{ fontWeight: '600' }}>{item?.user_name || '---'}</div><div style={{ fontSize: '12px', opacity: 0.7 }}>{item?.user_email}</div></td>
                  {userRole !== 'mall_admin' && (
                    <>
                      <td><span className="store-badge" style={{ textTransform: 'uppercase' }}>{item?.request_type}</span></td>
                    </>
                  )}
                  <td>
                    <div className="doc-thumbnails">
                      {item?.commercial_license ? (
                        <a href={`${API_BASE}/${item.commercial_license}`} target="_blank" rel="noreferrer" className="doc-link">
                          <img src={`${API_BASE}/${item.commercial_license}`} alt="Commercial License" className="doc-thumb" />
                          <span className="doc-label">License</span>
                        </a>
                      ) : <span className="doc-label">No License</span>}
                      {item?.identification_document ? (
                        <a href={`${API_BASE}/${item.identification_document}`} target="_blank" rel="noreferrer" className="doc-link">
                          <img src={`${API_BASE}/${item.identification_document}`} alt="Identification Document" className="doc-thumb" />
                          <span className="doc-label">ID</span>
                        </a>
                      ) : <span className="doc-label">No ID</span>}
                    </div>
                  </td>
                  <td><span className="code-font">{item?.invite_code || '---'}</span></td>
                  <td>
                    <span className={`status-badge status-${item.status}`} style={{
                      padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                      background: item.status === 'pending' ? 'rgba(245,158,11,0.1)' : (item.status === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'),
                      color: item.status === 'pending' ? '#f59e0b' : (item.status === 'approved' ? '#10b981' : '#ef4444'),
                      border: `1px solid ${item.status === 'pending' ? 'rgba(245,158,11,0.2)' : (item.status === 'approved' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)')}`
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item?.created_at ? new Date(item.created_at).toLocaleDateString() : '---'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {item.status === 'pending' ? (
                        <>
                          <button className="btn btn-reject"
                            disabled={processingIds.has(item.store_register_id || item.mall_register_id)}
                            onClick={() => handleRoleRequestAction(item.store_register_id || item.mall_register_id, item.request_type, 'reject')}
                          >
                            <X size={16} />
                          </button>
                          <button className="btn btn-approve"
                            disabled={processingIds.has(item.store_register_id || item.mall_register_id)}
                            onClick={() => handleRoleRequestAction(item.store_register_id || item.mall_register_id, item.request_type, 'approve')}
                          >
                            {processingIds.has(item.store_register_id || item.mall_register_id) ? <span className="animate-pulse">...</span> : <Check size={16} />}
                          </button>
                        </>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', padding: '6px 12px', background: 'rgba(0,0,0,0.04)', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Processed
                        </div>
                      )}
                    </div>
                  </td>
                </>
              )}
              {tab === 'users' && (
                <>
                  <td><span className="status-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '800' }}>{item?.user_code || '---'}</span></td>
                  <td>{item?.name || '---'}</td>
                  <td>{item?.email || '---'}</td>
                  <td><span className="store-badge" style={{ textTransform: 'uppercase' }}>{item?.role || 'user'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-reject" onClick={() => handleDelete(item.id, 'users')}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </>
              )}
              {tab === 'system-admins' && (
                <>
                  <td><span className="status-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '800' }}>{item?.user_code || '---'}</span></td>
                  <td>{item?.name || '---'}</td>
                  <td>{item?.email || '---'}</td>
                  <td><span className="store-badge" style={{ textTransform: 'uppercase' }}>{item?.role || 'user'}</span></td>
                </>
              )}

              {tab === 'mall-overview' && (
                <>
                  <td>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#64748b' }}>{item?.email || '---'}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7, fontWeight: '800', color: '#3B82F6', marginTop: '2px' }}>{item?.user_code || '---'}</div>
                  </td>
                  <td colSpan="3">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(item?.malls || []).length > 0 ? item.malls.map(m => (
                        <details key={m.id} className="mall-expandable-card" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                          <summary style={{ listStyle: 'none', cursor: 'pointer', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {m.image ? <img src={`${API_BASE}/${m.image}`} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} /> : <MapPin size={24} style={{ color: 'var(--primary)' }} />}
                              <span style={{ fontWeight: '600', fontSize: '15px' }}>{m.name}</span>
                            </div>
                            <div className="status-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                              {m.stores?.length || 0} Stores
                            </div>
                          </summary>
                          <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
                            <div style={{ paddingTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                              {(m?.stores || []).length > 0 ? m.stores.map(s => (
                                <div key={s.store_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                  <Store size={14} style={{ opacity: 0.5 }} />
                                  <div>
                                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{s.store_name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '500' }}>Owner: {s.owner_name || '---'}</div>
                                    <div style={{ fontSize: '10px', opacity: 0.6, textTransform: 'uppercase' }}>{s.brand_tier}</div>
                                  </div>
                                </div>
                              )) : <div style={{ fontSize: '12px', opacity: 0.5, padding: '8px' }}>No approved stores in this mall yet.</div>}
                            </div>
                          </div>
                        </details>
                      )) : <div style={{ opacity: 0.5, fontStyle: 'italic' }}>No malls assigned to this administrator.</div>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-reject" onClick={() => handleDelete(item.id, 'users')} title="Delete Admin"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </>
              )}

              {tab === 'store-overview' && (
                <>
                  <td>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#64748b' }}>{item?.email || '---'}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7, fontWeight: '800', color: '#0ea5e9', marginTop: '2px' }}>{item?.user_code || '---'}</div>
                  </td>
                  <td colSpan="3">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(item?.stores || []).length > 0 ? item.stores.map(s => (
                        <details key={s.id} className="store-expandable-card" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                          <summary style={{ listStyle: 'none', cursor: 'pointer', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {s.image ? <img src={`${API_BASE}/${s.image}`} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} /> : <Store size={24} style={{ color: 'var(--primary)' }} />}
                              <div>
                                <span style={{ fontWeight: '600', fontSize: '15px', display: 'block' }}>{s.name}</span>
                                <span className="status-badge" style={{ fontSize: '10px', padding: '2px 8px' }}>{s.tier}</span>
                              </div>
                            </div>
                            <div className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid #3B82F6', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                              {s.products?.length || 0} Products
                            </div>
                          </summary>
                          <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.01)' }}>
                            <div style={{ paddingTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {(s?.products || []).length > 0 ? s.products.map(p => (
                                <div key={p.product_id} className="product-tag" style={{ background: 'var(--bg)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                  {p.image_url && <img src={`${API_BASE}/${p.image_url}`} style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />}
                                  <span style={{ fontWeight: '500' }}>{p.product_name}</span>
                                </div>
                              )) : <div style={{ fontSize: '12px', opacity: 0.5, padding: '8px' }}>No products listed for this store.</div>}
                            </div>
                          </div>
                        </details>
                      )) : <div style={{ opacity: 0.5, fontStyle: 'italic' }}>No stores assigned to this administrator.</div>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-reject" onClick={() => handleDelete(item.id, 'users')} title="Delete Admin"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataRenderer;
