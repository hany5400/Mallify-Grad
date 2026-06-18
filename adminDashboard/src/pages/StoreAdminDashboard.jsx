import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Image as ImageIcon, Shield, Package, Store } from 'lucide-react';
import StoreAdminSidebar from '../components/StoreAdminSidebar';
import StatsGrid from '../components/StatsGrid';
import DashboardCharts from '../components/DashboardCharts';
import DataRenderer from '../components/DataRenderer';
import Modal from '../components/Modal';
import api, { API_BASE, getStats, getStores, getProducts, getProductCategories, getDiscounts, createStoreMallRequest } from '../services/api';
import './StoreAdminDashboard.css';

function StoreAdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [globalError, setGlobalError] = useState(null);
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Mall assignment modal state
  const [assignmentModalData, setAssignmentModalData] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [isAssignmentSuccess, setIsAssignmentSuccess] = useState(false);

  useEffect(() => {
    fetchStats();
    setSearchTerm('');
    setItems([]);
    fetchPageData('');
    setGlobalError(null);
  }, [activeTab]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPageData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchStats = async () => {
    try {
      const res = await getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout();
    }
  };

  const fetchPageData = async (searchOverride) => {
    setLoading(true);
    try {
      const currentSearch = searchOverride !== undefined ? searchOverride : searchTerm;

      switch (activeTab) {
        case 'dashboard':
          setItems([]);
          break;

        case 'stores':
          const storesRes = await getStores(currentSearch);
          setItems(Array.isArray(storesRes.data) ? storesRes.data : []);
          break;

        case 'products':
          const productsRes = await getProducts(currentSearch);
          setItems(Array.isArray(productsRes.data) ? productsRes.data : []);
          break;

        case 'product-categories':
          const pcRes = await getProductCategories(currentSearch);
          setItems(Array.isArray(pcRes.data) ? pcRes.data : []);
          break;

        case 'discounts':
          const dRes = await getDiscounts(currentSearch);
          setItems(Array.isArray(dRes.data) ? dRes.data : []);
          break;

        case 'mall-assignment':
          const mallsRes = await api.get('/mall');
          setItems(Array.isArray(mallsRes.data) ? mallsRes.data : []);
          break;

        default:
          setItems([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentRequest = async (mall_id) => {
    try {
      const storeRes = await getStores();
      const myStores = storeRes.data;
      if (myStores.length === 0) {
        alert("You need to create a store first!");
        return;
      }
      setSelectedStoreId(myStores[0].id);
      setAssignmentModalData({ mall_id, stores: myStores });
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const submitAssignment = async () => {
    if (!selectedStoreId || !assignmentModalData) return;
    try {
      await createStoreMallRequest(selectedStoreId, assignmentModalData.mall_id);
      setIsAssignmentSuccess(true);
      setTimeout(() => {
        setIsAssignmentSuccess(false);
        setAssignmentModalData(null);
        handleRefresh();
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleRefresh = async () => {
    await fetchPageData();
    await fetchStats();
  };

  return (
    <div className="dashboard-container">
      <StoreAdminSidebar 
        activeTab={activeTab === 'mall-assignment' ? 'stores' : activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={onLogout} 
      />

      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1 style={{ textTransform: 'capitalize' }}>{activeTab.replace('-', ' ')}</h1>
          </div>
          {activeTab !== 'dashboard' && (
            <div className="search-bar">
              <Search size={20} color="var(--text-muted)" />
              <input
                type="text"
                placeholder={`Search ${activeTab.replace('-', ' ')}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </header>

        {activeTab === 'dashboard' && stats.assignedMall && (
          <div className="mall-hero-modern animate-fade" style={{
            marginBottom: '40px',
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', borderRadius: '50%' }}></div>

            <div style={{
              width: '320px',
              height: '200px',
              flexShrink: 0,
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
              border: '4px solid white'
            }}>
              {stats.assignedMallImage ? (
                <img src={`${API_BASE}/${stats.assignedMallImage}`} alt="Mall" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={48} style={{ opacity: 0.1 }} />
                </div>
              )}
            </div>

            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{
                  padding: '6px 14px',
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}>
                  Primary Mall
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#10B981' }}>Active Connection</span>
                </div>
              </div>

              <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#1e293b', marginBottom: '12px', letterSpacing: '-1.5px', lineHeight: '1' }}>
                {stats.assignedMall}
              </h1>

              <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '480px', lineHeight: '1.6', marginBottom: '24px' }}>
                Welcome back! Your store is currently integrated with the {stats.assignedMall}
              </p>

              <div style={{ display: 'flex', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', background: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={18} style={{ color: '#10B981' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Status</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Official Partner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mall Hero Call-To-Action if not assigned to any mall */}
        {activeTab === 'dashboard' && !stats.assignedMall && (
          <div className="mall-hero-modern animate-fade" style={{
            marginBottom: '40px',
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)', borderRadius: '50%' }}></div>
            
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '20px', padding: '6px 14px', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#0ea5e9' }}>
                  No Mall Assignment
                </span>
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>
                Connect Your Store to a Mall
              </h2>
              <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '600px', lineHeight: '1.6', marginBottom: '24px' }}>
                Currently, your store is not assigned to any mall. In order to list your products and gain visibility, you must request a connection with one of the registered malls.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('mall-assignment')}
              >
                Browse Malls & Connect
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && <StatsGrid stats={stats} user={user} />}

        {globalError && (
          <div className="global-notification animate-fade">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <X size={20} onClick={() => setGlobalError(null)} style={{ cursor: 'pointer' }} />
              <p>{globalError}</p>
            </div>
          </div>
        )}

        <div className="glass-panel animate-fade">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2>
              {activeTab === 'dashboard' ? 'Store Analytics Overview' : 'Overview'}
            </h2>
            {activeTab === 'stores' && items.length < 1 && (
              <button className="btn btn-primary" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
                <Plus size={18} /> New Store
              </button>
            )}
            {activeTab === 'products' && (
              <button className="btn btn-primary" onClick={() => {
                if ((stats.totalStores || 0) === 0) {
                  setGlobalError("You must create a store before you can add products. Please go to the Stores tab to set up your store.");
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setEditingItem(null);
                  setIsModalOpen(true);
                }
              }}>
                <Plus size={18} /> New Product
              </button>
            )}
            {activeTab === 'product-categories' && (
              <button className="btn btn-primary" onClick={() => {
                if ((stats.totalProducts || 0) === 0) {
                  setGlobalError("You must create a product before you can add categories. Please go to the Products tab to set up your store's inventory.");
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setEditingItem(null);
                  setIsModalOpen(true);
                }
              }}>
                <Plus size={18} /> New Category
              </button>
            )}
            {activeTab === 'discounts' && (
              <button className="btn btn-primary" onClick={() => {
                if ((stats.totalStores || 0) === 0) {
                  setGlobalError("You must create a store before you can issue discounts. Please go to the Stores tab to set up your store.");
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setEditingItem(null);
                  setIsModalOpen(true);
                }
              }}>
                <Plus size={18} /> New Discount
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div className="animate-pulse">Loading data...</div>
            </div>
          ) : activeTab === 'dashboard' ? (
            <DashboardCharts stats={stats} user={user} />
          ) : (
            <DataRenderer
              tab={activeTab}
              items={items}
              setItems={setItems}
              user={user}
              refresh={handleRefresh}
              onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }}
              onAssignmentRequest={handleAssignmentRequest}
              setGlobalError={setGlobalError}
            />
          )}
        </div>
      </main>

      {assignmentModalData && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
            {isAssignmentSuccess ? (
              <div className="animate-fade" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ background: '#D1FAE5', color: '#10B981', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Check size={48} />
                </div>
                <h2 style={{ marginBottom: '16px' }}>Request Sent!</h2>
                <p style={{ color: 'var(--text-main)', opacity: 0.9 }}>The mall admin will review your assignment request.</p>
              </div>
            ) : (
              <>
                <div className="panel-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Select Store to Assign</h2>
                  <button className="btn-close" onClick={() => setAssignmentModalData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>
                <div className="form-group" style={{ marginBottom: '32px' }}>
                  <label>Which of your stores do you want to request assignment for?</label>
                  <select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    required
                  >
                    {assignmentModalData.stores.map(s => (
                      <option key={s.id} value={s.id}>{s.store_name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                  <button className="btn btn-outline" onClick={() => setAssignmentModalData(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={submitAssignment}>Send Request</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <Modal
          tab={activeTab}
          item={editingItem}
          user={user}
          onClose={() => setIsModalOpen(false)}
          refresh={handleRefresh}
        />
      )}
    </div>
  );
}

export default StoreAdminDashboard;
