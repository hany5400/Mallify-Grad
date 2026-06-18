import React from 'react';
import { LayoutDashboard, FileText, Shield, MapPin, Store, LogOut } from 'lucide-react';
import './SystemAdminSidebar.css';

function SystemAdminSidebar({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <h2 className="logo-text">Mallify</h2>
      </div>

      {user && (
        <div className="sidebar-profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="profile-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="profile-name">{user.name}</div>
              <div className="profile-code">{user.user_code || '---'}</div>
            </div>
          </div>
        </div>
      )}
      
      <ul className="sidebar-menu">
        <li className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={20} /> Dashboard
        </li>
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
      </ul>
      
      <div className="sidebar-footer">
        <button className="btn btn-outline" style={{ width: '100%' }} onClick={onLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </nav>
  );
}

export default SystemAdminSidebar;
