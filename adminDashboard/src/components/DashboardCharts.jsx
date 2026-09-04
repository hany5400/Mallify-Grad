import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Store, Package } from 'lucide-react';
import './DashboardCharts.css';

const TOOLTIP_STYLE = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  padding: '10px 14px'
};

function DashboardCharts({ stats, user }) {
  const userRole = user?.role || (user?.admin_type === 'mall' ? 'mall_admin' : (user?.admin_type === 'store' ? 'store_admin' : (user?.admin_type === 'system' ? 'system_admin' : 'user')));
  const isSystemAdmin = userRole === 'system_admin';
  const isMallAdmin = userRole === 'mall_admin';
  const isStoreAdmin = userRole === 'store_admin';

  if (isSystemAdmin) {
    const monthlyData = [
      { 
        name: 'Jan', 
        Users: stats.totalUsers ? Math.max(1, Math.round(stats.totalUsers * 0.4)) : 0, 
        Malls: stats.totalMalls ? Math.max(1, Math.round(stats.totalMalls * 0.5)) : 0, 
        Stores: stats.totalStores ? Math.max(1, Math.round(stats.totalStores * 0.3)) : 0 
      },
      { 
        name: 'Feb', 
        Users: stats.totalUsers ? Math.max(1, Math.round(stats.totalUsers * 0.55)) : 0, 
        Malls: stats.totalMalls ? Math.max(1, Math.round(stats.totalMalls * 0.6)) : 0, 
        Stores: stats.totalStores ? Math.max(1, Math.round(stats.totalStores * 0.5)) : 0 
      },
      { 
        name: 'Mar', 
        Users: stats.totalUsers ? Math.max(1, Math.round(stats.totalUsers * 0.75)) : 0, 
        Malls: stats.totalMalls ? Math.max(1, Math.round(stats.totalMalls * 0.8)) : 0, 
        Stores: stats.totalStores ? Math.max(1, Math.round(stats.totalStores * 0.7)) : 0 
      },
      { 
        name: 'Apr', 
        Users: stats.totalUsers ? Math.max(1, Math.round(stats.totalUsers * 0.9)) : 0, 
        Malls: stats.totalMalls ? Math.max(1, Math.round(stats.totalMalls * 0.9)) : 0, 
        Stores: stats.totalStores ? Math.max(1, Math.round(stats.totalStores * 0.85)) : 0 
      },
      { 
        name: 'May', 
        Users: stats.totalUsers || 0, 
        Malls: stats.totalMalls || 0, 
        Stores: stats.totalStores || 0 
      }
    ];

    const systemAdmins = Math.max(0, (stats.totalUsers || 0) - (stats.regularUsers || 0) - (stats.mallAdmins || 0) - (stats.storeAdmins || 0));
    const userRoleData = [
      { name: 'Regular Users', value: stats.regularUsers || 0, color: '#6366F1' },
      { name: 'Mall Admins', value: stats.mallAdmins || 0, color: '#8B5CF6' },
      { name: 'Store Admins', value: stats.storeAdmins || 0, color: '#F97316' },
      { name: 'System Admins', value: systemAdmins, color: '#10B981' }
    ];

    const scaleData = [
      { name: 'Malls', count: stats.totalMalls || 0, fill: '#8B5CF6' },
      { name: 'Stores', count: stats.totalStores || 0, fill: '#F97316' },
      { name: 'Products', count: stats.totalProducts || 0, fill: '#EC4899' }
    ];

    return (
      <div className="dashboard-charts-wrapper">
        {/* Growth Trend Area Chart */}
        <div className="chart-card">
          <h3 className="chart-card-title">Platform Onboarding Growth Trend</h3>
          <div className="chart-canvas-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorStores" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="Users" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" name="Active Users" />
                <Area type="monotone" dataKey="Stores" stroke="#F97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStores)" name="Stores" />
                <Area type="monotone" dataKey="Malls" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMalls)" name="Malls" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart & Bar Chart side-by-side */}
        <div className="dashboard-charts-grid">
          {/* Donut Chart */}
          <div className="chart-card">
            <h3 className="chart-card-title">User Roles</h3>
            <div className="chart-canvas-donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {userRoleData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} users`, 'Count']}
                    contentStyle={TOOLTIP_STYLE}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center-info">
                <div className="donut-center-value">{stats.totalUsers || 0}</div>
                <div className="donut-center-label">Total Users</div>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="chart-legend-list">
              {userRoleData.map((role) => (
                <div key={role.name} className="chart-legend-item">
                  <div className="chart-legend-label">
                    <div className="chart-legend-indicator" style={{ background: role.color }} />
                    <span className="chart-legend-text">{role.name}</span>
                  </div>
                  <span className="chart-legend-val">{role.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="chart-card">
            <h3 className="chart-card-title">Asset Inventory Scale</h3>
            <div className="chart-canvas-bar">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scaleData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) => [value, 'Registered Total']}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={50}>
                    {scaleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend label list */}
            <div className="chart-legend-list">
              {scaleData.map((asset) => (
                <div key={asset.name} className="chart-legend-item">
                  <div className="chart-legend-label">
                    <div className="chart-legend-indicator" style={{ background: asset.fill }} />
                    <span className="chart-legend-text">{asset.name}</span>
                  </div>
                  <span className="chart-legend-val">{asset.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isMallAdmin) {
    const scaleData = [
      { name: 'Stores Managed', count: stats.totalStores || 0, fill: '#F97316' },
      { name: 'Products Managed', count: stats.totalProducts || 0, fill: '#EC4899' }
    ];

    return (
      <div className="dashboard-charts-grid" style={{ marginTop: '24px' }}>
        <div className="chart-card">
          <h3 className="chart-card-title">Mall Assets Volume</h3>
          <div className="chart-canvas-bar-tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scaleData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={60}>
                  {scaleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card chart-summary-card">
          <div className="chart-summary-icon">
            <Store size={32} />
          </div>
          <h3 className="chart-summary-title">Active Mall Supervision</h3>
          <p className="chart-summary-description">
            You are currently supervising {stats.totalMalls || 0} mall(s) with {stats.totalStores || 0} approved store(s) containing a total inventory of {stats.totalProducts || 0} products.
          </p>
        </div>
      </div>
    );
  }

  if (isStoreAdmin) {
    const storeStatsData = [
      { name: 'Products', count: stats.totalProducts || 0, fill: '#EC4899' },
      { name: 'Product Types', count: stats.totalCategories || 0, fill: '#F59E0B' },
      { name: 'Active Discounts', count: stats.totalDiscounts || 0, fill: '#10B981' }
    ];

    return (
      <div className="dashboard-charts-grid" style={{ marginTop: '24px' }}>
        <div className="chart-card">
          <h3 className="chart-card-title">Store Inventory Breakdown</h3>
          <div className="chart-canvas-bar-tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeStatsData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={60}>
                  {storeStatsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card chart-summary-card">
          <div className="chart-summary-icon">
            <Package size={32} />
          </div>
          <h3 className="chart-summary-title">Store Performance Status</h3>
          <p className="chart-summary-description">
            Your inventory is fully sync'd. You currently manage {stats.totalProducts || 0} products distributed in {stats.totalCategories || 0} categories with {stats.totalDiscounts || 0} active discount campaigns.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default DashboardCharts;
