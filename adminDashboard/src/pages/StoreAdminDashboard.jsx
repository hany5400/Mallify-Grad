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
            <h1 className="capitalize-title">{activeTab.replace('-', ' ')}</h1>
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
          <div className="mall-hero-modern animate-fade">
            <div className="hero-radial-glow glow-primary"></div>

            <div className="hero-image-wrapper">
              {stats.assignedMallImage ? (
                <img src={`${API_BASE}/${stats.assignedMallImage}`} alt="Mall" className="hero-img-cover" />
              ) : (
                <div className="hero-img-placeholder">
                  <ImageIcon size={48} className="img-placeholder-icon" />
                </div>
              )}
            </div>

            <div className="hero-content-section">
              <div className="hero-badge-row">
                <span className="hero-primary-badge">
                  Primary Mall
                </span>
                <div className="flex-center-gap6">
                  <div className="connection-pulse-dot"></div>
                  <span className="connection-pulse-text">Active Connection</span>
                </div>
              </div>

              <h1 className="hero-mall-title">
                {stats.assignedMall}
              </h1>

              <p className="hero-mall-desc">
                Welcome back! Your store is currently integrated with the {stats.assignedMall}
              </p>

              <div className="flex-gap32">
                <div className="flex-center-gap10">
                  <div className="hero-status-icon-box">
                    <Shield size={18} className="hero-status-shield-icon" />
                  </div>
                  <div>
                    <div className="hero-status-label">Status</div>
                    <div className="hero-status-value">Official Partner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mall Hero Call-To-Action if not assigned to any mall */}
        {activeTab === 'dashboard' && !stats.assignedMall && (
          <div className="mall-hero-modern unassigned animate-fade">
            <div className="hero-radial-glow glow-sky"></div>
            
            <div className="hero-unassigned-content">
              <div className="hero-unassigned-badge-wrapper">
                <span className="hero-unassigned-badge">
                  No Mall Assignment
                </span>
              </div>
              <h2 className="hero-unassigned-title">
                Connect Your Store to a Mall
              </h2>
              <p className="hero-unassigned-desc">
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
            <div className="notification-inner">
              <X size={20} onClick={() => setGlobalError(null)} className="close-icon" />
              <p>{globalError}</p>
            </div>
          </div>
        )}

        <div className="glass-panel animate-fade">
          <div className="panel-header-row">
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
            <div className="loading-container">
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
          <div className="modal-content assignment-modal-content animate-fade">
            {isAssignmentSuccess ? (
              <div className="assignment-success-container animate-fade">
                <div className="assignment-success-icon-box">
                  <Check size={48} />
                </div>
                <h2 className="assignment-success-title">Request Sent!</h2>
                <p className="assignment-success-text">The mall admin will review your assignment request.</p>
              </div>
            ) : (
              <>
                <div className="assignment-panel-header">
                  <h2>Select Store to Assign</h2>
                  <button className="btn-close-transparent" onClick={() => setAssignmentModalData(null)}><X size={24} /></button>
                </div>
                <div className="form-group form-group-margin32">
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
                <div className="modal-footer-row">
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
