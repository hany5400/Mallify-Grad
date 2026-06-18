import React from 'react';
import { LayoutDashboard, Store, Package, Plus, Check, LogOut } from 'lucide-react';
import './StoreAdminSidebar.css';

function StoreAdminSidebar({ activeTab, setActiveTab, user, onLogout }) {
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
      </ul>
      
      <div className="sidebar-footer">
        <button className="btn btn-outline logout-btn" onClick={onLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </nav>
  );
}

export default StoreAdminSidebar;
