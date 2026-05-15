import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users,
  Store,
  Package,
  MapPin,
  LayoutDashboard,
  UserPlus,
  LogOut,
  Search,
  Check,
  X,
  Plus,
  Trash2,
  FileText,
  Shield,
  Image as ImageIcon,
  Pencil,
  Building2,
  ShoppingBag,
  Shirt,
  Tag,
  Mail,
  CreditCard,
  Key,
  UserCheck,
  CheckCircle,
  Eye
} from 'lucide-react';
import './App.css';
import mallifyLogo from './assets/mallify-logo.png';

const API_BASE = 'http://localhost:3000';

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [globalError, setGlobalError] = useState(null);
  const [assignmentModalData, setAssignmentModalData] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [isAssignmentSuccess, setIsAssignmentSuccess] = useState(false);


  // Data states
  const [items, setItems] = useState([]); // General listing items
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('admin_token', token);
      fetchStats();
      setSearchTerm(''); // Reset search when tab changes
      setItems([]); // Clear current items immediately to avoid showing old data from previous tab
      fetchPageData(''); // Force fetch with empty search to avoid stale state
      setGlobalError(null); // Clear errors when switching tabs
    }
  }, [token, activeTab]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPageData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admins/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) setToken(null);
    }
  };

  const fetchPageData = async (searchOverride) => {
    if (!token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Use override if provided (specifically for tab changes), otherwise use state
      const currentSearch = searchOverride !== undefined ? searchOverride : searchTerm;

      switch (activeTab) {
        case 'dashboard':
          setItems([]);
          break;

        case 'role-requests':
          const rrUrl = isSystemAdmin ? `${API_BASE}/system-admin/pending-requests` : `${API_BASE}/system-admin/pending-requests`; // Both use same endpoint now
          const rrRes = await axios.get(rrUrl, config);
          if (rrRes.data.ok) {
            const { store, mall } = rrRes.data.data;
            // Combine them and add a 'type' field to distinguish
            const combined = [
              ...store.map(r => ({ ...r, request_type: 'store' })),
              ...mall.map(r => ({ ...r, request_type: 'mall' }))
            ];
            setItems(combined);
          } else {
            setItems([]);
          }
          break;
        case 'mall-overview':
          const moRes = await axios.get(`${API_BASE}/system-admin/mall-admins-overview${currentSearch ? `?search=${currentSearch}` : ''}`, config);
          setItems(moRes.data.ok ? moRes.data.data : []);
          break;
        case 'store-overview':
          const soRes = await axios.get(`${API_BASE}/system-admin/store-admins-overview${currentSearch ? `?search=${currentSearch}` : ''}`, config);
          setItems(soRes.data.ok ? soRes.data.data : []);
          break;
        case 'users':
        case 'system-admins':
          const isSystemTab = activeTab === 'system-admins';
          const usersUrl = `${API_BASE}/users${currentSearch ? `?search=${currentSearch}` : ''}`;
          const usersRes = await axios.get(usersUrl, config);
          const filteredUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
          setItems(filteredUsers.filter(u => isSystemTab ? u.role === 'system_admin' : u.role === 'user'));
          break;

        case 'mall-assignment':
          const maUrl = `${API_BASE}/mall`;
          const maRes = await axios.get(maUrl, config);
          setItems(Array.isArray(maRes.data) ? maRes.data : []);
          break;
        case 'mall-admins':
        case 'store-admins':
          const type = activeTab === 'mall-admins' ? 'mall' : 'store';
          const adminUrl = `${API_BASE}/admins?type=${type}${currentSearch ? `&search=${currentSearch}` : ''}`;
          const adminRes = await axios.get(adminUrl, config);
          setItems(Array.isArray(adminRes.data) ? adminRes.data : []);
          break;
        case 'stores':
        case 'products':
        case 'malls':
        case 'product-categories':
        case 'discounts':
          const baseMap = {
            stores: 'store',
            products: 'product',
            malls: 'mall',
            'product-categories': 'productCategory',
            discounts: 'discount'
          };
          const keyMap = {
            stores: 'store_name',
            products: 'product_name',
            malls: 'mall_name',
            'product-categories': 'product_category_name',
            discounts: 'title'
          };
          const endpoint = baseMap[activeTab];
          const key = keyMap[activeTab];
          const listUrl = (['stores', 'products', 'product-categories'].includes(activeTab))
            ? `${API_BASE}/${endpoint}${currentSearch ? `?search=${currentSearch}` : ''}`
            : `${API_BASE}/${endpoint}${currentSearch ? `?keyword=${key}&keyvalue=${currentSearch}` : ''}`;
          const listRes = await axios.get(listUrl, config);
          let data = Array.isArray(listRes.data) ? listRes.data : [];

          if (activeTab === 'stores' && user?.role === 'mall_admin') {
            const ownersMap = {};
            for (const s of data) {
              if (!ownersMap[s.user_id]) {
                ownersMap[s.user_id] = {
                  id: s.user_id,
                  owner_name: s.owner_name,
                  owner_email: s.owner_email,
                  stores: []
                };
              }
              // Fetch products for this store
              try {
                const prodRes = await axios.get(`${API_BASE}/product?store_id=${s.id}`, config);
                ownersMap[s.user_id].stores.push({
                  ...s,
                  products: Array.isArray(prodRes.data) ? prodRes.data : []
                });
              } catch (e) {
                ownersMap[s.user_id].stores.push({ ...s, products: [] });
              }
            }
            setItems(Object.values(ownersMap));
          } else {
            setItems(data);
          }
          break;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('admin_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else if (token) {
      setUser({ role: 'user' });
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <LoginScreen setToken={setToken} />;
  }

  // Determine which tabs to show based on role
  const userRole = user?.role || (user?.admin_type === 'mall' ? 'mall_admin' : (user?.admin_type === 'store' ? 'store_admin' : (user?.admin_type === 'system' ? 'system_admin' : 'user')));
  const isSystemAdmin = userRole === 'system_admin';
  const isMallAdmin = userRole === 'mall_admin';
  const isStoreAdmin = userRole === 'store_admin';

  const handleAssignmentRequest = async (mall_id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const storeRes = await axios.get(`${API_BASE}/store`, config);
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
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_BASE}/storeMall/requests`, { store_id: selectedStoreId, mall_id: assignmentModalData.mall_id }, config);
      setIsAssignmentSuccess(true);
      setTimeout(() => {
        setIsAssignmentSuccess(false);
        setAssignmentModalData(null);
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <h2 className="logo-text">Mallify</h2>
        </div>

        {user && (
          <div className="sidebar-profile" style={{ padding: '0 32px 24px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', letterSpacing: '1px' }}>{user.user_code || '---'}</div>
              </div>
            </div>
          </div>
        )}
        <ul className="sidebar-menu">
          <li className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </li>

          {isSystemAdmin && (
            <>
              <li className={`menu-item ${activeTab === 'role-requests' ? 'active' : ''}`} onClick={() => setActiveTab('role-requests')}>
                <FileText size={20} /> Mall Waitlist
              </li>
              <li className={`menu-item ${activeTab === 'system-admins' ? 'active' : ''}`} onClick={() => setActiveTab('system-admins')}>
                <Shield size={20} /> System Admins
              </li>
              <li className={`menu-item ${activeTab === 'mall-overview' ? 'active' : ''}`} onClick={() => setActiveTab('mall-overview')}>
                <MapPin size={20} /> Mall Overview
              </li>
              <li className={`menu-item ${activeTab === 'store-overview' ? 'active' : ''}`} onClick={() => setActiveTab('store-overview')}>
                <Store size={20} /> Store Overview
              </li>
            </>
          )}

          {isMallAdmin && (
            <>
              <li className={`menu-item ${activeTab === 'malls' ? 'active' : ''}`} onClick={() => setActiveTab('malls')}>
                <MapPin size={20} /> Mall
              </li>
              <li className={`menu-item ${activeTab === 'role-requests' ? 'active' : ''}`} onClick={() => setActiveTab('role-requests')}>
                <UserCheck size={20} /> Store Waitlist
              </li>
              <li className={`menu-item ${activeTab === 'stores' ? 'active' : ''}`} onClick={() => setActiveTab('stores')}>
                <Store size={20} /> Stores
              </li>
            </>
          )}

          {isStoreAdmin && (
            <>
              <li className={`menu-item ${activeTab === 'stores' ? 'active' : ''}`} onClick={() => setActiveTab('stores')}>
                <Store size={20} /> My Store
              </li>
              <li className={`menu-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                <Package size={20} /> Products
              </li>
              <li className={`menu-item ${activeTab === 'product-categories' ? 'active' : ''}`} onClick={() => setActiveTab('product-categories')}>
                <Plus size={20} /> Product Types
              </li>
              <li className={`menu-item ${activeTab === 'discounts' ? 'active' : ''}`} onClick={() => setActiveTab('discounts')}>
                <Check size={20} /> Manage Discounts
              </li>
            </>
          )}
        </ul>
        <div className="sidebar-footer" style={{ padding: '0 32px' }}>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1 style={{ textTransform: 'capitalize' }}>{activeTab.replace('-', ' ')}</h1>
          </div>
          <div className="search-bar">
            <Search size={20} color="var(--text-muted)" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {activeTab === 'dashboard' && isStoreAdmin && stats.assignedMall && (
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
            {/* Soft decorative background element */}
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
            <h2>Overview</h2>
            {activeTab === 'malls' && (isSystemAdmin || (isMallAdmin && items.length < 1)) && (
              <button className="btn btn-primary" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
                <Plus size={18} /> New Mall
              </button>
            )}
            {activeTab === 'products' && isStoreAdmin && (
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
            {activeTab === 'product-categories' && isStoreAdmin && (
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


            {activeTab === 'stores' && isStoreAdmin && (
              <button className="btn btn-primary" onClick={() => {
                if (isStoreAdmin && items.length >= 1) {
                  setGlobalError("Only one store allowed per account.");
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setEditingItem(null);
                  setIsModalOpen(true);
                }
              }}>
                <Plus size={18} /> New Store
              </button>
            )}
            {activeTab === 'discounts' && isStoreAdmin && (
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
            {['mall-admins', 'mall-overview'].includes(activeTab) && (isMallAdmin || isSystemAdmin) && (
              <button className="btn btn-primary" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
                <UserPlus size={18} /> New Mall Admin
              </button>
            )}
          </div>

          {/* Overview Summary Stats */}
          {['mall-overview', 'store-overview'].includes(activeTab) && !loading && (
            <div className="overview-stats-bar" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
              <div className="stat-mini-card" style={{ background: 'var(--primary-light)', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--primary)', minWidth: '200px' }}>
                <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Total {activeTab === 'mall-overview' ? 'Mall' : 'Store'} Admins
                </div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>{items.length}</div>
              </div>
              <div className="stat-mini-card" style={{ background: 'white', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--border)', minWidth: '200px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Total {activeTab === 'mall-overview' ? 'Malls' : 'Stores'} Managed
                </div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>
                  {items.reduce((acc, curr) => acc + (activeTab === 'mall-overview' ? (curr.malls?.length || 0) : (curr.stores?.length || 0)), 0)}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div className="animate-pulse">Loading data...</div>
            </div>
          ) : (
            <>
              <DataRenderer
                tab={activeTab}
                items={items}
                setItems={setItems}
                token={token}
                user={user}
                refresh={async () => { await fetchPageData(); await fetchStats(); }}
                onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }}
                onAssignmentRequest={handleAssignmentRequest}
              />
            </>
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
          token={token}
          user={user}
          onClose={() => setIsModalOpen(false)}
          refresh={() => { fetchPageData(); fetchStats(); }}
        />
      )}
    </div>
  );
}

// --- SUB COMPONENTS ---

function LoginScreen({ setToken }) {
  const [screen, setScreen] = useState('login'); // 'login' | 'register-mall' | 'register-store' | 'pending'
  const [pendingType, setPendingType] = useState('');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration state
  const [regData, setRegData] = useState({ name: '', email: '', password: '', confirmPassword: '', mall_name: '', store_name: '', mall_id: '' });
  const [commercialLicense, setCommercialLicense] = useState(null);
  const [identificationDoc, setIdentificationDoc] = useState(null);
  const [licensePrev, setLicensePrev] = useState(null);
  const [idDocPrev, setIdDocPrev] = useState(null);
  const [regErr, setRegErr] = useState('');
  const [malls, setMalls] = useState([]);

  const licenseRef = React.useRef(null);
  const idDocRef = React.useRef(null);

  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyType, setVerifyType] = useState('mall'); // mall or store
  const [isActivated, setIsActivated] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const endpoint = verifyType === 'mall' ? '/auth/admins/verify-mall-code' : '/auth/admins/verify-code';
      const res = await axios.post(`${API_BASE}${endpoint}`, {
        email: verifyEmail,
        inviteCode: verifyCode
      });

      // Success! Show a success message briefly
      setIsActivated(true);
      setErr('');
      setTimeout(() => {
        setScreen('login');
        setIsActivated(false);
        setEmail(verifyEmail);
      }, 3000);
    } catch (err) {
      setErr(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (screen === 'register-store') {
      axios.get(`${API_BASE}/mall`).then(r => setMalls(Array.isArray(r.data) ? r.data : [])).catch(() => { });
    }
  }, [screen]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const res = await axios.post(`${API_BASE}/auth/admins/login`, { email, password });

      if (res.data.requiresActivation) {
        setVerifyEmail(res.data.email);
        setVerifyType(res.data.type);
        setScreen('verify-code');
        setErr('');
        return;
      }

      if (res.data.requiresWait) {
        setPendingType(res.data.type);
        setScreen('pending');
        setErr('');
        return;
      }

      if (res.data.token) {
        localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
        localStorage.setItem('admin_token', res.data.token);
        setToken(res.data.token);
        window.location.reload();
      }
    } catch (err) {
      setErr(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleFileChange = (setter, prevSetter) => (e) => {
    const f = e.target.files[0];
    if (f) { setter(f); prevSetter(URL.createObjectURL(f)); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegErr('');
    if (regData.password !== regData.confirmPassword) { setRegErr("Passwords do not match."); return; }
    if (!commercialLicense || !identificationDoc) { setRegErr("Please upload both documents."); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', regData.name);
      fd.append('email', regData.email);
      fd.append('password', regData.password);
      fd.append('commercial_license', commercialLicense);
      fd.append('identification_document', identificationDoc);
      if (screen === 'register-mall') {
        fd.append('mall_name', regData.name);
        await axios.post(`${API_BASE}/auth/admins/register/mall`, fd);
        setPendingType('mall');
      } else {
        fd.append('store_name', regData.name);
        fd.append('mall_id', regData.mall_id);
        await axios.post(`${API_BASE}/auth/admins/register/store`, fd);
        setPendingType('store');
      }
      setScreen('pending');
    } catch (err) {
      setRegErr(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const bgStyle = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px', position: 'relative', overflow: 'hidden'
  };

  const decorCircle = (top, left, size, color, opacity = 0.07) => ({
    position: 'absolute', top, left, width: size, height: size,
    borderRadius: '50%', background: color, opacity, filter: 'blur(60px)', pointerEvents: 'none'
  });

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '28px',
    padding: '48px', width: '100%', maxWidth: screen === 'login' ? '440px' : '560px',
    boxShadow: '0 32px 64px -12px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px', borderRadius: '12px',
    border: '1.5px solid rgba(0,0,0,0.1)', background: '#f8fafc',
    color: '#0f172a', fontSize: '15px', outline: 'none', fontFamily: 'Outfit, sans-serif',
    transition: 'border-color 0.2s', fontWeight: '500'
  };

  const labelStyle = { display: 'block', color: '#475569', fontSize: '13px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' };

  const fileBoxStyle = (hasFile) => ({
    width: '100%', aspectRatio: '3/2', border: `2px dashed ${hasFile ? '#0ea5e9' : 'rgba(0,0,0,0.15)'}`,
    borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', background: hasFile ? 'rgba(14,165,233,0.08)' : 'rgba(0,0,0,0.02)',
    transition: 'all 0.3s ease', overflow: 'hidden', position: 'relative', gap: '8px'
  });

  if (screen === 'pending') {
    return (
      <div className="auth-bg-animated" style={bgStyle}>
        <div className="animate-fade" style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px rgba(14,165,233,0.4)' }}>
              <Check size={40} color="white" />
            </div>
            <h2 style={{ color: '#0f172a', fontSize: '26px', fontWeight: '800', marginBottom: '12px' }}>Request Submitted!</h2>
            <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.7, marginBottom: '8px' }}>
              Your {pendingType === 'mall' ? 'Mall Admin' : 'Store Admin'} registration is <strong style={{ color: '#0ea5e9' }}>under review</strong>.
            </p>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7, marginBottom: '32px' }}>
              {pendingType === 'mall'
                ? 'The System Admin will review your documents and approve your request. You\'ll receive an email with your invite code.'
                : 'The Mall Admin will review your request. You\'ll receive an email with your invite code once approved.'}
            </p>
            <button onClick={() => { setScreen('login'); setRegData({ name: '', email: '', password: '', confirmPassword: '', mall_name: '', store_name: '', mall_id: '' }); setCommercialLicense(null); setIdentificationDoc(null); setLicensePrev(null); setIdDocPrev(null); }}
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%', boxShadow: '0 8px 24px rgba(14,165,233,0.35)' }}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'register-mall' || screen === 'register-store') {
    const isMall = screen === 'register-mall';
    return (
      <div className="auth-bg-animated" style={bgStyle}>
        <form className="animate-fade" style={{ ...cardStyle, maxWidth: '620px' }} onSubmit={handleRegister}>
          <button type="button" onClick={() => { setScreen('login'); setRegErr(''); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', padding: 0 }}>
            ← Back to Login
          </button>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isMall ? 'rgba(37,99,235,0.15)' : 'rgba(14,165,233,0.15)', border: `1px solid ${isMall ? 'rgba(37,99,235,0.3)' : 'rgba(14,165,233,0.3)'}`, borderRadius: '20px', padding: '6px 14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: isMall ? '#2563eb' : '#0ea5e9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isMall ? <><Building2 size={14} /> Mall Admin</> : <><Store size={14} /> Store Admin</>} Registration
              </span>
            </div>
            <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '800', lineHeight: 1.2 }}>
              {isMall ? 'Apply for Mall Admin Access' : 'Apply for Store Admin Access'}
            </h2>
            <p style={{ color: '#475569', fontSize: '14px', marginTop: '8px' }}>Fill in your details and upload the required documents.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>{isMall ? 'Mall Name' : 'Store Name'}</label>
              <input style={inputStyle} placeholder={isMall ? "e.g. Mall of Arabia" : "e.g. Nike Store"} value={regData.name} onChange={e => setRegData({ ...regData, name: e.target.value })} required onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'} />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input style={inputStyle} type="email" placeholder="admin@example.com" value={regData.email} onChange={e => setRegData({ ...regData, email: e.target.value })} required onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input style={inputStyle} type="password" placeholder="••••••••" value={regData.password} onChange={e => setRegData({ ...regData, password: e.target.value })} required onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'} />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input style={inputStyle} type="password" placeholder="••••••••" value={regData.confirmPassword} onChange={e => setRegData({ ...regData, confirmPassword: e.target.value })} required onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'} />
            </div>
          </div>

          {!isMall && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Select Target Mall</label>
              <select style={{ ...inputStyle, appearance: 'none' }} value={regData.mall_id} onChange={e => setRegData({ ...regData, mall_id: e.target.value })} required>
                <option value="" style={{ background: '#f8fafc', color: '#0f172a' }}>Choose a mall...</option>
                {malls.map(m => <option key={m.id} value={m.id} style={{ background: '#f8fafc', color: '#0f172a' }}>{m.mall_name}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Commercial License</label>
              <input type="file" ref={licenseRef} style={{ display: 'none' }} accept="image/*,.pdf" onChange={handleFileChange(setCommercialLicense, setLicensePrev)} />
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
              <input type="file" ref={idDocRef} style={{ display: 'none' }} accept="image/*,.pdf" onChange={handleFileChange(setIdentificationDoc, setIdDocPrev)} />
              <div style={fileBoxStyle(!!idDocPrev)} onClick={() => idDocRef.current?.click()}>
                {idDocPrev ? (
                  <img src={idDocPrev} alt="ID" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px', opacity: 0.85 }} />
                ) : (
                  <>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={20} color="#0ea5e9" /></div>
                    <p style={{ color: '#475569', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>Click to upload<br />Identification Document</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {regErr && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px 18px', color: '#ef4444', fontSize: '14px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><X size={18} /> {regErr}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: `linear-gradient(135deg, ${isMall ? '#2563eb, #1d4ed8' : '#0ea5e9, #0284c7'})`, color: 'white', fontSize: '16px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: `0 8px 24px ${isMall ? 'rgba(37,99,235,0.35)' : 'rgba(14,165,233,0.35)'}`, transition: 'all 0.3s' }}>
            {loading ? 'Submitting...' : `Submit ${isMall ? 'Mall Admin' : 'Store Admin'} Application`}
          </button>
        </form>
      </div>
    );
  }

  if (screen === 'verify-code') {
    return (
      <div className="auth-bg-animated" style={bgStyle}>
        <div className="animate-fade" style={{ ...cardStyle, textAlign: 'center' }}>
          {isActivated ? (
            <div className="animate-fade">
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Check size={48} />
              </div>
              <h2 style={{ color: '#0f172a', fontSize: '26px', fontWeight: '800', marginBottom: '12px' }}>Account Activated!</h2>
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.6 }}>Your admin access is now active. We are redirecting you to the login screen...</p>
            </div>
          ) : (
            <>
              <button type="button" onClick={() => { setScreen('login'); setErr(''); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', padding: 0 }}>
                ← Back to Login
              </button>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Key size={32} color="#0ea5e9" />
                </div>
                <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '800' }}>Activate Account</h2>
                <p style={{ color: '#475569', fontSize: '14px', marginTop: '8px' }}>Enter the code sent to your email to activate your admin access.</p>
              </div>

              <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => setVerifyType('mall')}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: verifyType === 'mall' ? 'white' : 'transparent', color: verifyType === 'mall' ? '#0f172a' : '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: verifyType === 'mall' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                >
                  Mall Admin
                </button>
                <button 
                  type="button" 
                  onClick={() => setVerifyType('store')}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: verifyType === 'store' ? 'white' : 'transparent', color: verifyType === 'store' ? '#0f172a' : '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: verifyType === 'store' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                >
                  Store Admin
                </button>
              </div>

              <form onSubmit={handleVerify}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Email Address</label>
                  <input style={inputStyle} type="email" placeholder="your@email.com" value={verifyEmail} onChange={e => setVerifyEmail(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Invite Code</label>
                  <input style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: '900' }} placeholder="_ _ _ _ _ _" value={verifyCode} onChange={e => setVerifyCode(e.target.value.toUpperCase())} required />
                </div>
                {err && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#ef4444', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>{err}</div>}
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', fontSize: '16px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Activating...' : 'Verify & Activate'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg-animated" style={bgStyle}>
      <div className="animate-fade" style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '3px', color: '#0ea5e9', textTransform: 'uppercase', marginBottom: '12px' }}>Command Center</div>
          <img src={mallifyLogo} alt="Mallify" style={{ height: '100px', width: '310px', objectFit: 'contain', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Admin Dashboard — Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email Address</label>
            <input id="login-email" style={inputStyle} type="email" placeholder="admin@mallify.com" value={email} onChange={e => setEmail(e.target.value)} required onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <input id="login-password" style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'} />
          </div>
          {err && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#ef4444', fontSize: '13px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><X size={16} /> {err}</div>}
          <button id="login-btn" type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', fontSize: '16px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 24px rgba(14,165,233,0.35)', transition: 'all 0.3s', marginBottom: '24px' }}>
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '24px' }}>
          <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', marginBottom: '16px' }}>New to Mallify? Apply for access</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button id="register-mall-btn" type="button" onClick={() => { setScreen('register-mall'); setErr(''); }}
              style={{ padding: '14px', borderRadius: '12px', border: '1.5px solid rgba(37,99,235,0.4)', background: 'rgba(37,99,235,0.04)', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.target.style.background = 'rgba(37,99,235,0.1)'; e.target.style.borderColor = '#1d4ed8'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(37,99,235,0.04)'; e.target.style.borderColor = 'rgba(37,99,235,0.4)'; }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Building2 size={22} />
                <span>Register as<br /><strong>Mall Admin</strong></span>
              </div>
            </button>
            <button id="register-store-btn" type="button" onClick={() => { setScreen('register-store'); setErr(''); }}
              style={{ padding: '14px', borderRadius: '12px', border: '1.5px solid rgba(14,165,233,0.4)', background: 'rgba(14,165,233,0.04)', color: '#0ea5e9', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.target.style.background = 'rgba(14,165,233,0.1)'; e.target.style.borderColor = '#0284c7'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(14,165,233,0.04)'; e.target.style.borderColor = 'rgba(14,165,233,0.4)'; }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Store size={22} />
                <span>Register as<br /><strong>Store Admin</strong></span>
              </div>
            </button>
          </div>
          <button type="button" onClick={() => setScreen('verify-code')} style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.1)', background: 'white', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.3s' }}>
            Received a code? <strong>Activate Account</strong>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ stats, user }) {
  const userRole = user?.role || (user?.admin_type === 'mall' ? 'mall_admin' : (user?.admin_type === 'store' ? 'store_admin' : (user?.admin_type === 'system' ? 'system_admin' : 'user')));
  const isSystemAdmin = userRole === 'system_admin';
  const isStoreAdmin = userRole === 'store_admin';

  let cards = [];

  if (isSystemAdmin) {
    cards = [
      { label: 'Total Users', value: stats.totalUsers || 0, icon: <Users />, accent: '#10B981', bg: '#D1FAE5' },
      { label: 'Regular Users', value: stats.regularUsers || 0, icon: <Users />, accent: '#6366F1', bg: '#E0E7FF' },
      { label: 'Total Malls', value: stats.totalMalls || 0, icon: <MapPin />, accent: '#8B5CF6', bg: '#EDE9FE' },
      { label: 'Total Stores', value: stats.totalStores || 0, icon: <Store />, accent: '#F97316', bg: '#FFF7ED' },
      { label: 'Total Products', value: stats.totalProducts || 0, icon: <Package />, accent: '#EC4899', bg: '#FCE7F3' },
    ];
  } else if (isStoreAdmin) {
    cards = [
      { label: 'My Stores', value: stats.totalStores, icon: <Store />, accent: '#10B981', bg: '#D1FAE5' },
      { label: 'Total Products', value: stats.totalProducts, icon: <Package />, accent: '#3B82F6', bg: '#DBEAFE' },
      { label: 'Product Types', value: stats.totalCategories, icon: <Plus />, accent: '#F59E0B', bg: '#FEF3C7' },
      { label: 'Active Discounts', value: stats.totalDiscounts, icon: <Check />, accent: '#6366F1', bg: '#E0E7FF' },
    ];
  } else if (userRole === 'mall_admin') {
    cards = [
      { label: 'Total Malls', value: stats.totalMalls || 0, icon: <MapPin />, accent: '#3B82F6', bg: '#DBEAFE' },
      { label: 'Total Stores', value: stats.totalStores || 0, icon: <Store />, accent: '#10B981', bg: '#D1FAE5' },
      { label: 'Total Products', value: stats.totalProducts || 0, icon: <Package />, accent: '#F59E0B', bg: '#FEF3C7' },
    ];
  }

  return (
    <div className="stats-grid">
      {cards.map((c, i) => (
        <div
          key={i}
          className="stat-card animate-fade"
          style={{
            animationDelay: `${i * 0.1}s`,
            '--card-accent': c.accent,
            '--card-bg': c.bg,
            '--card-shadow': `${c.accent}33`
          }}
        >
          <div className="stat-icon">{c.icon}</div>
          <div className="stat-info">
            <h3>{c.label}</h3>
            <p>{c.value || 0}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DataRenderer({ tab, items, setItems, token, user, refresh, onEdit, onAssignmentRequest }) {
  const userRole = user?.role || (user?.admin_type === 'mall' ? 'mall_admin' : (user?.admin_type === 'store' ? 'store_admin' : (user?.admin_type === 'system' ? 'system_admin' : 'user')));
  if (items.length === 0) return <p style={{ color: 'var(--text-muted)' }}>No items found.</p>;

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const handleDelete = async (id, path) => {
    try {
      // Optimistic Update: Handle both flat and nested lists
      setItems(prevItems => {
        return prevItems.map(item => {
          // If this is an owner with nested stores
          if (item.stores) {
            return {
              ...item,
              stores: item.stores.filter(s => s.id !== id)
            };
          }
          return item;
        }).filter(item => {
          // Keep item if it's not the one being deleted (for flat lists)
          // OR if it's an owner who still has stores (optional, but keeps UI clean)
          return (item.id || item.user_id) !== id;
        });
      });

      await axios.delete(`${API_BASE}/${path === 'discountCode' ? 'discount' : path}/${id}`, config);
      // Wait for the server to finish, then trigger the full sync
      await refresh();
    } catch (err) {
      console.error(err);
      refresh(); // Re-sync if it failed
    }
  };

  const [processingIds, setProcessingIds] = useState(new Set());
  const [assignmentModalData, setAssignmentModalData] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState('');

  const handleAction = async (id, action) => {
    if (processingIds.has(id)) return;
    try {
      setProcessingIds(prev => new Set(prev).add(id));
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Reusing the same endpoint for both mall and system admin actions where possible
      await axios.put(`${API_BASE}/auth/admins/requests/${id}/${action}`, { user_id: user?.id }, config);
      await refresh();
    } catch (err) {
      console.error(err);
      setGlobalError(err.response?.data?.error || err.response?.data?.message || "Action failed.");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleMallRequestAction = async (store_id, mall_id, action) => {
    if (processingIds.has(store_id)) return;
    try {
      setProcessingIds(prev => new Set(prev).add(store_id));
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_BASE}/storeMall/requests/${store_id}/${mall_id}/${action}`, {}, config);
      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(store_id);
        return next;
      });
    }
  };

  const handleRoleRequestAction = async (id, type, action) => {
    if (processingIds.has(id)) return;
    try {
      setProcessingIds(prev => new Set(prev).add(id));
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (userRole === 'mall_admin' && type === 'store') {
        // Mall admins use the auth/admins/requests endpoint for store requests
        await axios.put(`${API_BASE}/auth/admins/requests/${id}/${action}`, { user_id: user?.id }, config);
      } else {
        // System admins use the system-admin endpoints
        await axios.post(`${API_BASE}/system-admin/${action}-${type}/${id}`, {}, config);
      }
      await refresh();
    } catch (err) {
      console.error(err);
      setGlobalError(err.response?.data?.error || err.response?.data?.message || "Failed to process request. Please try again.");
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

function Modal({ tab, item, token, onClose, refresh, user }) {
  const [formData, setFormData] = useState(item || {});
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(item?.image_url ? `${API_BASE}/${item.image_url}` : null);
  const [ownedStores, setOwnedStores] = useState([]);

  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if ((tab === 'products' || tab === 'discounts') && user?.role === 'store_admin') {
      const fetchOwnedStores = async () => {
        try {
          const res = await axios.get(`${API_BASE}/store`, { headers: { Authorization: `Bearer ${token}` } });
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
  }, [tab, user, token]);


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
  const modalContentRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
        // This is for clicking outside the modal entirely, which is already handled by overlay
      }
      
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
      axios.get(`${API_BASE}/product`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setProductList(res.data))
        .catch(err => console.error(err));
    }
  }, [tab, token]);

  useEffect(() => {
    if (tab === 'discounts' && currentTarget.product_id) {
      axios.get(`${API_BASE}/productCategory?product_id=${currentTarget.product_id}&skipDiscounted=true`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setTargetCategories(res.data))
        .catch(err => console.error(err));
    } else {
      setTargetCategories([]);
    }
  }, [currentTarget.product_id, token, tab]);

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
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (tab === 'malls') {
        const data = new FormData();
        if (formData.mall_name) data.append('mall_name', formData.mall_name);
        if (file) data.append('image_url', file);
        if (item) await axios.put(`${API_BASE}/mall/${item.id}`, data, config);
        else await axios.post(`${API_BASE}/mall`, data, config);
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

        if (item) await axios.put(`${API_BASE}/store/${item.id}`, data, config);
        else await axios.post(`${API_BASE}/store`, data, config);
      }

      else if (tab === 'products') {
        const data = new FormData();
        if (formData.product_name) data.append('product_name', formData.product_name);
        if (file) data.append('image_url', file);
        if (formData.store_id) data.append('store_id', formData.store_id);

        if (item) await axios.put(`${API_BASE}/product/${item.id}`, data, config);
        else await axios.post(`${API_BASE}/product`, data, config);
      }
      else if (tab === 'product-categories') {
        const data = new FormData();
        if (formData.product_category_name) data.append('product_category_name', formData.product_category_name);
        if (formData.size) data.append('size', formData.size);
        if (formData.price) data.append('price', formData.price);
        if (formData.product_id) data.append('product_id', formData.product_id);
        if (file) data.append('image_url', file);

        if (item) await axios.put(`${API_BASE}/productCategory/${item.id}`, data, config);
        else await axios.post(`${API_BASE}/productCategory`, data, config);
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
        
        if (item) await axios.put(`${API_BASE}/discount/${item.id}`, payload, config);
        else await axios.post(`${API_BASE}/discount`, payload, config);
      }
      else if (['mall-admins', 'store-admins', 'mall-overview', 'store-overview'].includes(tab)) {
        const adminType = (tab === 'mall-admins' || tab === 'mall-overview') ? 'mall' : 'store';
        await axios.post(`${API_BASE}/admins`, { ...formData, admin_type: adminType }, config);
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
                    disabled={!!item}                    style={{ paddingRight: '40px' }}
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
                      {!selectedTargets.some(st => String(st.product_id) === String(currentTarget.product_id) && !st.product_category_id) && (
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
                      )}
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

export default App;
