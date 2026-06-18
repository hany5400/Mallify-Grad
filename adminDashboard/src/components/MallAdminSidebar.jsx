import React from 'react';
import { LayoutDashboard, MapPin, UserCheck, Store, LogOut } from 'lucide-react';
import './MallAdminSidebar.css';

function MallAdminSidebar({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <h2 className="logo-text">Mallify</h2>
      </div>

      {user && (
        <div className="sidebar-profile">
          <div className="sidebar-profile-info">
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
        <li className={`menu-item ${activeTab === 'malls' ? 'active' : ''}`} onClick={() => setActiveTab('malls')}>
          <MapPin size={20} /> Mall
        </li>
        <li className={`menu-item ${activeTab === 'role-requests' ? 'active' : ''}`} onClick={() => setActiveTab('role-requests')}>
          <UserCheck size={20} /> Store Waitlist
        </li>
        <li className={`menu-item ${activeTab === 'stores' ? 'active' : ''}`} onClick={() => setActiveTab('stores')}>
          <Store size={20} /> Stores
        </li>
      </ul>
      
      <div className="sidebar-footer">
        <button className="btn btn-outline logout-btn" onClick={onLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </nav>
  );
}

export default MallAdminSidebar;
