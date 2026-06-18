import React, { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, X } from 'lucide-react';
import MallAdminSidebar from '../components/MallAdminSidebar';
import StatsGrid from '../components/StatsGrid';
import DashboardCharts from '../components/DashboardCharts';
import DataRenderer from '../components/DataRenderer';
import Modal from '../components/Modal';
import { getStats, getPendingRequests, getMalls, getStores, getProducts } from '../services/api';
import './MallAdminDashboard.css';

function MallAdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [globalError, setGlobalError] = useState(null);
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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

        case 'role-requests':
          const rrRes = await getPendingRequests();
          if (rrRes.data.ok) {
            const { store } = rrRes.data.data;
            const filtered = (store || []).map(r => ({ ...r, request_type: 'store' }));
            setItems(filtered);
          } else {
            setItems([]);
          }
          break;

        case 'malls':
          const mallsRes = await getMalls();
          const mallsData = Array.isArray(mallsRes.data) ? mallsRes.data : [];
          // If searching locally/remotely
          const filteredMalls = currentSearch 
            ? mallsData.filter(m => (m.mall_name || '').toLowerCase().includes(currentSearch.toLowerCase()))
            : mallsData;
          setItems(filteredMalls);
          break;

        case 'stores':
          const storesRes = await getStores(currentSearch);
          const storesData = Array.isArray(storesRes.data) ? storesRes.data : [];

          const ownersMap = {};
          for (const s of storesData) {
            if (!ownersMap[s.user_id]) {
              ownersMap[s.user_id] = {
                id: s.user_id,
                owner_name: s.owner_name,
                owner_email: s.owner_email,
                stores: []
              };
            }
            try {
              const prodRes = await getProducts('', s.id);
              ownersMap[s.user_id].stores.push({
                ...s,
                products: Array.isArray(prodRes.data) ? prodRes.data : []
              });
            } catch (e) {
              ownersMap[s.user_id].stores.push({ ...s, products: [] });
            }
          }
          setItems(Object.values(ownersMap));
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

  const handleRefresh = async () => {
    await fetchPageData();
    await fetchStats();
  };

  return (
    <div className="dashboard-container">
      <MallAdminSidebar 
        activeTab={activeTab} 
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
              {activeTab === 'dashboard' ? 'Mall Analytics Overview' : 'Overview'}
            </h2>
            {activeTab === 'malls' && items.length < 1 && (
              <button className="btn btn-primary" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
                <Plus size={18} /> New Mall
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
              setGlobalError={setGlobalError}
            />
          )}
        </div>
      </main>

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

export default MallAdminDashboard;
