import React, { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, X } from 'lucide-react';
import SystemAdminSidebar from '../components/SystemAdminSidebar';
import StatsGrid from '../components/StatsGrid';
import DashboardCharts from '../components/DashboardCharts';
import DataRenderer from '../components/DataRenderer';
import Modal from '../components/Modal';
import { getStats, getPendingRequests, getMallAdminsOverview, getStoreAdminsOverview, getUsers } from '../services/api';
import './SystemAdminDashboard.css';

function SystemAdminDashboard({ user, onLogout }) {
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
            const { mall } = rrRes.data.data;
            const filtered = (mall || []).map(r => ({ ...r, request_type: 'mall' }));
            setItems(filtered);
          } else {
            setItems([]);
          }
          break;

        case 'mall-overview':
          const moRes = await getMallAdminsOverview(currentSearch);
          setItems(moRes.data.ok ? moRes.data.data : []);
          break;

        case 'store-overview':
          const soRes = await getStoreAdminsOverview(currentSearch);
          setItems(soRes.data.ok ? soRes.data.data : []);
          break;

        case 'system-admins':
          const usersRes = await getUsers(currentSearch);
          const filteredUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
          setItems(filteredUsers.filter(u => u.role === 'system_admin'));
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
      <SystemAdminSidebar 
        activeTab={activeTab} 
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
              {activeTab === 'dashboard' ? 'Platform Analytics Overview' : 'Overview'}
            </h2>
            {activeTab === 'mall-overview' && (
              <button className="btn btn-primary" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
                <UserPlus size={18} /> New Mall Admin
              </button>
            )}
          </div>
 
          {['mall-overview', 'store-overview'].includes(activeTab) && !loading && (
            <div className="overview-stats-bar">
              <div className="stat-mini-card primary">
                <div className="stat-mini-card-label">
                  Total {activeTab === 'mall-overview' ? 'Mall' : 'Store'} Admins
                </div>
                <div className="stat-mini-card-value">{items.length}</div>
              </div>
              <div className="stat-mini-card muted">
                <div className="stat-mini-card-label">
                  Total {activeTab === 'mall-overview' ? 'Malls' : 'Stores'} Managed
                </div>
                <div className="stat-mini-card-value">
                  {items.reduce((acc, curr) => acc + (activeTab === 'mall-overview' ? (curr.malls?.length || 0) : (curr.stores?.length || 0)), 0)}
                </div>
              </div>
            </div>
          )}
 
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

export default SystemAdminDashboard;
