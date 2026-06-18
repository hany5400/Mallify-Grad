import React from 'react';
import { Users, Store, Package, MapPin, Plus, Check } from 'lucide-react';

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

export default StatsGrid;
